import express from "express";
import { connectToDatabase } from "./services/contentConnection";
import { playlistRouter } from "./routes/playlistRouter";
import { userRouter } from "./routes/userRouter";
import { videoRouter } from "./routes/videoRouter";

const app = express();
const port = 8080;

connectToDatabase()
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