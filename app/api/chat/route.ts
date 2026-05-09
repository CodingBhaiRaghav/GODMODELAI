import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

export const maxDuration = 30

function createModelMap(groqApiKey?: string, googleApiKey?: string) {
  const googleKey = googleApiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const groqKey = groqApiKey || process.env.GROQ_API_KEY

  const google = googleKey ? createGoogleGenerativeAI({ apiKey: googleKey }) : null
  const groq = groqKey ? createGroq({ apiKey: groqKey }) : null

  return {
    google: google ? {
      'gemini-2.5-flash': google('gemini-2.5-flash-preview-05-20'),
      'gemini-2.5-pro': google('gemini-2.5-pro-preview-05-06'),
      'gemini-2.0-flash': google('gemini-2.0-flash'),
      'gemini-2.0-flash-lite': google('gemini-2.0-flash-lite'),
    } : {},
    groq: groq ? {
      'llama-3.3-70b-versatile': groq('llama-3.3-70b-versatile'),
      'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'),
      'llama-3.2-3b-preview': groq('llama-3.2-3b-preview'),
      'mixtral-8x7b-32768': groq('mixtral-8x7b-32768'),
      'gemma2-9b-it': groq('gemma2-9b-it'),
      'qwen-qwq-32b': groq('qwen-qwq-32b'),
    } : {},
  } as const
}

type GoogleModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash' | 'gemini-2.0-flash-lite'
type GroqModel = 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'llama-3.2-3b-preview' | 'mixtral-8x7b-32768' | 'gemma2-9b-it' | 'qwen-qwq-32b'

function getModel(modelMap: ReturnType<typeof createModelMap>, provider: string, model: string) {
  if (provider === 'google' && model in modelMap.google) {
    return modelMap.google[model as GoogleModel]
  }
  if (provider === 'groq' && model in modelMap.groq) {
    return modelMap.groq[model as GroqModel]
  }

  if ('gemini-2.0-flash' in modelMap.google) {
    return modelMap.google['gemini-2.0-flash']
  }

  return null
}

export async function POST(req: Request) {
  try {
    const { messages, provider, model, groqApiKey, googleApiKey }: {
      messages: UIMessage[]
      provider: string
      model: string
      groqApiKey?: string
      googleApiKey?: string
    } = await req.json()

    const modelMap = createModelMap(groqApiKey, googleApiKey)
    let selectedModel = getModel(modelMap, provider, model)

    if (!selectedModel) {
      console.warn(`Primary provider ${provider} with model ${model} not available, attempting fallback`)
      selectedModel = getModel(modelMap, 'google', 'gemini-2.0-flash')
    }

    if (!selectedModel) {
      return new Response(
        JSON.stringify({
          error: 'No API keys provided. Please configure your API keys in settings.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

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
  } catch (error: any) {
    console.error('Chat API error:', error)

    const errorMessage = error?.message || 'An error occurred while processing your request'
    const statusCode = error?.status || 500

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
