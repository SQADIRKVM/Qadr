import type { AIProvider } from './types';

const getProvider = (): AIProvider =>
  (process.env.EXPO_PUBLIC_AI_PROVIDER as AIProvider) || 'groq';

const getConfig = () => {
  const provider = getProvider();
  if (provider === 'ollama') {
    return {
      baseURL: process.env.EXPO_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      apiKey: 'ollama',
      model: process.env.EXPO_PUBLIC_OLLAMA_MODEL || 'llama3.2',
    };
  }
  return {
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
    model: process.env.EXPO_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile',
  };
};

export type VisionContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

const GROQ_VISION_MODEL_DEFAULT = 'meta-llama/llama-4-scout-17b-16e-instruct';

/** Groq requires the meta-llama/ prefix; accept short env aliases. */
export function normalizeGroqVisionModel(raw?: string): string {
  const model = raw?.trim() || GROQ_VISION_MODEL_DEFAULT;
  if (model.startsWith('meta-llama/')) return model;
  if (model === 'llama-4-scout-17b-16e-instruct') {
    return 'meta-llama/llama-4-scout-17b-16e-instruct';
  }
  if (model === 'llama-3.2-90b-vision-preview' || model === 'llama-3.2-11b-vision-preview') {
    return GROQ_VISION_MODEL_DEFAULT;
  }
  return model;
}

const getVisionModel = () => normalizeGroqVisionModel(process.env.EXPO_PUBLIC_GROQ_VISION_MODEL);

export const visionChatCompletion = async (
  system: string,
  userContent: VisionContentPart[],
): Promise<string> => {
  const { baseURL, apiKey } = getConfig();
  const model = getVisionModel();
  if (!apiKey && getProvider() === 'groq') {
    throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY');
  }
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Vision AI request failed');
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
};

export const chatCompletion = async (
  system: string,
  user: string,
): Promise<string> => {
  const { baseURL, apiKey, model } = getConfig();
  if (!apiKey && getProvider() === 'groq') {
    throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY');
  }
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'AI request failed');
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
};

export const hasAIConfigured = (): boolean => {
  const provider = getProvider();
  if (provider === 'ollama') return true;
  return Boolean(process.env.EXPO_PUBLIC_GROQ_API_KEY);
};

export const transcribeGroqAudio = async (
  videoUrl: string,
  apiKey: string,
): Promise<string> => {
  let response;
  try {
    response = await fetch(videoUrl);
  } catch (e) {
    const proxyBase = process.env.EXPO_PUBLIC_CONTENT_EXTRACT_URL?.trim();
    if (proxyBase) {
      const sep = proxyBase.includes('?') ? '&' : '?';
      const proxyUrl = `${proxyBase}proxy${sep}url=${encodeURIComponent(videoUrl)}`;
      response = await fetch(proxyUrl);
    } else {
      throw e;
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch video file: ${response.status}`);
  }
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', blob, 'video.mp4');
  formData.append('model', 'whisper-large-v3');

  const { baseURL } = getConfig();
  const res = await fetch(`${baseURL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq Whisper transcription failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.text || '';
};
