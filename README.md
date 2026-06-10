# Dein Babelfischi

Dein Babelfischi is a real-time speech translation app built with React, Vite, Node, and the Google Gen AI SDK. It uses Gemini 3.5 Live Translate to listen to spoken audio, automatically detect the input language, and stream translated speech into one selected target language.

## What changed

- You only choose the target language.
- The model detects the input language automatically.
- `Echo target language` controls whether speech already spoken in the target language is repeated back.
- Secrets stay on the local Node backend. The browser only receives short-lived Live API tokens.

## Requirements

- Node.js 20 or newer
- npm
- A Gemini API key, or Google Cloud credentials for Gemini Enterprise Agent Platform
- A browser with microphone access

## Quick Start With a Gemini API Key

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

3. Open `.env` and paste your key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_GENAI_USE_ENTERPRISE=False
```

4. Start the app:

```bash
npm run dev
```

5. Open:

[http://localhost:3000](http://localhost:3000)

The backend token server runs on:

[http://localhost:8787/api/health](http://localhost:8787/api/health)

## Gemini Enterprise Agent Platform Setup

Use this setup when you want Google Cloud authentication instead of a Gemini API key.

1. Log in with Application Default Credentials:

```bash
gcloud auth application-default login
```

2. Set `.env` like this:

```env
GEMINI_API_KEY=
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_ENTERPRISE=True
GEMINI_LIVE_TRANSLATE_MODEL=gemini-3.5-live-translate-preview
```

3. Restart the app:

```bash
npm run dev
```

## Environment Files and Secrets

`.env` is ignored by Git and must never be committed.

Use `.env.example` as the safe template for open source:

```env
GEMINI_API_KEY=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_ENTERPRISE=False
GEMINI_LIVE_TRANSLATE_MODEL=gemini-3.5-live-translate-preview
```

## Scripts

```bash
npm run dev
```

Starts both the Node token backend and the Vite frontend.

```bash
npm run server
```

Starts only the backend token server.

```bash
npm run dev:vite
```

Starts only the Vite frontend.

```bash
npm run build
```

Builds the frontend for production.

## How It Works

1. The frontend asks the local backend for a short-lived Live API token.
2. The backend creates the token using `@google/genai`.
3. The frontend opens a Gemini Live API session with `gemini-3.5-live-translate-preview`.
4. Microphone audio is streamed as raw 16 kHz PCM.
5. Gemini streams back translated 24 kHz PCM audio plus input/output transcripts.
6. The app plays translated audio and keeps a replayable conversation history.

## Project Structure

```text
.
|-- App.tsx
|-- components/
|   |-- BottomControls.tsx
|   `-- ConversationBubble.tsx
|-- hooks/
|   `-- useLiveMicrophone.ts
|-- services/
|   `-- liveTranslateService.ts
|-- utils/
|   `-- pcmAudioQueue.ts
|-- server.mjs
|-- scripts/
|   `-- dev.mjs
|-- types.ts
`-- vite.config.ts
```

## Troubleshooting

If the app says token creation failed, check `.env` and restart `npm run dev`.

If microphone access fails, allow microphone permissions in your browser.

If Gemini Enterprise Agent Platform setup fails, confirm your Google Cloud project has access to Gemini Live Translate and that `gcloud auth application-default login` completed successfully.

If port `3000` or `8787` is already in use, stop the old process and rerun `npm run dev`.
