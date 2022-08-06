import * as mongoDB from "mongodb";

import User from "../models/user";

export let userCollection: mongoDB.Collection<User> = undefined;

/**
 * Connects to the user collection named at USERS_COLLECTION_NAME in the mongo database
 */
export async function connectToUserCollection(db: mongoDB.Db) {
    await applyUserSchemaValidation(db);
    userCollection = db.collection<User>(process.env.USERS_COLLECTION_NAME);
    console.log("Successfully connected to user collection")
}

/**
 * Applies the user schema to the users collection in the database passed in
 */
async function applyUserSchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["username", "name", "playlistIDs", "profilePicHostID"],
            additionalProperties: false,
            properties: {
                _id: {},
                username: {
                    bsonType: "string",
                    description: "username is required and is a string"
                },
                name: {
                    bsonType: "string",
                    description: "name is required and is a string"
                },
                playlistIDs: {
                    bsonType: "array",
                    description: "playlistIDs is required and must be an array of objectIds",
                    minItems: 0,
                    items: {
                        bsonType: "objectId"
                    }
                },
                profilePicHostID: {
                    bsonType: "string",
                    description: "profilePicHostID is required and must be a string"
                },
                bio: {
                    bsonType: "string",
                    description: "bio is not required and is a string"
                }
            }
        }
    };

    await db.command({
        collMod: process.env.USERS_COLLECTION_NAME,
        validator: jsonSchema
    })
}
