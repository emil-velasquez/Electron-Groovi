import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser"
import cors from "cors";

import { connectToClient } from "./services/clientConnection";

import { connectToContentDatbase } from "./services/contentDBConnection";
import { connectToPlaylistCollection } from "./services/playlistConnection";
import { connectToVideoCollection } from "./services/videoConnection";
import { playlistRouter } from "./routes/playlistRouter";
import { videoRouter } from "./routes/videoRouter";

import { connectToAuthDatbase } from "./services/authDBConnections";
import { connectToUserCollection } from "./services/userConnection";
import { userRouter } from "./routes/userRouter";

import { authRouter } from "./routes/authRouter";

const app = express();
const port = 8080;

connectToClient()
    .then((client) => {
        connectToContentDatbase(client)
            .then((db) => {
                connectToPlaylistCollection(db);
                connectToVideoCollection(db);
            })
        connectToAuthDatbase(client)
            .then((db) => {
                connectToUserCollection(db);
            })
    })
    .then(() => {
        app.use(cors());
        const urlEncodedParser = bodyParser.urlencoded({ extended: false });
        app.use(bodyParser.json(), urlEncodedParser, cookieParser());

        app.use("/playlist", playlistRouter);
        app.use("/user", userRouter);
        app.use("/video", videoRouter);
        app.use("/auth", authRouter)

        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });