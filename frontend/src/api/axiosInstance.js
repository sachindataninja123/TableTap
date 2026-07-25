import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://tabletap-backend-s04v.onrender.com/api/v1",
  withCredentials: true,
});

export default axiosInstance;
