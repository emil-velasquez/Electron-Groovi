import * as mongoDB from "mongodb";

/**
 * Creates a connection to the auth database that includes user and session information
 * @param client :mongoDB.MongoClient => serves as the connection to the greater mongo project
 * @returns :mongoDB.MongoClient => to be used to make individual connections to collections
 */
export async function connectToAuthDatbase(client: mongoDB.MongoClient) {
    //using the client connect to the database we want to target
    const db = client.db(process.env.DB_AUTH_NAME);

    console.log("Succesfully connected to database: " + db.databaseName);

    return db;
}