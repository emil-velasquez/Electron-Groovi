import "../../styles/home_page/ProfileBanner.css"

import React, { useState, useEffect } from "react";

import User from "../../models/user"

type ProfileBannerProps = {
    userID: string,
    size: number
}

function ProfileBanner(props: ProfileBannerProps) {
    const [curUser, setCurUser] = useState<User | null>(null);

    /**
     * Grab the user information from the backend to build this banner
     */
    useEffect(() => {
        const loadUser = async () => {
            const userInfo: User = await window.userAPI.getUser(props.userID);
            setCurUser(prevUser => userInfo);
        }
        loadUser();
    }, [])

    if (curUser === null) {
        return (<div />);
    } else {
        return (
            <div className="profile-banner">
                <img className="profile-banner-content"
                    style={{ width: `${props.size}px`, height: `${props.size}px` }}
                    src={`https://res.cloudinary.com/projectd/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_white,b_rgb:151515/${curUser.profilePicHostID}`}
                    alt="profile" />
                <span className="profile-banner-content" style={{ fontSize: `${props.size}px` }}>{curUser.username}</span>
            </div>
        )
    }

}

export default ProfileBanner;