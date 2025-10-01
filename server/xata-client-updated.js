// Generated Xata client for server use
import { buildClient } from '@xata.io/client';

// Import the generated schema from the main Xata file
const tables = [
  {
    "name": "favorites",
    "checkConstraints": {},
    "foreignKeys": {
      "favorites_promptId_fkey": {
        "name": "favorites_promptId_fkey",
        "columns": ["promptId"],
        "referencedTable": "prompts",
        "referencedColumns": ["xata_id"],
        "onDelete": "NO ACTION"
      },
      "favorites_userId_fkey": {
        "name": "favorites_userId_fkey",
        "columns": ["userId"],
        "referencedTable": "users",
        "referencedColumns": ["xata_id"],
        "onDelete": "NO ACTION"
      }
    },
    "primaryKey": ["xata_id"],
    "uniqueConstraints": {},
    "columns": [
      {
        "name": "promptId",
        "type": "link",
        "link": { "table": "prompts" },
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "userId",
        "type": "link",
        "link": { "table": "users" },
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "xata_createdat",
        "type": "datetime",
        "notNull": true,
        "unique": false,
        "defaultValue": "now()",
        "comment": ""
      },
      {
        "name": "xata_id",
        "type": "text",
        "notNull": true,
        "unique": true,
        "defaultValue": "('rec_'::text || (xata_private.xid())::text)",
        "comment": ""
      },
      {
        "name": "xata_updatedat",
        "type": "datetime",
        "notNull": true,
        "unique": false,
        "defaultValue": "now()",
        "comment": ""
      },
      {
        "name": "xata_version",
        "type": "int",
        "notNull": true,
        "unique": false,
        "defaultValue": "0",
        "comment": ""
      }
    ]
  },
  {
    "name": "prompts",
    "checkConstraints": {},
    "foreignKeys": {
      "prompts_userId_fkey": {
        "name": "prompts_userId_fkey",
        "columns": ["userId"],
        "referencedTable": "users",
        "referencedColumns": ["xata_id"],
        "onDelete": "NO ACTION"
      }
    },
    "primaryKey": ["xata_id"],
    "uniqueConstraints": {},
    "columns": [
      {
        "name": "aspectRatio",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "description",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "generatedPrompt",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "isPublic",
        "type": "bool",
        "notNull": false,
        "unique": false,
        "defaultValue": "false",
        "comment": ""
      },
      {
        "name": "likes",
        "type": "int",
        "notNull": false,
        "unique": false,
        "defaultValue": "0",
        "comment": ""
      },
      {
        "name": "mode",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "mood",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "style",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "title",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "tool",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "userId",
        "type": "link",
        "link": { "table": "users" },
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "xata_createdat",
        "type": "datetime",
        "notNull": true,
        "unique": false,
        "defaultValue": "now()",
        "comment": ""
      },
      {
        "name": "xata_id",
        "type": "text",
        "notNull": true,
        "unique": true,
        "defaultValue": "('rec_'::text || (xata_private.xid())::text)",
        "comment": ""
      },
      {
        "name": "xata_updatedat",
        "type": "datetime",
        "notNull": true,
        "unique": false,
        "defaultValue": "now()",
        "comment": ""
      },
      {
        "name": "xata_version",
        "type": "int",
        "notNull": true,
        "unique": false,
        "defaultValue": "0",
        "comment": ""
      }
    ]
  },
  {
    "name": "users",
    "checkConstraints": {},
    "foreignKeys": {},
    "primaryKey": ["xata_id"],
    "uniqueConstraints": {
      "users_email_key": {
        "name": "users_email_key",
        "columns": ["email"]
      }
    },
    "columns": [
      {
        "name": "email",
        "type": "text",
        "notNull": false,
        "unique": true,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "lastLogin",
        "type": "datetime",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "name",
        "type": "text",
        "notNull": false,
        "unique": false,
        "defaultValue": null,
        "comment": ""
      },
      {
        "name": "xata_createdat",
        "type": "datetime",
        "notNull": true,
        "unique": false,
        "defaultValue": "now()",
        "comment": ""
      },
      {
        "name": "xata_id",
        "type": "text",
        "notNull": true,
        "unique": true,
        "defaultValue": "('rec_'::text || (xata_private.xid())::text)",
        "comment": ""
      },
      {
        "name": "xata_updatedat",
        "type": "datetime",
        "notNull": true,
        "unique": false,
        "defaultValue": "now()",
        "comment": ""
      },
      {
        "name": "xata_version",
        "type": "int",
        "notNull": true,
        "unique": false,
        "defaultValue": "0",
        "comment": ""
      }
    ]
  }
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

export default createXataClient;