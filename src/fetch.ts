import axios from "axios";
import fetchAdapter from "@haverstack/axios-fetch-adapter";

const service = axios.create({
  timeout: 30000,
  adapter: fetchAdapter
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
