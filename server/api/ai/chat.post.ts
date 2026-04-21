type ChatRole = 'user' | 'assistant'

type IncomingMessage = {
  role: ChatRole
  content: string
}

type RequestBody = {
  messages?: IncomingMessage[]
  userContext?: string
}

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      role?: string
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openrouter/elephant-alpha'
const MAX_MESSAGES = 20
const MAX_CONTENT_LENGTH = 4000

function buildSystemPrompt(userContext?: string) {
  const base = [
    'Ты — дружелюбный ассистент-стилист в приложении виртуального гардероба «Мой гардероб».',
    'Ты помогаешь пользователю подбирать одежду под разные ситуации: театр, работа, путешествие, свидание, спорт, прогулка и пр.',
    'Отвечай на русском языке, коротко и по делу, без воды, без лишних вступлений.',
    'Если уместно — оформляй ответ маркированным списком из 3–6 пунктов.',
    'Если передан список вещей пользователя — предлагай конкретные предметы из гардероба. Если подходящих вещей нет — честно напиши об этом и предложи, что можно докупить.',
    'Если речь про путешествие — предложи компактный набор одежды с учётом длительности и погоды.',
    'Если пользователь спрашивает не про одежду — мягко верни разговор к теме гардероба и стиля.',
  ].join('\n')

  if (userContext && userContext.trim().length) {
    return `${base}\n\nКонтекст пользователя:\n${userContext.trim()}`
  }
  return base
}

function sanitizeMessages(messages: IncomingMessage[]): IncomingMessage[] {
  return messages
    .filter((message) => {
      return (
        message
        && typeof message.content === 'string'
        && message.content.trim().length > 0
        && (message.role === 'user' || message.role === 'assistant')
      )
    })
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, MAX_CONTENT_LENGTH),
    }))
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiKey = config.openrouterApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenRouter API key is not configured',
    })
  }

  const body = await readBody<RequestBody>(event)
  const rawMessages = Array.isArray(body?.messages) ? body!.messages : []
  const messages = sanitizeMessages(rawMessages)

  if (!messages.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Messages are required',
    })
  }

  const systemPrompt = buildSystemPrompt(body?.userContext)

  try {
    const response = await $fetch<OpenRouterResponse>(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://my-wardrobe.local',
        'X-Title': 'My Wardrobe',
      },
      body: {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 600,
      },
    })

    const reply = response.choices?.[0]?.message?.content ?? ''

    if (!reply.trim()) {
      throw createError({
        statusCode: 502,
        statusMessage: response.error?.message ?? 'Empty response from AI',
      })
    }

    return { reply }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const message = error instanceof Error ? error.message : 'AI request failed'
    throw createError({
      statusCode: 502,
      statusMessage: message,
    })
  }
})
