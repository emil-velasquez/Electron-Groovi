import './App.css';

import React from "react";

import { Outlet } from 'react-router-dom';
import HomeTopBar from './components/home_page/app_page/HomeTopBar';
import HomeSideBar from './components/home_page/app_page/HomeSideBar';

function App() {
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
