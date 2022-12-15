import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import * as mp_drawing from "@mediapipe/drawing_utils";

const usePose = () => {
    /**
    * Returns a new pose model WITHOUT its onResults set
    * pre: none
    */
    const getPoseModel = () => {
        let pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });
        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
        return pose;
    }

    /**
     * Performs the actual drawing of the pose model to the screen
     * Accepts either a video element or a canvas element
     */
    const startPoseEstimation = (poseModel: Pose, mediaElement: HTMLCanvasElement | HTMLVideoElement) => {
        // const poseDetectionFrame = async () => {
        //     await poseModel.send({ image: mediaElement });
        //     requestAnimationFrame(poseDetectionFrame);
        // }
        // poseDetectionFrame();

        setInterval(async () => {
            await poseModel.send({ image: mediaElement });
        }, 1000)
    }

    /**
     * Draws the results of the pose model on the passed in canvas
     */
    const drawResults = (results: any, canvas: HTMLCanvasElement) => {
        if (!results.poseLandmarks || canvas === null || canvas === undefined) {
            return;
        }

        const canvasCtx = canvas.getContext("2d");
        if (canvasCtx !== null) {
            //ready the canvas
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            //drawing to the canvas
            canvasCtx.globalCompositeOperation = "source-over";
            mp_drawing.drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                { color: "#00FF00", lineWidth: 2 });
            mp_drawing.drawLandmarks(canvasCtx, results.poseLandmarks, { color: "#0000FF", lineWidth: 0.5 });
            canvasCtx.restore();
        }
    }

    return {
        getPoseModel,
        startPoseEstimation,
        drawResults
    }
}

export default usePose;