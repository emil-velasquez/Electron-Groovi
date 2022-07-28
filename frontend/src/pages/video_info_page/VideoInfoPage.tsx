import { Link } from "react-router-dom";

function SongPage() {
    return (
        <div>
            <p>Song Page</p>
            <Link to="/learn">Video Page</Link>
        </div>
    )
}

export default SongPage;