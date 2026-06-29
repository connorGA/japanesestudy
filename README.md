# Japanese Study

AI-assisted Japanese study app with tutor chat, structured grammar explanations, cached pronunciation audio, spaced repetition, listening practice, and scenario roleplay.

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

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:8000`.
