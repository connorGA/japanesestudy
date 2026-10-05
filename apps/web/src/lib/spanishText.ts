export function speakableSpanish(text: string) {
  return text.replace(/\s*\/\s*/g, ", ").replace(/…/g, "").trim();
}
