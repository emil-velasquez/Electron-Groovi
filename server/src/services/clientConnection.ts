import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

/**
 * Creates a client that connects to the entire Mongo project and returns it
 * @returns a mongoDB.MongoClient at DB_CONN_STRING
 */
export async function connectToClient() {
    dotenv.config();

    //create a client to the cluster at DB_CONN_STRING and connect to that cluster
    const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();

    return client;
}

