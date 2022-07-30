import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

import Playlist from "../models/playlist";
import Video from "../models/video";
import User from "../models/user";

export const collections: {
    videos?: mongoDB.Collection<Video>,
    playlists?: mongoDB.Collection<Playlist>,
    users?: mongoDB.Collection<User>
} = {};

export async function connectToDatabase() {
    dotenv.config();

    //create a client to the cluster at DB_CONN_STRING and connect to that cluster
    const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();

    //using the client connect to the database we want to target
    const db = client.db(process.env.DB_NAME);

    //apply schema validation on all collections in this database
    await applyPlaylistSchemaValidation(db);
    await applyUserSchemaValidation(db);
    await applyVideoSchemaValidation(db);

    //create a connection to each collection
    const playlistCollection = db.collection<Playlist>(process.env.PLAYLIST_COLLECTION_NAME);
    const videoCollection = db.collection<Video>(process.env.VIDEOS_COLLECTION_NAME);
    const userCollection = db.collection<User>(process.env.USERS_COLLECTION_NAME);

    //persists these connections
    collections.playlists = playlistCollection;
    collections.videos = videoCollection;
    collections.users = userCollection;

    console.log("Succesfully connected to database: " + db.databaseName);
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

/**
 * Applies the user schema to the users collection in the database passed in
 */
async function applyUserSchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "playlistIDs", "profilePicHostID"],
            additionalProperties: false,
            properties: {
                _id: {},
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
                }
            }
        }
    };

    await db.command({
        collMod: process.env.USERS_COLLECTION_NAME,
        validator: jsonSchema
    })
}

/**
 * Applies the video schema to the videos collection in the database passed in
 */
async function applyVideoSchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["videoName", "choreorgapherID", "videoHostID", "thumbnailHostID"],
            additionalProperties: false,
            properties: {
                _id: {},
                videoName: {
                    bsonType: "string",
                    description: "videoName is required and is a string"
                },
                choreographerID: {
                    bsonType: "objectId",
                    description: "choreographerID is required and is a objectId"
                },
                songName: {
                    bsonType: "string",
                    description: "songName is not required and is a string"
                },
                artistName: {
                    bsonType: "string",
                    description: "artistName is not required and is a string"
                },
                videoHostID: {
                    bsonType: "string",
                    description: "videoHostID is required and is a string"
                },
                thumbnailHostID: {
                    bsonType: "string",
                    description: "thumbnailHostID is required and is a string"
                }
            }
        }
    };

    await db.command({
        collMod: process.env.VIDEOS_COLLECTION_NAME,
        validator: jsonSchema
    })
}