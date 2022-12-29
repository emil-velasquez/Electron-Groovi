import * as mongoDB from "mongodb";
import ChapterList from "../models/chapterList";

export let chapterListCollection: mongoDB.Collection<ChapterList> = undefined;

/**
 * Connects to the chapter-list connection at CHAPTERLISTS_COLLECTION_NAME in the database
 */
export async function connectToChapterListsCollection(db: mongoDB.Db) {
    await applyChapterListSchemaValidation(db);
    chapterListCollection = db.collection<ChapterList>(process.env.CHAPTERLISTS_COLLECTION_NAME);
    console.log("Successfully connected to Chapter Lists collection")
}

/**
 * Applies the ChapterList schema to the chapter list collection
 */
async function applyChapterListSchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["ownerId", "curMaxID", "chapters"],
            additionalProperties: false,
            properties: {
                _id: {},
                ownerId: {
                    bsonType: "objectId",
                    description: "ownerId is required and is an objectId"
                },
                curMaxID: {
                    bsonType: "int",
                    description: "curMaxID is required and is an int"
                },
                chapters: {
                    bsonType: "array",
                    description: "chapters is required and is an array of chapter objects"
                }
            }
        }
    };

    await db.command({
        collMod: process.env.CHAPTERLISTS_COLLECTION_NAME,
        validator: jsonSchema
    })
}