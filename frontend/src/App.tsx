import './App.css';

import React, { useEffect, useState, useContext } from "react";

import User from "./models/user";

import { Outlet } from 'react-router-dom';
import HomeSideBar from './components/home_page/app_page/HomeSideBar';
import HistoryButtons from './components/home_page/HistoryButtons';

import { AppContext } from './context/General/GeneralContext';
import { Types } from './context/General/GeneralReducer';

function App() {
    const { state, dispatch } = useContext(AppContext);

    /**
     * Whenever a component in the app updates the data of the logged in user,
     * call this function so that the whole app receives the updated data
     */
    const refreshUser = async () => {
        const responseUser: User = await window.authAPI.getProfile();
        dispatch({
            type: Types.Login,
            payload: {
                _id: responseUser._id,
                username: responseUser.username,
                name: responseUser.name,
                playlistIDs: responseUser.playlistIDs,
                profilePicHostID: responseUser.profilePicHostID,
                bio: responseUser.bio,
                chapterMap: responseUser.chapterMap
            }
        })
    }

    /**
     * When the app first mounts (the user is logged in at this point),
     * refresh the value of currentUser so that the app understands who is
     * logged in and their data
     */
    useEffect(() => {
        refreshUser();
    }, [])

    return (
        <div className="App">
            <div className="outlet-section">
                <Outlet />
            </div>
            <HomeSideBar />
            <div className='history-buttons'>
                <HistoryButtons />
            </div>

        </div>
    );
}

export default App;
