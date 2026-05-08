import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

// Map model IDs to AI Gateway model strings
const modelMap: Record<string, Record<string, string>> = {
  google: {
    'gemini-2.5-flash': 'google/gemini-2.5-flash-preview-05-20',
    'gemini-2.5-pro': 'google/gemini-2.5-pro-preview-05-06',
    'gemini-2.0-flash': 'google/gemini-2.0-flash',
    'gemini-2.0-flash-lite': 'google/gemini-2.0-flash-lite',
  },
  groq: {
    'llama-3.3-70b-versatile': 'groq/llama-3.3-70b-versatile',
    'llama-3.1-8b-instant': 'groq/llama-3.1-8b-instant',
    'llama-3.2-3b-preview': 'groq/llama-3.2-3b-preview',
    'mixtral-8x7b-32768': 'groq/mixtral-8x7b-32768',
    'gemma2-9b-it': 'groq/gemma2-9b-it',
    'qwen-qwq-32b': 'groq/qwen-qwq-32b',
  },
}

export async function POST(req: Request) {
  const { messages, provider, model }: { 
    messages: UIMessage[]
    provider: string
    model: string 
  } = await req.json()

  // Get the full model string for the AI Gateway
  const selectedModel = modelMap[provider]?.[model] || 'google/gemini-2.0-flash'

  const result = streamText({
    model: selectedModel,
    system: 'You are a helpful AI assistant. Respond concisely and helpfully.',
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
