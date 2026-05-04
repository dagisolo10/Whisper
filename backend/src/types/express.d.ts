declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }

    class HttpError extends Error {
        constructor(
            public status: number,
            message: string,
        ) {
            super(message);
        }
    }

}
export {};
