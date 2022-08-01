import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { connectToDatabase } from "./services/contentConnection";
import { connectToPlaylistCollection } from "./services/playlistConnection";
import { connectToUserCollection } from "./services/userConnection";
import { connectToVideoCollection } from "./services/videoConnection";
import { playlistRouter } from "./routes/playlistRouter";
import { userRouter } from "./routes/userRouter";
import { videoRouter } from "./routes/videoRouter";
import { authRouter } from "./routes/authRouter";

const app = express();
const port = 8080;

connectToDatabase()
    .then((db) => {
        connectToPlaylistCollection(db);
        connectToUserCollection(db);
        connectToVideoCollection(db);
    })
    .then(() => {
        app.use(cors());
        const urlEncodedParser = bodyParser.urlencoded({ extended: false });
        app.use(bodyParser.json(), urlEncodedParser);

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