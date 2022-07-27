import "../../styles/video_page/VideoLearnPageStyle.css";

import React, { useRef, useState, Ref, useEffect } from "react";

import Score from "./Score";
import VideoPose from "./VideoPose";
import WebcamPose from "./WebcamPose";

type landmark = {
    x: number,
    y: number,
    z: number
}

//TODO: make sure to update props when we figure out what props to enter
function Media(props: any, ref: Ref<unknown>) {
    const webcamReady = useRef(false);

    const JOINTS = [[16, 14, 12], [14, 12, 11], [14, 12, 24], [12, 24, 26], [24, 26, 28],
    [26, 24, 23], [25, 23, 24], [23, 25, 27], [11, 23, 25], [13, 11, 23],
    [13, 11, 12], [15, 13, 11]];

    const mirrored = useRef(true);
    const diffPoseAngles = useRef<number[][]>([]);
    const [score, setScore] = useState(0);

    /**
     * Update whether the video is mirrored
     */
    const updateMirrored = (mirrorState: boolean) => {
        mirrored.current = mirrorState;
    }

    /**
     * Receive the results from the video pose model and process it
     */
    const videoPoseOnResults = (results: any) => {
        if (webcamReady.current) {
            adjustDiffPoseAngles(results, -1);
            calcDiffAngleScore(0);
        }
    }

    /**
     * Receive the results from the webcam pose model and process it
     */
    const webcamPoseOnResults = (results: any) => {
        initializeDiffPoseAngles();
        adjustDiffPoseAngles(results, 1);
    }

    /**
     * When called, tells this component that the webcam has loaded
     */
    const webcamLoaded = () => {
        webcamReady.current = true;
    }

    /**
     * Empty out diffPoseAngles in preparation for the next frame
     * pre: webcamOnResults called
     * post: diffPoseAngles is initialized to 12 arrays of [0, 0]
     */
    function initializeDiffPoseAngles() {
        diffPoseAngles.current.length = 0;
        for (let angleIndex = 0; angleIndex < JOINTS.length; angleIndex++) {
            diffPoseAngles.current[angleIndex] = [0, 0]
        }
    }

    /**
     * When the application is first loaded, we need to make sure that diffPoseAngles is initialized
     */
    useEffect(() => {
        initializeDiffPoseAngles();
    }, [])

    /**
     * Calculates the angle for a given set of 3 coordinates
     * landmarks: array of 33 landmark JSON objects from pose model
     * landmarkIndices: list of 3 indices of the angle we are looking at
     * inZdirection: boolean for whether the points are XY or XZ
     */
    function calculateAngle(landmarks: landmark[], landmarkIndices: number[], inZdirection: boolean) {
        const DEG_IN_PI = 180;

        let points = [];
        for (let index = 0; index < landmarkIndices.length; index++) {
            const landmark = landmarks[landmarkIndices[index]];
            points[index] = [landmark.x, 0];
            points[index][1] = inZdirection ? landmark.z : landmark.y;
        }

        let vector1 = [points[0][0] - points[1][0], points[0][1] - points[1][1]];
        let vector1Length = Math.sqrt(vector1[0] * vector1[0] + vector1[1] * vector1[1]);

        let vector2 = [points[2][0] - points[1][0], points[2][1] - points[1][1]];
        let vector2Length = Math.sqrt(vector2[0] * vector2[0] + vector2[1] * vector2[1]);

        let dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
        return Math.acos(dotProduct / (vector1Length * vector2Length)) * DEG_IN_PI / Math.PI;
    }

    /**
     * Adds or subtracts to diffPoseAngles to prepare for scoring
     * pre: webcamOnResults or videoOnResults has been called / initializeDiffPoseAngles has been
     * called if webcamOnResults is the caller
     * post: diffPoseAngles is adjusted (added to if webcamOnResults/subtracted if videoOnResults)
     */
    function adjustDiffPoseAngles(results: any, scale: number) {
        const landmarks = results.poseWorldLandmarks;
        if (landmarks) {
            console.log(diffPoseAngles);
            if (scale === 1 || mirrored.current) {
                for (let angleIndex = 0; angleIndex < JOINTS.length; angleIndex++) {
                    const landmarkIndices = JOINTS[angleIndex];
                    const xyAngle = scale * calculateAngle(landmarks, landmarkIndices, false);
                    const xzAngle = scale * calculateAngle(landmarks, landmarkIndices, true);
                    diffPoseAngles.current[angleIndex][0] += xyAngle;
                    diffPoseAngles.current[angleIndex][1] += xzAngle;
                }
            } else {
                for (let angleIndex = JOINTS.length - 1; angleIndex >= 0; angleIndex--) {
                    const landmarkIndices = JOINTS[angleIndex];
                    const xyAngle = scale * calculateAngle(landmarks, landmarkIndices, false);
                    const xzAngle = scale * calculateAngle(landmarks, landmarkIndices, true);
                    diffPoseAngles.current[(JOINTS.length - 1) - angleIndex][0] += xyAngle;
                    diffPoseAngles.current[(JOINTS.length - 1) - angleIndex][1] += xzAngle;
                }
            }
        }
    }

    /**
    * Calculates how different the angles between the webcam and the video are with forgiveness interval
    * pre: Both webcamOnResults and videoOnResults have been called
    * post: single number representing the overall difference after a forgivenss is applied
    */
    function calcDiffAngleScore(forgivenessInterval: number) {
        let curScore = 0;
        for (let jointScore of diffPoseAngles.current) {
            curScore += Math.abs(jointScore[0]) + Math.abs(jointScore[1]) - 2 * forgivenessInterval;
        }
        setScore(curScore);
        curScore = 0;
    }

    return (
        <div className="media-container">
            <VideoPose onPoseResults={videoPoseOnResults} onUpdateMirror={updateMirrored} />
            <WebcamPose onPoseResults={webcamPoseOnResults} onWebcamReady={webcamLoaded} />
            <Score score={score} />
        </div>
    );
}

export default Media;