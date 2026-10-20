export const config = {
    jwtSecret: process.env.JWT_SECRET as string || "SECRET_KEY"
}

export default config;