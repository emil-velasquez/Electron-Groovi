import express from "express";
import { connectToDatabase } from "./services/contentConnection";
import { connectToPlaylistCollection } from "./services/playlistConnection";
import { connectToUserCollection } from "./services/userConnection";
import { connectToVideoCollection } from "./services/videoConnection";
import { playlistRouter } from "./routes/playlistRouter";
import { userRouter } from "./routes/userRouter";
import { videoRouter } from "./routes/videoRouter";

const app = express();
const port = 8080;

connectToDatabase()
    .then((db) => {
        connectToPlaylistCollection(db);
        connectToUserCollection(db);
        connectToVideoCollection(db);
    })
    .then(() => {
        app.use("/playlist", playlistRouter);
        app.use("/user", userRouter);
        app.use("/video", videoRouter);

        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });