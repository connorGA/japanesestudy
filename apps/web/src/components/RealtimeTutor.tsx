"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  CircleStop,
  CircleDollarSign,
  Download,
  LoaderCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { createRealtimeTutorSession } from "@/lib/api";
import { isPlayInterruptedError } from "@/lib/audioPlayback";
import { recordStudyActivity } from "@/lib/progress";

type SessionState = "disconnected" | "connecting" | "connected" | "listening" | "speaking";
type TranscriptEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  turn: number;
};

const tutorConfig = {
  japanese: {
    name: "Japanese",
    clientKey: "japanese-study.realtime-client-id",
    starters: [
      "Let's roleplay ordering at a restaurant.",
      "Help me practice a simple self-introduction.",
      "Ask me beginner questions in Japanese.",
    ],
  },
  italian: {
    name: "Italian",
    clientKey: "italian-study.realtime-client-id",
    starters: [
      "Let's roleplay ordering at an Italian café.",
      "Help me practice a simple self-introduction.",
      "Ask me beginner questions in Italian.",
    ],
  },
} as const;

const REALTIME_PRICING_PER_MILLION = {
  audioInput: 32,
  cachedAudioInput: 0.4,
  audioOutput: 64,
  textInput: 4,
  cachedTextInput: 0.4,
  textOutput: 24,
};
const TRANSCRIPTION_COST_PER_MINUTE = 0.003;

