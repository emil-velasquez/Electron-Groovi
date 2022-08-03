import "../../../styles/home_page/app_page/HomeTopBarStyle.css"

function HomeTopBar() {
    return (
        <div className="top-bar">
            <div className="top-bar-section">
                <p>Logo</p>
            </div>
            <div className="top-bar-section search-elements">
                <p>Search Bar</p>
                <p>Submit Search</p>
            </div>
            <div className="top-bar-section right-elements">
                <p>Profile</p>
                <p>Settings</p>
            </div>
        </div>
    )
}

export default HomeTopBar;