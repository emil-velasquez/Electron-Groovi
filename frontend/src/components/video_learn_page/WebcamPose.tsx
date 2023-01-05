import "../../styles/video_learn_page/WebcamPoseStyle.css"

import React, { useRef } from "react";

import Webcam from "react-webcam";

import usePose from "../../hooks/usePose";

type webcamPoseProps = {
    onPoseResults: (results: any) => void,
    onWebcamReady: () => void,
    sendWebcamInterval: (interval: number) => void,
    viewState: number
}

function WebcamPose(props: webcamPoseProps) {
    const webcamRef = useRef<Webcam>(null);
    const webcamPoseCanvasRef = useRef<HTMLCanvasElement>(null);

    const { getPoseModel, startPoseEstimation, drawResults } = usePose();

    /**
     * When the webcam is loaded, kick off it's pose model
     */
    function processWebcam() {
        const webcamPoseModel = getPoseModel();
        webcamPoseModel.onResults(webcamOnResults);

        if (webcamRef.current !== null && webcamRef.current.video !== null) {
            let webInterval = startPoseEstimation(webcamPoseModel, webcamRef.current.video)
            props.sendWebcamInterval(webInterval);
        }
        props.onWebcamReady();
    }

    /**
     * Handle whenever the webcam pose modle makes results
     */
    const webcamOnResults = (results: any) => {
        if (webcamPoseCanvasRef.current !== null) {
            props.onPoseResults(results);
            //drawResults(results, webcamPoseCanvasRef.current);
        }
    }

    /**
     * Decide which style to use depending on the view state
     */
    const chooseStyleName = (viewStyle: number) => {
        if (viewStyle === 0) {
            return "camera-hid";
        } else if (viewStyle === 1) {
            return "camera-popout";
        } else {
            return "camera-half"
        }
    }

    return (
        <div>
            <Webcam className={chooseStyleName(props.viewState)} onUserMedia={processWebcam} ref={webcamRef} />
            <canvas className={"webcam-pose-canvas"} ref={webcamPoseCanvasRef} />
        </div>
    )
}

export default WebcamPose;