import "../../../styles/home_page/app_page/HomeTopBarStyle.css"

import { BsFillDiscFill } from "react-icons/bs"
import { GoGear } from "react-icons/go"
import { FaSearch } from "react-icons/fa"

function HomeTopBar() {
    return (
        <div className="top-bar">
            <div className="top-bar-section">
                <BsFillDiscFill className="logo" />
            </div>
            <div className="top-bar-section search-elements">
                <p>Search Bar</p>
                <FaSearch className="top-bar-symbols" />
            </div>
            <div className="top-bar-section right-elements">
                <p>Profile</p>
                <GoGear className="top-bar-symbols" />
            </div>
        </div>
    )
}

export default HomeTopBar;