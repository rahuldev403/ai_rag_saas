import { streamText } from "ai";
import { google } from "@/lib/neo4j";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    messages,
  });

  return result.toTextStreamResponse();
}