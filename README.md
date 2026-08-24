# Language Study

A multi-language learning studio with a shared progress dashboard and dedicated Japanese and
Italian experiences. Japanese includes its original realtime bilingual voice tutor, character
study, cached audio, passive listening, flashcards, games, and roleplay. Italian adds a tailored
realtime tutor, vocabulary and phrase flashcards, browser-native pronunciation, listening
scenarios, grammar guides, a verb lab, and arcade drills.

## Stack

- `apps/web`: Next.js, React, TypeScript, Tailwind
- `apps/api`: FastAPI orchestration service
- `supabase`: Postgres schema, RLS policies, and storage setup

## Local Development

1. Copy `.env.example` values into `.env`.
2. Install frontend dependencies with `npm install`.
3. Create a Python virtualenv and install API dependencies:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -e "apps/api[dev]"
   ```

4. Run both apps:

   ```bash
   npm run dev
   ```

The web app runs on `http://localhost:3005` and the API runs on `http://localhost:8005`.

## Progress and study points

The dashboard heatmaps and totals are rebuilt from progress events stored in Supabase. This
single-user app uses one shared learner identity, so every device connected to the same deployment
reads and writes the same progress history without requiring sign-in. `localStorage` is only an
optimistic cache and offline retry queue; the API remains the source of truth and idempotent event
IDs prevent a retry from awarding points twice.

| Practice activity | Points | Daily scored actions |
| --- | ---: | ---: |
| Flashcard marked for retry | 1 | 50 |
| Flashcard mastered | 3 | 50 |
| Pronunciation playback | 1 | 20 |
| Italian verb-form practice | 1 | 30 |
| Listening line completed | 2 | 30 |
| Passive-listening item completed | 3 | 20 |
| Correct arcade answer | 2 | 60 |
| SRS review graded | 3 | 40 |
| Realtime tutor turn | 4 | 20 |
| Roleplay turn | 4 | 20 |

Each language is capped at 250 points per local calendar day. Navigation and passive page views do
not award points.
