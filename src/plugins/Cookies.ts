
import Cookies from 'js-cookie'
import { envConfig } from './envConfig';

const getBearerToken = () => {
    return Cookies.get(envConfig.BEARER_COOKIE_NAME) || ''
}

const clearBearerToken = () => {
    Cookies.remove(envConfig.BEARER_COOKIE_NAME)
}

export {getBearerToken, clearBearerToken}