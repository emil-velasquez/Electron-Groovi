import './App.css';

import React, { useEffect } from "react";

import { Outlet } from 'react-router-dom';
import HomeTopBar from './components/home_page/app_page/HomeTopBar';
import HomeSideBar from './components/home_page/app_page/HomeSideBar';

function App() {
    useEffect(() => {
        const getProfileInfo = async () => {
            const profile = await window.electronAPI.getProfile();
            console.log(profile);
        }
        getProfileInfo();
    }, [])

    return (
        <div className="App">
            <HomeTopBar />
            <HomeSideBar />
            <div className="outlet-section">
                <Outlet />
            </div>
        </div>
    );
}

export default App;
