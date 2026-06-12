import 'dotenv/config';
import { GoogleGenAI, Modality } from '@google/genai';
import Fastify from 'fastify';
import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_LIVE_TRANSLATE_MODEL: z.string().min(1).default('gemini-3.5-live-translate-preview'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().max(65535).default(8787),
});

const liveTokenBodySchema = z.object({
  targetLanguageCode: z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/),
  echoTargetLanguage: z.boolean().optional().default(false),
});

const missingApiKeyError = 'Missing Gemini API key. Set GEMINI_API_KEY in .env. Google Cloud auth is not supported for Live API ephemeral tokens.';
const env = envSchema.parse(process.env);
const model = env.GEMINI_LIVE_TRANSLATE_MODEL.replace(/^models\//, '');

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  bodyLimit: 32 * 1024,
  trustProxy: true,
});

function getClient() {
  return new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
    httpOptions: { apiVersion: 'v1alpha' },
  });
}

app.get('/healthz', async () => ({
  ok: true,
}));

app.get('/readyz', async (_request, reply) => {
  if (!env.GEMINI_API_KEY) {
    return reply.code(503).send({ ok: false, error: 'Missing GEMINI_API_KEY.' });
  }

  return { ok: true, model };
});

app.get('/api/health', async () => ({
  ok: true,
  model,
  auth: 'gemini-api-key',
}));

app.post('/api/live-token', async (request, reply) => {
  const parsedBody = liveTokenBodySchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.code(400).send({
      error: 'Invalid live token request.',
      issues: parsedBody.error.flatten().fieldErrors,
    });
  }

  if (!env.GEMINI_API_KEY) {
    return reply.code(500).send({ error: missingApiKeyError });
  }

  try {
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
              triggerTokens: '0',
              slidingWindow: { targetTokens: '0' },
            },
            translationConfig: {
              targetLanguageCode: parsedBody.data.targetLanguageCode,
              echoTargetLanguage: parsedBody.data.echoTargetLanguage,
            },
          },
        },
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });

    if (!token.name) {
      return reply.code(502).send({ error: 'Gemini did not return an ephemeral token.' });
    }

    return { token: token.name, model, expireTime };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    request.log.error({ err: error }, 'Failed to create Gemini live token');

    return reply.code(500).send({ error: message });
  }
});

async function start() {
  try {
    await app.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, 'Shutting down token server');
  await app.close();
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

void start();
