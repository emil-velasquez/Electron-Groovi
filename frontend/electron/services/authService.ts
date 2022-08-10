import jwtDecode from "jwt-decode";
import axios from "axios";
import { parse } from "url";
import { getPassword, setPassword, deletePassword } from "keytar";
import { userInfo } from "os";
import { randomBytes, createHash } from "crypto";
import { ObjectId } from "mongodb";
import { AxiosResponse } from "axios";

import { apiIdentifier, auth0Domain, clientId, expressDomain } from "../env_variables.json";

type ProfileInfo = {
    username: string,
    login_count: number,
    nickname: string,
    name: string,
    picture: string,
    updated_at: string,
    iss: string,
    sub: string,
    aud: string,
    iat: number,
    exp: number
}

type User = {
    id?: ObjectId,
    username: string,
    name: string,
    playlistIDs: ObjectId[],
    profilePicHostID: string,
    bio: string
}

const redirectUri = "http://localhost/callback";

const keytarService = 'electron-openid-oauth';
const keytarAccount = userInfo().username;

let accessToken: string = null;
let profile: User = null;
let refreshToken: string = null;

/**
 * Encodes the data at str into base64 (used for code verifier and challenge)
 * @param str :Buffer => contains the information to be encoded
 * @returns string of the base64 encoded buffer data
 */
const base64URLEncode = (str: Buffer) => {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Encodes the data at buf with sha256 (used for code verifier and challenge)
 * @param buf :string => contains the information to hash
 * @returns buffer of the hashed data
 */
const sha256 = (buf: string) => {
    return createHash("sha256").update(buf).digest();
}

let verifier: string = null;
let challenge: string = null;

/**
 * @returns the short-lived access token
 */
const getAccessToken = () => {
    return accessToken;
}

/**
 * @returns profile object that contains information like username, login_count, and auth0 id
 */
const getProfile = () => {
    return profile;
}

/**
 * @returns :string of url to grab authorization code to connect to Groovi's Auth0 implementation
 */
const getAuthenticationURL = () => {
    verifier = base64URLEncode(randomBytes(32));
    challenge = base64URLEncode(sha256(verifier));
    return `https://${auth0Domain}/authorize?` +
        `audience=${apiIdentifier}&` +
        `scope=openid profile offline_access&` +
        `response_type=code&` +
        `code_challenge=${challenge}&` +
        `code_challenge_method=S256&` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}`;
}

/**
 * Grabs the profile information of the user trying to gain access to the application
 */
const requestProfileInformation = async (res: AxiosResponse) => {
    const profile_info: ProfileInfo = jwtDecode(res.data.id_token);
    const profileOptions = {
        method: "POST",
        url: `${expressDomain}/user/loadProfile`,
        headers: { "Authorization": `Bearer ${accessToken}` },
        data: {
            id: profile_info.sub
        }
    }

    const profileResult = await axios(profileOptions);
    profile = profileResult.data.profileInfo;
}

/**
 * Attempts to find a refreshToken on the user's machine. If successful, uses that token to try
 * to get an access token for this current user session (assuming the refresh token is valid) and
 * log the user in. Otherwise clear any data that may be stored on the machine
 */
const refreshTokens = async () => {
    const refreshToken = await getPassword(keytarService, keytarAccount);

    if (refreshToken) {
        const refreshOptions = {
            method: "POST",
            url: `https://${auth0Domain}/oauth/token`,
            headers: { "content-type": "application/json" },
            data: {
                grant_type: "refresh_token",
                client_id: clientId,
                refresh_token: refreshToken
            }
        };

        try {
            const response = await axios(refreshOptions);
            accessToken = response.data.access_token;
            await requestProfileInformation(response);
        } catch (error) {
            await logout();
            throw error;
        }
    } else {
        throw new Error("No available refresh token.");
    }
}

/**
 * After successful authorization by Auth0, stores the user's access token, profile, and 
 * refresh token if asked for.
 * @param callbackURL :string => URL returned after successful authorization by Auth0 that 
 * contains the authorization code
 */
const loadTokens = async (callbackURL: string) => {
    const urlParts = parse(callbackURL, true);
    const query = urlParts.query;

    const exchangeOptions = {
        "grant_type": "authorization_code",
        "client_id": clientId,
        "code_verifier": verifier,
        "code": query.code,
        "redirect_uri": redirectUri
    };

    const options = {
        method: "POST",
        url: `https://${auth0Domain}/oauth/token`,
        headers: {
            "content-type": "application/json"
        },
        data: JSON.stringify(exchangeOptions)
    };

    try {
        const response = await axios(options);
        accessToken = response.data.access_token;
        requestProfileInformation(response);
        refreshToken = response.data.refresh_token;
        if (refreshToken) {
            await setPassword(keytarService, keytarAccount, refreshToken);
        }
    } catch (error) {
        await logout();
        throw error;
    }
}

/**
 * If authorization ever fails and user can't login, clear any login information on this machine
 */
const logout = async () => {
    await deletePassword(keytarService, keytarAccount);
    accessToken = null;
    profile = null;
    refreshToken = null;
}

/**
 * @returns logoutURL:string => URl to be navigated to when wanting to logout on Auth0's side
 */
const getLogoutUrl = () => {
    return `https://${auth0Domain}/v2/logout`
}

export { getAccessToken, getAuthenticationURL, getLogoutUrl, getProfile, loadTokens, logout, refreshTokens }