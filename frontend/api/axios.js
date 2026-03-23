import axios from "axios";

const baseURL = "http://72.62.182.26:8080/api/";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error.response exists and status is 401
    // Don't redirect if we're already trying to log in or register
    const isAuthPath =
      originalRequest.url.includes("login") ||
      originalRequest.url.includes("register") ||
      originalRequest.url.includes("password-reset");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthPath
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}refresh/`, {
            refresh: refreshToken,
          });

          if (response.status === 200) {
            localStorage.setItem("access_token", response.data.access);
            api.defaults.headers.common["Authorization"] =
              `Bearer ${response.data.access}`;

            // Dispatch custom event to notify AuthContext of token refresh
            window.dispatchEvent(
              new CustomEvent("tokenRefreshed", {
                detail: { access: response.data.access },
              }),
            );

            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          // Dispatch logout event
          window.dispatchEvent(new Event("authLogout"));
          window.location.href = "/auth/login";
        }
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // Dispatch logout event
        window.dispatchEvent(new Event("authLogout"));
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
