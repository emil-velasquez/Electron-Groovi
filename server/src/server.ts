import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser"
import cors from "cors";

import { connectToClient } from "./services/clientConnection";

import { connectToContentDatbase } from "./services/contentDBConnection";
import { connectToPlaylistCollection } from "./services/playlistConnection";
import { connectToVideoCollection } from "./services/videoConnection";
import { connectToUserCollection } from "./services/userConnection";
import { connectToChapterListsCollection } from "./services/chapterListsConnection";
import { playlistRouter } from "./routes/playlistRouter";
import { videoRouter } from "./routes/videoRouter"
import { userRouter } from "./routes/userRouter";
import { chapterListRouter } from "./routes/chapterListsRouter";

const app = express();

connectToClient()
    .then((client) => {
        connectToContentDatbase(client)
            .then((db) => {
                connectToPlaylistCollection(db);
                connectToVideoCollection(db);
                connectToUserCollection(db);
                connectToChapterListsCollection(db);
            })
    })
    .then(() => {
        app.use(cors());
        const urlEncodedParser = bodyParser.urlencoded({ extended: false });
        app.use(bodyParser.json(), urlEncodedParser, cookieParser());

        app.use("/playlist", playlistRouter);
        app.use("/user", userRouter);
        app.use("/video", videoRouter);
        app.use("/chapterList", chapterListRouter)

        app.listen(process.env.PORT, () => {
            console.log(`Server started at http://localhost:${process.env.PORT}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });