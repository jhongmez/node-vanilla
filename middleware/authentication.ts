import type { IncomingMessage, ServerResponse } from "http";
import { verify, type JwtPayload } from "jsonwebtoken";
import { isTokenRevoked } from "../models";
import config from "../config";

/**
 * An incoming request extended with the decoded JWT payload once authenticated.
 */
export interface AuthenticationRequest extends IncomingMessage {
    user?: JwtPayload | string;
}

/**
 * Middleware that authenticates a request using the `Authorization: Bearer <token>` header.
 *
 * Responds with 401 when no token is provided, 403 when the token was revoked or is invalid,
 * and attaches the decoded payload to `req.user` on success.
 *
 * @param { AuthenticationRequest } req - The incoming request to authenticate.
 * @param { ServerResponse } res - The response used to end the request when authentication fails.
 * @returns { Promise<boolean> } - true if the token is valid; otherwise false.
 */
export const authenticateToken = async(
    req: AuthenticationRequest,
    res: ServerResponse
): Promise<boolean> => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if ( !token ) {
        res.statusCode = 401;
        res.end( JSON.stringify({
            message: "Unauthorized"
        }) )
        return false;
    }

    if ( isTokenRevoked(token) ) {
        res.statusCode = 403;
        res.end( JSON.stringify({
            message: "Forbidden"
        }) );
        return false;
    }

    try {
        const decoded = verify(token, config.jwtSecret);
        req.user = decoded;
        return true;
    } catch(_err) {
        res.statusCode = 403;
        res.end( JSON.stringify({
            message: "Forbidden"
        }));
        return false;
    }
    
}