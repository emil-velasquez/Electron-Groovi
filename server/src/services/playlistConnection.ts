import * as mongoDB from "mongodb";

import Playlist from "../models/playlist";

export let playlistCollection: mongoDB.Collection<Playlist> = undefined;

/**
 * Connects to the playlist collection named at PLAYLIST_COLLECTION_NAME in the mongo database
 */
export async function connectToPlaylistCollection(db: mongoDB.Db) {
    await applyPlaylistSchemaValidation(db);
    playlistCollection = db.collection<Playlist>(process.env.PLAYLIST_COLLECTION_NAME);
    console.log("Successfully connected to playlist collection")
}

/**
 * Applies the playlist schema to the playlists collection in the database passed in
 */
async function applyPlaylistSchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "ownerID", "pictureHostID", "videoIDs"],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "name is required and is a string"
                },
                ownerID: {
                    bsonType: "objectId",
                    description: "ownerID is required and is a objectId"
                },
                pictureHostID: {
                    bsonType: "string",
                    description: "pictureHostID is required and is a string"
                },
                videoIDs: {
                    bsonType: "array",
                    description: "videoIDs is required and must be an array of objectIds",
                    minItems: 0,
                    items: {
                        bsonType: "objectId"
                    }
                }
            }
        }
    };

    await db.command({
        collMod: process.env.PLAYLIST_COLLECTION_NAME,
        validator: jsonSchema
    })
}
