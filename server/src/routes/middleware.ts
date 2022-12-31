import { auth } from "express-oauth2-jwt-bearer";
import { auth0Domain, apiIdentifier } from "../../env_variables.json";

/**
 * Middleware to be attached to any route that requires a valid authorization
 */
const checkJwt = auth({
    audience: apiIdentifier,
    issuerBaseURL: `https://${auth0Domain}/`
})

export { checkJwt }