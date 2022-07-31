import * as mongoDB from "mongodb";

import Video from "../models/video";

export let videoCollection: mongoDB.Collection<Video> = undefined;

/**
 * Connects to the video collection named at VIDEOS_COLLECTION_NAME in the mongo database
 */
export async function connectToVideoCollection(db: mongoDB.Db) {
    await applyVideoSchemaValidation(db);
    videoCollection = db.collection<Video>(process.env.VIDEOS_COLLECTION_NAME);
    console.log("Successfully connected to video collection")
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