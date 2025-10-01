import { buildClient } from '@xata.io/client';

// Define the database schema matching the actual Xata database
const tables = [
  {
    name: "favorites",
    columns: [
      { name: "promptId", type: "link", link: { table: "prompts" } },
      { name: "userId", type: "link", link: { table: "users" } },
    ],
  },
  {
    name: "prompts",
    columns: [
      { name: "aspectRatio", type: "text" },
      { name: "description", type: "text" },
      { name: "generatedPrompt", type: "text" },
      { name: "isPublic", type: "bool" },
      { name: "likes", type: "int" },
      { name: "mode", type: "text" },
      { name: "mood", type: "text" },
      { name: "style", type: "text" },
      { name: "title", type: "text" },
      { name: "tool", type: "text" },
      { name: "userId", type: "link", link: { table: "users" } },
    ],
  },
  {
    name: "users",
    columns: [
      { name: "email", type: "text" },
      { name: "lastLogin", type: "datetime" },
      { name: "name", type: "text" },
      { name: "googleId", type: "text" },
    ],
  },
];

// Build the Xata client class
const DatabaseClient = buildClient();

// Export a function to create the client with environment variables
export function createXataClient() {
  return new DatabaseClient({
    databaseURL: process.env.XATA_DATABASE_URL,
    apiKey: process.env.XATA_API_KEY,
    branch: process.env.XATA_BRANCH || 'main'
  }, tables);
}

// Export default null to be set later
export default null;