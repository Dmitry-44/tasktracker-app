interface EnvConfig {
    API_URL: string
}

export const envConfig: EnvConfig = {
    API_URL: import.meta.env.VITE_API_URL
}