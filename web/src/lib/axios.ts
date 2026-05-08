import axios from "axios";

const noAuth = process.env.NEXT_PUBLIC_NO_AUTH === "true";

const getTestId = () => {
    if (typeof window !== "undefined") return localStorage.getItem("test_user_id");

    return null;
};

const api = axios.create({
    withCredentials: true,
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
    const testId = getTestId();
    if (noAuth && testId) config.headers["x-test-user-id"] = testId;

    return config;
});

export default api;
