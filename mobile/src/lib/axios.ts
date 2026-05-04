import { create } from 'axios';
import Constants from "expo-constants";
import { Platform } from "react-native";

function resolveBaseUrl() {
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
    if (configuredUrl) return configuredUrl;

    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(":")[0];

    if (host) return `http://${host}:3000`;

    if (Platform.OS === "web") return "http://localhost:3000";

    if (Platform.OS === "android") return "http://10.0.2.2:3000";

    return "http://localhost:3000";
}

const api = create({
    withCredentials: true,
    baseURL: resolveBaseUrl(),
});

export default api;
