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

    console.log("Succesfully connected to database: " + db.databaseName);

    return db;
}

