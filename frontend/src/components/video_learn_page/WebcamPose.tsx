import "../../styles/video_learn_page/WebcamPoseStyle.css"

import React, { useRef } from "react";

import Webcam from "react-webcam";

import usePose from "../../hooks/usePose";

type webcamPoseProps = {
    onPoseResults: (results: any) => void,
    onWebcamReady: () => void
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
            startPoseEstimation(webcamPoseModel, webcamRef.current.video)
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

    return (
        <div>
            <Webcam className="camera-elements" onUserMedia={processWebcam} ref={webcamRef} />
            <canvas className="camera-elements" ref={webcamPoseCanvasRef} />
        </div>
    )
}

export default WebcamPose;