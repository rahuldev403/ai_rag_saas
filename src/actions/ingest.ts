// app/actions/ingest.ts
'use server';

import { embed, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/db';
import { documentChunks } from '@/db/schema';
import driver from '@/lib/neo4j';
import { v4 as uuidv4 } from 'uuid';

export async function ingestDocument(content: string) {
  try {
    // ---------------------------------------------------------
    // PHASE 1: Vector Embedding (Store in PostgreSQL / pgvector)
    // ---------------------------------------------------------
    
    // 1. Generate the 768-dimensional embedding using Gemini
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: content,
    });

    // 2. Insert into PostgreSQL using Drizzle ORM
    const chunkId = uuidv4();
    await db.insert(documentChunks).values({
      id: chunkId,
      content: content,
      embedding: embedding, 
    });

    // ---------------------------------------------------------
    // PHASE 2: Graph Extraction (Store in Neo4j)
    // ---------------------------------------------------------
    
    // 1. Force Gemini to extract structured JSON data using Zod
    const { object: graphData } = await generateObject({
      model: google('gemini-1.5-flash'),
      system: "You are a senior data architect. Extract the core educational concepts from the text. Identify entities and the logical relationships between them (e.g., REQUIRES, RELATES_TO, IS_PART_OF).",
      prompt: content,
      schema: z.object({
        entities: z.array(z.object({
          name: z.string(),
          type: z.string().describe('e.g., Algorithm, Framework, Language'),
        })),
        relationships: z.array(z.object({
          source: z.string(),
          relation: z.string().describe('e.g., REQUIRES, RELATES_TO'),
          target: z.string(),
        })),
      }),
    });

    // 2. Write the extracted structure to Neo4j
    const session = driver.session();
    
    try {
      // Create Nodes (Entities)
      for (const entity of graphData.entities) {
        await session.run(
          `MERGE (e:Concept {name: $name})
           SET e.type = $type`,
          { name: entity.name.toLowerCase(), type: entity.type }
        );
      }

      // Create Edges (Relationships)
      for (const rel of graphData.relationships) {
        await session.run(
          `MATCH (source:Concept {name: $sourceName})
           MATCH (target:Concept {name: $targetName})
           MERGE (source)-[r:${rel.relation.replace(/\s+/g, '_').toUpperCase()}]->(target)`,
          { 
            sourceName: rel.source.toLowerCase(), 
            targetName: rel.target.toLowerCase() 
          }
        );
      }
    } finally {
      await session.close();
    }

    return { success: true, message: 'Document ingested and mapped successfully.' };

  } catch (error) {
    console.error('Ingestion Error:', error);
    return { success: false, error: 'Failed to ingest document.' };
  }
}