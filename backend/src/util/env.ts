function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

const ENV = {
    PORT: requireEnv("PORT"),
    NODE_ENV: requireEnv("NODE_ENV") as "production" | "development",
    LOCAL_URL: requireEnv("LOCAL_URL"),
    CLIENT_URL: requireEnv("CLIENT_URL"),
    SERVER_URL: requireEnv("SERVER_URL"),
    DATABASE_URL: requireEnv("DATABASE_URL"),
    CLERK_SECRET_KEY: requireEnv("CLERK_SECRET_KEY"),
    CLERK_PUBLISHABLE_KEY: requireEnv("CLERK_PUBLISHABLE_KEY"),
};

export default ENV;
