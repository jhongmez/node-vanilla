/** In-memory store of revoked tokens; a Set avoids duplicate entries. */
const revokedTokens: Set<string> = new Set();

/**
 * Marks a token as revoked so it can no longer be used to authenticate.
 *
 * @param { string } token - The token to revoke.
 * @returns { void }
 */
export const addRevokeToken = ( token: string ): void => {
    revokedTokens.add( token );
}

/**
 * Checks whether a token has been revoked.
 *
 * @param { string } token - The token to check.
 * @returns { boolean } - true if the token was revoked; otherwise false.
 */
export const isTokenRevoked = ( token: string ): boolean => {
    return revokedTokens.has( token );
}