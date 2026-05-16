"use client";

import { useChat } from "@ai-sdk/react";
import { FormEvent } from "react";

export default function Home() {
  const {
    messages,
    input,
    handleInputChange,
    append,
  } = useChat();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!input.trim()) return;

    await append({
      role: "user",
      content: input,
    });
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-3xl font-bold mb-6">
        AI RAG SaaS
      </h1>

      <div className="flex-1 space-y-4 mb-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className="border rounded-xl p-4"
          >
            <strong>
              {message.role === "user"
                ? "You"
                : "AI"}
            </strong>

            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything..."
          className="flex-1 border p-3 rounded-xl"
        />

        <button
          type="submit"
          className="bg-black text-white px-6 rounded-xl"
        >
          Send
        </button>
      </form>
    </main>
  );
}