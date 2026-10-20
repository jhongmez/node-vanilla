import type { ServerResponse } from "http"
import type { AuthenticationRequest } from "./authentication"
import type { User } from "../models";

/**
 * Creates a middleware that authorizes a request based on the authenticated user's role.
 *
 * @param { ...string } roles - The roles allowed to access the resource.
 * @returns A middleware function that resolves to true if the user's role is allowed;
 *  otherwise responds with 403 and resolves to false.
 */
export const authorizeRoles = ( ...roles: string[] ) => {
    return async (
        req: AuthenticationRequest,
        res: ServerResponse
    ): Promise<boolean> => {
        const userRole = (req.user as User).role;

        if ( !userRole || !roles.includes(userRole) ) {
            res.statusCode = 403;
            res.end( JSON.stringify({
                message: 'Forbidden'
            }) )
            return false;
        }

        return true;
    }
}