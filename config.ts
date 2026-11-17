/**
 * Application configuration loaded from environment variables.
 *
 * @property { string } jwtSecret - Secret key used to sign and verify JWT tokens.
 *  Falls back to `"SECRET_KEY"` when the `JWT_SECRET` environment variable is not set.
 */
export const config = {
    jwtSecret: process.env.JWT_SECRET as string || "SECRET_KEY"
}

export default config;