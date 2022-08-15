import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import PlaylistPage from './pages/playlist_page/PlaylistPage';
import VideoInfoPage from './pages/video_info_page/VideoInfoPage';
import UserPage from './pages/user_page/UserPage';
import VideoLearnPage from './pages/video_learn_page/VideoLearnPage';
import ErrorAlert from './components/ErrorAlert';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route path="user" >
                        <Route index element={<ErrorAlert />} />
                        <Route path=":userID" element={<UserPage />} />
                    </Route>
                    <Route path="playlist">
                        <Route index element={<ErrorAlert />} />
                        <Route path=":playlistID" element={<PlaylistPage />} />
                    </Route>
                    <Route path="videoinfo" >
                        <Route index element={<ErrorAlert />} />
                        <Route path=":videoID" element={<VideoInfoPage />} />
                    </Route>
                </Route>
                <Route path="/learn" element={<VideoLearnPage />} >
                    <Route index element={<ErrorAlert />} />
                    <Route path=":videoID" element={<VideoInfoPage />} />
                </Route>
            </Routes>
        </HashRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
