import * as mongoDB from "mongodb";

import Session from "../models/session";

export let sessionCollection: mongoDB.Collection<Session> = undefined;

export async function connectToSessionCollection(db: mongoDB.Db) {
    await applySessionSchemaValidation(db);
    sessionCollection = db.collection<Session>(process.env.SESSIONS_COLLECTION_NAME);
    console.log("Successfully connected to session collection")
}

/**
 * Applies a schema to the session collection
 * @param db :mongoDB.Db => contains the collection to apply the schema to
 */
async function applySessionSchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["sessionToken", "username"],
            additionalProperties: false,
            properties: {
                _id: {},
                sessionToken: {
                    bsonType: "string",
                    description: "sessionToken is required and is a string"
                },
                username: {
                    bsonType: "string",
                    description: "username is required and is a string"
                }
            }
        }
    };

    await db.command({
        collMod: process.env.SESSIONS_COLLECTION_NAME,
        validator: jsonSchema
    })
}