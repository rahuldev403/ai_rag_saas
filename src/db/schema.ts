// db/schema.ts
import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';

// --- Auth.js User Model ---
export const users = pgTable('user', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

// --- Vector Knowledge Base (pgvector) ---
export const documentChunks = pgTable('document_chunk', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  content: text('content').notNull(),
  // Gemini text-embedding-004 outputs exactly 768 dimensions
  embedding: vector('embedding', { dimensions: 768 }),
});