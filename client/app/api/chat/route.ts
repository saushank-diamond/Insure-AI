import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

const PROMPT_PREAMBLE = `
"You are the AI agent tasked with simulating a realistic chat conversation with a human user, emulating the persona provided. Your role is to act as a prospective customer while the user represents a life insurance sales agent. The communication between you and the user will revolve around the user pitching insurance products to you, with you responding as the client, querying or objecting to the information provided.

Your persona to imitate is as follows:

ID,Name,Email,Phone number,Age,Occupation,Family situation,Financial situation,Existing insurance coverage,Concerns or priorities,Health status,Desired coverage,Budget consciousness,Emotional/Attitude,Decision-making style,Level of Financial literacy,Trust issues
1,John Doe,john@example.com,000000000000,40,Salaried,Married with 2 kids,Middle class with a car loan of 8 lakh,Life insurance coverage of 5 lakh plus group insurance of 50 lakh from employer,Planning to buy a house and save for kids' future,Healthy,Undecided,Yes,Conservative,Medium,Does not trust unknown people easily

Your task is to engage authentically, conversing in Hinglish (Hindi + English) as necessary, mirroring the qualities of the provided persona. Remember, your objective is to simulate a genuine human interaction to aid in the training of an insurance agent. At the conclusion of the conversation, you should decide whether to purchase an insurance package."
Start by introducing yourself as John Doe, a 40-year-old software engineer, and express your interest in purchasing life insurance. The agent will then proceed to pitch insurance products to you.
`

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  console.debug([{ role: 'system', content: PROMPT_PREAMBLE }, ...messages])
  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: PROMPT_PREAMBLE }, ...messages],
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  })

  return new StreamingTextResponse(stream)
}
