//inspired by: https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm

import React, { createContext, useReducer } from "react";

import { userReducer, UserActions } from "./GeneralReducer";
import User from "../../models/user";

type InitialStateType = {
    user: User
}

const initialState = {
    user: {
        _id: undefined,
        username: "",
        name: "",
        playlistIDs: [],
        profilePicHostID: "",
        bio: ""
    }
}

const AppContext = createContext<{
    state: InitialStateType;
    dispatch: React.Dispatch<any>;
}>({
    state: initialState,
    dispatch: () => null
});

const mainReducer = ({ user }: InitialStateType, action: UserActions) => ({
    user: userReducer(user, action)
});

type AppProviderProps = {
    children: React.ReactNode;
}

const AppProvider = (props: AppProviderProps) => {
    const [state, dispatch] = useReducer(mainReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {props.children}
        </AppContext.Provider>
    )
}

export { AppContext, AppProvider }