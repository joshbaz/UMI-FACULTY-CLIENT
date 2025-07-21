
import axios from 'axios'

// export const BASE_API_URL = 'http://localhost:5000/api/v1';
export const BASE_API_URL = 'https://drims.alero.digital/api/v1';

export const socketUrl = "https://drims.alero.digital"
// export const socketUrl = "localhost:5000"


// export const socketUrl =
//   process.env.NODE_ENV === "production"
//     ? "drims.alero.digital:5000"
//     : "localhost:5000";

const apiRequest = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
})

apiRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem('umi_auth_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    // config.headers["Content-Type"] = "application/json"
    return config
})

apiRequest.interceptors.response.use((response)=> response, (error)=> {
    if(error.response.status === 401){
      
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("umi_auth_token")
        localStorage.removeItem("umi_auth_state")
      
        window.location.href = "/login"
        // window.location.reload()
    }
    return Promise.reject(error)
})

export default apiRequest

