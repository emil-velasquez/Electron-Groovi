import './App.css';

import React, { useEffect, useState } from "react";
import axios from 'axios';

import { Outlet } from 'react-router-dom';
import HomeTopBar from './components/home_page/app_page/HomeTopBar';
import HomeSideBar from './components/home_page/app_page/HomeSideBar';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        axios.get("/auth/isUserAuth", { withCredentials: true })
            .then(({ data }) => console.log(data));
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
