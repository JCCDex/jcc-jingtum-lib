import axios from "axios";

const service = axios.create({
  timeout: 30000,
  adapter: ["fetch", "xhr", "http"]
});
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default service;
