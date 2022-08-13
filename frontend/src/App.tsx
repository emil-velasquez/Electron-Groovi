import './App.css';

import React, { useEffect, useState } from "react";

import User from "./models/user";

import { Outlet } from 'react-router-dom';
import HomeTopBar from './components/home_page/app_page/HomeTopBar';
import HomeSideBar from './components/home_page/app_page/HomeSideBar';

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    /**
     * Whenever a component in the app updates the data of the logged in user,
     * call this function so that the whole app receives the updated data
     */
    const refreshUser = async () => {
        const responseUser: User = await window.authAPI.getProfile();
        setCurrentUser(prevUser => responseUser);
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
            <HomeTopBar />
            <HomeSideBar user={currentUser} />
            <div className="outlet-section">
                <Outlet />
            </div>
        </div>
    );
}

export default App;
