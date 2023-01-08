import "../../styles/video_learn_page/ScoreStyle.css"

import React, { useEffect, useState } from "react"

type ScoreProps = {
    score: number
};

function Score(props: ScoreProps) {
    const [scoreClass, setScoreClass] = useState("perfect-score");
    const [scoreText, setScoreText] = useState("PERFECT");

    useEffect(() => {
        if (props.score <= 500) {
            setScoreClass("perfect-score");
            setScoreText("PERFECT");
        } else if (props.score <= 600) {
            setScoreClass("great-score");
            setScoreText("GREAT");
        } else if (props.score <= 700) {
            setScoreClass("good-score");
            setScoreText("Good");
        } else if (props.score <= 800) {
            setScoreClass("ok-score");
            setScoreText("ok");
        } else if (props.score <= 2000) {
            setScoreClass("miss-score");
            setScoreText("x");
        } else {
            setScoreClass("");
            setScoreText("");
        }
    }, [props.score])

    return (
        <div>
            <p className={`score ${scoreClass}`}>{scoreText}</p>
        </div>
    );
}

export default Score;