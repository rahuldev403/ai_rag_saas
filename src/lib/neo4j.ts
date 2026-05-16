import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!),
);

export default driver;

// Vectorization (PostgreSQL): Convert the text into a 768-dimensional array of numbers (an embedding) so the AI can perform semantic similarity searches.

// Entity Extraction (Neo4j): Ask Gemini to read the text, figure out the core concepts, and map how they connect to each other (e.g., "Recursion" -> IS_PREREQUISITE_FOR -> "Dynamic Programming").