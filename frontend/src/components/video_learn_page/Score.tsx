import "../../styles/video_learn_page/ScoreStyle.css"

type ScoreProps = {
    score: number
};

function Score(props: ScoreProps) {
    return (
        <div>
            <p className="score">{props.score}</p>
        </div>
    );
}

export default Score;