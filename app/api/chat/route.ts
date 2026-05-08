import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

export const maxDuration = 30

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const modelMap = {
  google: {
    'gemini-2.5-flash': google('gemini-2.5-flash-preview-05-20'),
    'gemini-2.5-pro': google('gemini-2.5-pro-preview-05-06'),
    'gemini-2.0-flash': google('gemini-2.0-flash'),
    'gemini-2.0-flash-lite': google('gemini-2.0-flash-lite'),
  },
  groq: {
    'llama-3.3-70b-versatile': groq('llama-3.3-70b-versatile'),
    'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'),
    'llama-3.2-3b-preview': groq('llama-3.2-3b-preview'),
    'mixtral-8x7b-32768': groq('mixtral-8x7b-32768'),
    'gemma2-9b-it': groq('gemma2-9b-it'),
    'qwen-qwq-32b': groq('qwen-qwq-32b'),
  },
} as const

type Provider = keyof typeof modelMap
type GoogleModel = keyof typeof modelMap.google
type GroqModel = keyof typeof modelMap.groq

function getModel(provider: string, model: string) {
  if (provider === 'google' && model in modelMap.google) {
    return modelMap.google[model as GoogleModel]
  }
  if (provider === 'groq' && model in modelMap.groq) {
    return modelMap.groq[model as GroqModel]
  }
  return modelMap.google['gemini-2.0-flash']
}

export async function POST(req: Request) {
  const { messages, provider, model }: {
    messages: UIMessage[]
    provider: string
    model: string
  } = await req.json()

  const selectedModel = getModel(provider, model)

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
