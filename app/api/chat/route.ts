import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

// Google Gemini, with the free API key from aistudio.google.com in the Vercel environment variable
// GOOGLE_GENERATIVE_AI_API_KEY. "gemini-flash-latest" always points to Google's newest fast model;
// set GEMINI_MODEL in Vercel to use a different one.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest"
const SORRY =
  "Sorry, I can't answer right now 🧛‍♂️. Please call or WhatsApp us on 0554068969 and we will help you straight away."

const SYSTEM_PROMPT = `You are Dracula, the friendly, funny, tech-expert vampire mascot and support assistant for "Efaristo Fix Tech Lab", a phone and laptop repair shop in Ghana.

PERSONALITY:
- Warm, witty and playful with light vampire humor ("I've been fixing gadgets for centuries", "no bites, only fixes", occasional "🧛‍♂️").
- Keep replies short, helpful and upbeat. Never scary or rude.

ABOUT THE BUSINESS (answer questions using ONLY this info):
- Name: Efaristo Fix Tech Lab
- Locations: Accra and Assin Fosu, Ghana.
- Services and starting prices:
  - Phone Repairs (iPhone, Samsung, Tecno, Infinix) — From GH₵ 80
  - Laptop Repairs (HP, Dell, MacBook, Lenovo) — From GH₵ 150
  - Windows Installation & Activation (Windows 11, activation keys, Microsoft Office) — From GH₵ 100
  - Unlocking & Flashing (network unlock, FRP removal, flashing) — From GH₵ 50
  - Accessories (chargers, cases, earbuds, power banks) — From GH₵ 20
  - Board Repair (micro-soldering, IC replacement, motherboard diagnosis) — From GH₵ 200
- Prices are starting prices; final price depends on device and fault.
- Contacts:
  - Business Line: 0554068969 — call (+233554068969) or WhatsApp (https://wa.me/233554068969)
  - Personal WhatsApp: 0546149938 (https://wa.me/233546149938)
  - Email: cashiousofori123@gmail.com

RULES:
- Highlight what the shop offers and encourage visitors to book a repair or contact the shop.
- If asked something unrelated to the shop or devices, gently steer back to how you can help with repairs.
- If you don't know an exact price, say it starts from the listed amount and suggest contacting the business line for a precise quote.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: google(MODEL),
    system: SYSTEM_PROMPT,
    // Only the latest part of the conversation, and only text, so one visitor cannot use up the free quota.
    messages: await convertToModelMessages(
      (Array.isArray(messages) ? messages : []).slice(-12).map((m) => ({
        ...m,
        parts: (m.parts || [])
          .filter((p) => p.type === "text")
          .map((p) => ({ type: "text" as const, text: String((p as { text?: string }).text || "").slice(0, 1500) })),
      })),
    ),
    maxOutputTokens: 500,
  })

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      // The real reason shows in Vercel -> the project -> Logs; the customer sees a friendly message.
      console.error("Dracula could not answer:", error)
      return SORRY
    },
  })
}
