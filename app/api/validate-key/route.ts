import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json()

    if (!provider || !apiKey) {
      return new Response(JSON.stringify({ valid: false, error: 'Missing provider or API key' }), {
        status: 400,
      })
    }

    if (provider === 'groq') {
      const groq = createGroq({ apiKey })
      const model = groq('llama-3.1-8b-instant')

      try {
        await streamText({
          model,
          prompt: 'test',
          temperature: 0.7,
        })
        return new Response(JSON.stringify({ valid: true }), { status: 200 })
      } catch (error: any) {
        const errorMessage = error?.message || 'Invalid API key'
        return new Response(
          JSON.stringify({
            valid: false,
            error: errorMessage.includes('401') || errorMessage.includes('Unauthorized')
              ? 'Invalid API key'
              : errorMessage,
          }),
          { status: 400 }
        )
      }
    } else if (provider === 'google') {
      const google = createGoogleGenerativeAI({ apiKey })
      const model = google('gemini-2.0-flash')

      try {
        await streamText({
          model,
          prompt: 'test',
          temperature: 0.7,
        })
        return new Response(JSON.stringify({ valid: true }), { status: 200 })
      } catch (error: any) {
        const errorMessage = error?.message || 'Invalid API key'
        return new Response(
          JSON.stringify({
            valid: false,
            error: errorMessage.includes('401') || errorMessage.includes('Unauthorized')
              ? 'Invalid API key'
              : errorMessage,
          }),
          { status: 400 }
        )
      }
    } else {
      return new Response(JSON.stringify({ valid: false, error: 'Unknown provider' }), {
        status: 400,
      })
    }
  } catch (error) {
    console.error('Error validating API key:', error)
    return new Response(JSON.stringify({ valid: false, error: 'Validation failed' }), {
      status: 500,
    })
  }
}