export function RealtimeTutor({ language = "japanese" }: { language?: keyof typeof tutorConfig }) {
  const config = tutorConfig[language];
  const [sessionState, setSessionState] = useState<SessionState>("disconnected");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [realtimeCost, setRealtimeCost] = useState(0);
  const [transcriptionCost, setTranscriptionCost] = useState(0);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const assistantDraftRef = useRef("");
  const assistantDraftIdRef = useRef<string | null>(null);
  const speechStartRef = useRef<{ audioMs?: number; wallMs: number } | null>(null);
  const transcriptIdsRef = useRef(new Set<string>());
  const turnRef = useRef(0);
  const activeTurnRef = useRef(0);
  const assistantTurnRef = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const connected = ["connected", "listening", "speaking"].includes(sessionState);
  const sessionCost = realtimeCost + transcriptionCost;

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => () => closeTransport(), []);

  async function startSession() {
    closeTransport();
    setSessionState("connecting");
    setError("");
    setMuted(false);
    setRealtimeCost(0);
    setTranscriptionCost(0);
    setTranscript([]);
    transcriptIdsRef.current.clear();
    turnRef.current = 0;
    activeTurnRef.current = 0;
    assistantTurnRef.current = 0;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support microphone access.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const token = await createRealtimeTutorSession(getClientId(config.clientKey), language);
      if (!token.value) {
        throw new Error("The tutor session did not return a connection token.");
      }

      const peer = new RTCPeerConnection();
      peerRef.current = peer;

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "");
      audioRef.current = audio;
      peer.ontrack = (event) => {
        audio.srcObject = event.streams[0];
        void audio.play().catch((error) => {
          if (isPlayInterruptedError(error)) return;
          setError("Audio playback was blocked. Click the page and start the session again.");
        });
      };

      stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

      const channel = peer.createDataChannel("oai-events");
      channelRef.current = channel;
      channel.addEventListener("open", () => setSessionState("connected"));
      channel.addEventListener("message", handleRealtimeEvent);
      channel.addEventListener("close", () => {
        if (peerRef.current) setSessionState("disconnected");
      });

      peer.addEventListener("connectionstatechange", () => {
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
          setError("The realtime connection was lost. Start a new session to reconnect.");
          closeTransport();
          setSessionState("disconnected");
        }
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const response = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "Could not establish the realtime connection.");
      }

      await peer.setRemoteDescription({
        type: "answer",
        sdp: await response.text(),
      });
    } catch (err) {
      closeTransport();
      setSessionState("disconnected");
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access was denied. Allow microphone access, then try again.");
      } else {
        setError(err instanceof Error ? err.message : "Could not start the realtime tutor.");
      }
    }
  }

  function handleRealtimeEvent(message: MessageEvent<string>) {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(message.data) as Record<string, unknown>;
    } catch {
      return;
    }

    const type = String(event.type ?? "");
    if (type === "input_audio_buffer.speech_started") {
      speechStartRef.current = {
        audioMs: numberOrUndefined(event.audio_start_ms),
        wallMs: performance.now(),
      };
      beginTurn();
      setSessionState("listening");
      return;
    }
    if (type === "input_audio_buffer.speech_stopped") {
      const started = speechStartRef.current;
      if (started) {
        const audioEndMs = numberOrUndefined(event.audio_end_ms);
        const durationMs =
          audioEndMs !== undefined && started.audioMs !== undefined
            ? Math.max(0, audioEndMs - started.audioMs)
            : Math.max(0, performance.now() - started.wallMs);
        setTranscriptionCost(
          (cost) => cost + (durationMs / 60_000) * TRANSCRIPTION_COST_PER_MINUTE,
        );
      }
      speechStartRef.current = null;
      return;
    }
    if (type === "response.created") {
      assistantTurnRef.current = activeTurnRef.current || beginTurn();
      setSessionState("speaking");
      return;
    }
    if (type === "response.done") {
      setRealtimeCost((cost) => cost + calculateRealtimeResponseCost(event.response));
      setSessionState("connected");
      return;
    }
    if (type === "conversation.item.input_audio_transcription.completed") {
      const itemId = String(event.item_id ?? crypto.randomUUID());
      upsertUserTranscript(
        itemId,
        String(event.transcript ?? ""),
        activeTurnRef.current || beginTurn(),
      );
      recordStudyActivity(language, "tutor_turn", "realtime_tutor", {
        input: "voice",
        item_id: itemId,
      });
      return;
    }
    if (type === "response.output_audio_transcript.delta") {
      const id = String(
        event.item_id ??
          event.response_id ??
          assistantDraftIdRef.current ??
          crypto.randomUUID(),
      );
      assistantDraftIdRef.current = id;
      assistantDraftRef.current += String(event.delta ?? "");
      upsertAssistantTranscript(id, assistantDraftRef.current);
      return;
    }
    if (type === "response.output_audio_transcript.done") {
      const text = String(event.transcript ?? assistantDraftRef.current);
      const id = String(
        event.item_id ??
          event.response_id ??
          assistantDraftIdRef.current ??
          crypto.randomUUID(),
      );
      upsertAssistantTranscript(id, text);
      assistantDraftRef.current = "";
      assistantDraftIdRef.current = null;
      return;
    }
    if (type === "error") {
      const detail = event.error as { message?: string } | undefined;
      setError(detail?.message ?? "The realtime tutor reported an error.");
    }
  }

  function beginTurn() {
    turnRef.current += 1;
    activeTurnRef.current = turnRef.current;
    return activeTurnRef.current;
  }

  function appendTranscript(
    id: string,
    role: TranscriptEntry["role"],
    text: string,
    turn = activeTurnRef.current || beginTurn(),
  ) {
    const normalized = text.trim();
    if (!normalized || transcriptIdsRef.current.has(id)) return;
    transcriptIdsRef.current.add(id);
    setTranscript((items) => [...items, { id, role, text: normalized, turn }]);
  }

  function upsertUserTranscript(id: string, text: string, turn: number) {
    const normalized = text.trim();
    if (!normalized) return;

    transcriptIdsRef.current.add(id);
    setTranscript((items) => {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return [...items, { id, role: "user", text: normalized, turn }];
      }

      return items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, text: normalized, turn } : item,
      );
    });
  }

  function upsertAssistantTranscript(id: string, text: string) {
    const normalized = text.trimStart();
    if (!normalized) return;

    const turn = assistantTurnRef.current || activeTurnRef.current || beginTurn();
    transcriptIdsRef.current.add(id);
    setTranscript((items) => {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return [...items, { id, role: "assistant", text: normalized, turn }];
      }

      return items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, text: normalized } : item,
      );
    });
  }

  function sortTranscript(items: TranscriptEntry[]) {
    return [...items].sort((left, right) => {
      if (left.turn !== right.turn) return left.turn - right.turn;
      if (left.role === right.role) return 0;
      return left.role === "user" ? -1 : 1;
    });
  }

  function toggleMute() {
    const nextMuted = !muted;
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  }

  function sendText(text: string) {
    const normalized = text.trim();
    const channel = channelRef.current;
    if (!normalized || !channel || channel.readyState !== "open") return;

    const id = crypto.randomUUID();
    const turn = beginTurn();
    appendTranscript(id, "user", normalized, turn);
    channel.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: normalized }],
        },
      }),
    );
    channel.send(JSON.stringify({ type: "response.create" }));
    recordStudyActivity(language, "tutor_turn", "realtime_tutor", {
      input: "text",
      item_id: id,
    });
    setInput("");
  }

  function submitText(event: FormEvent) {
    event.preventDefault();
    sendText(input);
  }

  function stopSession() {
    closeTransport();
    setSessionState("disconnected");
    setMuted(false);
  }

  function downloadTranscript() {
    if (!transcript.length) return;

    const body = sortTranscript(transcript)
      .map((entry) => `${entry.role === "user" ? "You" : "Tutor"}:\n${entry.text}`)
      .join("\n\n");
    const contents = [
      `${config.name} Tutor Conversation`,
      new Date().toLocaleString(),
      `Estimated session cost: ${formatSessionCost(sessionCost)}`,
      "—".repeat(32),
      body,
    ].join("\n\n");
    const url = URL.createObjectURL(new Blob([contents], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${language}-tutor-transcript-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function closeTransport() {
    channelRef.current?.close();
    channelRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
      audioRef.current = null;
    }
    assistantDraftRef.current = "";
    assistantDraftIdRef.current = null;
    speechStartRef.current = null;
  }

  return (
    <section className="relative flex min-h-[30rem] flex-1 flex-col overflow-visible rounded-3xl border border-black/5 bg-white/80 shadow-sm backdrop-blur sm:min-h-[34rem] lg:min-h-0 lg:overflow-hidden">
      <header className="sticky top-[4.5rem] z-10 flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-t-3xl border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:top-0">
        <div>
          <h2 className="font-bold text-ink">Conversation</h2>
          <p className="mt-0.5 text-xs text-slate-500">English and {config.name} transcript</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="group relative" tabIndex={0}>
            <div
              aria-label={`Estimated session cost ${formatSessionCost(sessionCost)}`}
              aria-live="polite"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-black/10 bg-white px-3 text-xs font-semibold tabular-nums text-slate-700 outline-none transition hover:border-matcha/40 focus:border-matcha/60"
              role="status"
            >
              <CircleDollarSign className="h-4 w-4 text-matcha" />
              {formatSessionCost(sessionCost)}
            </div>
            <div
              className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-[min(16rem,calc(100vw-2rem))] translate-y-1 rounded-2xl bg-ink px-4 py-3 text-xs leading-5 text-white opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 sm:left-auto sm:right-0 sm:w-64"
              role="tooltip"
            >
              <p className="font-semibold">Estimated OpenAI cost this session</p>
              <p className="mt-1 text-white/70">
                Realtime: {formatSessionCost(realtimeCost)} · Transcription:{" "}
                {formatSessionCost(transcriptionCost)}
              </p>
              <p className="mt-1 text-white/60">
                Updates after each turn using current token rates. Your final invoice may vary.
              </p>
            </div>
          </div>

          {connected ? (
            <>
              <span
                className="inline-flex h-9 items-center gap-2 rounded-full bg-green-50 px-2.5 text-xs font-semibold text-green-700 sm:px-3"
                title={muted ? "Mic muted" : stateLabel(sessionState)}
              >
                {sessionState === "speaking" ? (
                  <Volume2 className="h-4 w-4" />
                ) : muted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {muted ? "Mic muted" : stateLabel(sessionState)}
                </span>
              </span>
              <button
                aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                className={twMerge(
                  "grid h-9 w-9 place-items-center rounded-full border transition",
                  muted
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-black/10 bg-white text-ink hover:bg-washi",
                )}
                onClick={toggleMute}
                type="button"
              >
                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                aria-label="End session"
                className="grid h-9 w-9 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                onClick={stopSession}
                type="button"
              >
                <CircleStop className="h-4 w-4" />
              </button>
            </>
          ) : null}

          <button
            aria-label="Download transcript"
            className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-slate-600 transition hover:bg-washi hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!transcript.length}
            onClick={downloadTranscript}
            title="Download transcript"
            type="button"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {!transcript.length ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <Mic className="mx-auto h-8 w-8 text-matcha/60" />
              <p className="mt-3 font-semibold text-ink">
                {connected ? "Start speaking whenever you are ready." : "A conversation starts with your voice."}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Ask a question in English or {config.name}, or describe the situation you want to
                practice.
              </p>
              {connected ? (
                <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
                  {config.starters.map((starter) => (
                    <button
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs text-slate-600 transition hover:border-matcha hover:text-ink"
                      key={starter}
                      onClick={() => sendText(starter)}
                      type="button"
                    >
                      “{starter}”
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {sortTranscript(transcript).map((entry) => (
          <div
            className={twMerge("flex", entry.role === "user" ? "justify-end" : "justify-start")}
            key={entry.id}
          >
            <div
              className={twMerge(
                "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6",
                entry.role === "user"
                  ? "rounded-br-md bg-ink text-white"
                  : "rounded-bl-md bg-washi text-slate-800",
              )}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
                {entry.role === "user" ? "You" : "Tutor"}
              </p>
              {entry.role === "assistant" ? (
                <StreamingTutorText text={entry.text} />
              ) : (
                entry.text
              )}
            </div>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      <form className="flex gap-2 border-t border-black/5 p-3 sm:p-4" onSubmit={submitText}>
        <input
          className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition focus:border-matcha sm:text-sm"
          disabled={!connected}
          onChange={(event) => setInput(event.target.value)}
          placeholder={connected ? "Type instead of speaking…" : "Start a session to chat"}
          value={input}
        />
        <button
          aria-label="Send message"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-matcha text-white transition hover:bg-matcha/90 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!connected || !input.trim()}
          type="submit"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {!connected ? (
        <div className="absolute inset-x-0 bottom-0 top-[4.5rem] z-20 grid place-items-center bg-ink/10 px-4 backdrop-blur-[2px] sm:px-5">
          <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white/95 p-6 text-center shadow-xl sm:p-7">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-matcha/10 text-matcha">
              <Mic className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-xl font-bold text-ink">Start a conversation</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Connect your microphone, then speak naturally in English or {config.name}.
            </p>
            {error ? <p className="mt-3 text-sm leading-5 text-red-700">{error}</p> : null}
            <button
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-wait disabled:bg-ink/70"
              disabled={sessionState === "connecting"}
              onClick={() => void startSession()}
              type="button"
            >
              {sessionState === "connecting" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              {sessionState === "connecting" ? "Connecting…" : "Start session"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StreamingTutorText({ text }: { text: string }) {
  const characters = Array.from(text);
  const [visibleCount, setVisibleCount] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
  }, [text]);

  useEffect(() => {
    if (visibleCount > characters.length) {
      setVisibleCount(characters.length);
      return;
    }

    if (visibleCount < characters.length) {
      const remaining = characters.length - visibleCount;
      const step = Math.min(3, Math.max(1, Math.ceil(remaining / 12)));
      const timeout = window.setTimeout(
        () => setVisibleCount((count) => Math.min(characters.length, count + step)),
        12,
      );
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => setSettled(true), 100);
    return () => window.clearTimeout(timeout);
  }, [characters.length, visibleCount]);

  return (
    <span>
      {characters.slice(0, visibleCount).map((character, index, visibleCharacters) => {
        const distanceFromEnd = visibleCharacters.length - index;
        const blur =
          !settled && distanceFromEnd <= 3 ? [0, 1.8, 1.1, 0.55][distanceFromEnd] : 0;
        return (
          <span
            className="transition-[filter,opacity] duration-100"
            key={`${index}-${character}`}
            style={{
              filter: `blur(${blur}px)`,
              opacity: blur ? 0.78 + distanceFromEnd * 0.06 : 1,
            }}
          >
            {character}
          </span>
        );
      })}
    </span>
  );
}

function calculateRealtimeResponseCost(value: unknown) {
  const response = recordOrEmpty(value);
  const usage = recordOrEmpty(response.usage);
  const inputDetails = recordOrEmpty(usage.input_token_details);
  const cachedDetails = recordOrEmpty(inputDetails.cached_tokens_details);
  const outputDetails = recordOrEmpty(usage.output_token_details);

  const inputTotal = numberOrZero(usage.input_tokens);
  const inputText = numberOrZero(inputDetails.text_tokens);
  const inputAudio = numberOrZero(inputDetails.audio_tokens);
  const cachedTotal = numberOrZero(inputDetails.cached_tokens);
  const cachedText = Math.min(inputText, numberOrZero(cachedDetails.text_tokens));
  const cachedAudio = Math.min(inputAudio, numberOrZero(cachedDetails.audio_tokens));
  let unclassifiedCached = Math.max(0, cachedTotal - cachedText - cachedAudio);

  const cachedTextFallback = Math.min(inputText - cachedText, unclassifiedCached);
  unclassifiedCached -= cachedTextFallback;
  const cachedAudioFallback = Math.min(inputAudio - cachedAudio, unclassifiedCached);
  const nonCachedText = Math.max(0, inputText - cachedText - cachedTextFallback);
  const nonCachedAudio = Math.max(0, inputAudio - cachedAudio - cachedAudioFallback);
  const accountedInput = inputText + inputAudio;
  const otherInput = Math.max(0, inputTotal - accountedInput);

  const outputTotal = numberOrZero(usage.output_tokens);
  const outputText = numberOrZero(outputDetails.text_tokens);
  const outputAudio = numberOrZero(outputDetails.audio_tokens);
  const otherOutput = Math.max(0, outputTotal - outputText - outputAudio);

  const inputCost =
    nonCachedText * REALTIME_PRICING_PER_MILLION.textInput +
    nonCachedAudio * REALTIME_PRICING_PER_MILLION.audioInput +
    cachedTotal * REALTIME_PRICING_PER_MILLION.cachedTextInput +
    otherInput * REALTIME_PRICING_PER_MILLION.textInput;
  const outputCost =
    outputText * REALTIME_PRICING_PER_MILLION.textOutput +
    outputAudio * REALTIME_PRICING_PER_MILLION.audioOutput +
    otherOutput * REALTIME_PRICING_PER_MILLION.textOutput;

  return (inputCost + outputCost) / 1_000_000;
}

function recordOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function formatSessionCost(cost: number) {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

function getClientId(key: string) {
  const stored = window.localStorage.getItem(key);
  if (stored) return stored;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

function stateLabel(state: SessionState) {
  switch (state) {
    case "connecting":
      return "Connecting";
    case "connected":
      return "Mic connected";
    case "listening":
      return "Listening";
    case "speaking":
      return "Tutor speaking";
    default:
      return "Not connected";
  }
}
