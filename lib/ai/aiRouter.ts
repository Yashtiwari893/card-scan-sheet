import Groq from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const PROMPT = `Extract the following fields from this business card image and return ONLY a valid JSON object with no extra text:
{
  "name": "",
  "company": "",
  "jobTitle": "",
  "email": "",
  "phone": "",
  "website": "",
  "address": "",
  "linkedin": ""
}
If a field is not found, leave it as empty string.`;

// --- PROVIDER 1: Groq ---
async function extractWithGroq(imageUrl: string) {
  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-3.2-90b-vision-preview', // User might have used a placeholder but 90b is good for vision
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: PROMPT }
        ]
      }
    ],
    max_tokens: 500,
  });
  const text = response.choices[0].message.content ?? '';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// --- PROVIDER 2: Mistral ---
async function extractWithMistral(imageUrl: string) {
  const response = await mistral.chat.complete({
    model: 'pixtral-12b-2409',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', imageUrl: imageUrl },
          { type: 'text', text: PROMPT }
        ]
      }
    ],
    maxTokens: 500,
  });
  const text = (response.choices?.[0]?.message?.content as string) ?? '';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// --- PROVIDER 3: Gemini (fallback) ---
async function extractWithGemini(imageUrl: string) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const imageResp = await fetch(imageUrl);
  const buffer = await imageResp.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = imageResp.headers.get('content-type') ?? 'image/jpeg';

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    PROMPT
  ]);
  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// --- MAIN ROUTER ---
export async function extractCard(imageUrl: string) {
  // Priority 1: Groq
  try {
    console.log('Trying Groq...');
    return await extractWithGroq(imageUrl);
  } catch (e) {
    console.warn('Groq failed:', e);
  }

  // Priority 2: Mistral
  try {
    console.log('Trying Mistral...');
    return await extractWithMistral(imageUrl);
  } catch (e) {
    console.warn('Mistral failed:', e);
  }

  // Priority 3: Gemini
  try {
    console.log('Trying Gemini...');
    return await extractWithGemini(imageUrl);
  } catch (e) {
    console.warn('Gemini failed:', e);
  }

  throw new Error('All AI providers failed');
}

// --- AUDIO TRANSCRIPTION (Groq Whisper) ---
export async function transcribeAudio(audioUrl: string) {
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob();

    // Groq SDK requires a file-like object with a name
    const file = new File([blob], 'recording.ogg', { type: blob.type || 'audio/ogg' });

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
      language: 'hi', // Set to Hindi to handle Hinglish/Hindi better and avoid Japanese auto-detect bugs
      prompt: 'This is a voice note about a business card contact, mentioning names or meeting details in Hindi or English.',
      response_format: 'json'
    });

    console.log('Transcription Result:', transcription.text);
    return transcription.text;
  } catch (error: any) {
    console.error('Transcription error:', error.message);
    throw new Error('Failed to transcribe audio with Groq');
  }
}
