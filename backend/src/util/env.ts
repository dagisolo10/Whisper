function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

const ENV = {
    PORT: requireEnv("PORT"),
    CLIENT_URL: requireEnv("CLIENT_URL"),
    DATABASE_URL: requireEnv("DATABASE_URL"),
    CLERK_SECRET_KEY: requireEnv("CLERK_SECRET_KEY"),
    CLERK_PUBLISHABLE_KEY: requireEnv("CLERK_PUBLISHABLE_KEY"),
};

export default ENV;
