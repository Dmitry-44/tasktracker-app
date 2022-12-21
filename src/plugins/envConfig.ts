interface EnvConfig {
    API_URL: string,
    BEARER_COOKIE_NAME: string,
}

export const envConfig: EnvConfig = {
    API_URL: import.meta.env.VITE_API_URL,
    BEARER_COOKIE_NAME: import.meta.env.VITE_BEARER_COOKIE_NAME
}