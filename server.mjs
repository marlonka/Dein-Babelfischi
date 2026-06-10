import 'dotenv/config';
import express from 'express';
import { GoogleGenAI, Modality } from '@google/genai';

const app = express();
const port = Number(process.env.PORT ?? 8787);
const defaultModel = 'gemini-3.5-live-translate-preview';
const model = (process.env.GEMINI_LIVE_TRANSLATE_MODEL ?? defaultModel).replace(/^models\//, '');

app.use(express.json({ limit: '32kb' }));

const allowedLanguageCodePattern = /^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/;

function normalizeEchoTargetLanguage(value) {
  return value === true;
}

function getClient() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global';
  const useEnterprise = String(process.env.GOOGLE_GENAI_USE_ENTERPRISE ?? '').toLowerCase() === 'true';

  if (useEnterprise && project) {
    return new GoogleGenAI({
      enterprise: true,
      project,
      location,
      httpOptions: { apiVersion: 'v1alpha' },
    });
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { apiVersion: 'v1alpha' },
  });
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    model,
    enterprise: String(process.env.GOOGLE_GENAI_USE_ENTERPRISE ?? '').toLowerCase() === 'true',
    location: process.env.GOOGLE_CLOUD_LOCATION ?? 'global',
  });
});

app.post('/api/live-token', async (req, res) => {
  try {
    const targetLanguageCode = String(req.body?.targetLanguageCode ?? '').trim();
    const echoTargetLanguage = normalizeEchoTargetLanguage(req.body?.echoTargetLanguage);

    if (!allowedLanguageCodePattern.test(targetLanguageCode)) {
      res.status(400).json({ error: 'Invalid targetLanguageCode.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_CLOUD_PROJECT) {
      res.status(500).json({
        error: 'Missing Gemini credentials. Set GEMINI_API_KEY or GOOGLE_CLOUD_PROJECT with Google Cloud ADC.',
      });
      return;
    }

    const client = getClient();
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString();

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            contextWindowCompression: {
              triggerTokens: 0,
              slidingWindow: { targetTokens: 0 },
            },
            translationConfig: {
              targetLanguageCode,
              echoTargetLanguage,
            },
          },
        },
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });

    if (!token.name) {
      res.status(502).json({ error: 'Gemini did not return an ephemeral token.' });
      return;
    }

    res.json({
      token: token.name,
      model,
      expireTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[live-token] Failed to create token:', message);
    res.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`[server] Dein Babelfischi token server listening on http://localhost:${port}`);
});
