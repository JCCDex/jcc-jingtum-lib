import axios from "axios";

interface ICustomAxiosInterceptorsOptions {
  customRequest?: (config) => void;
  timeout?: number;
  customResponse?: (response) => unknown;
}

export const AxiosInterceptorsFactory = (options?: ICustomAxiosInterceptorsOptions) => {
  const { customRequest, customResponse, timeout } = options || {};

  const service = axios.create({
    timeout: timeout || 30000,
    adapter: ["fetch", "xhr", "http"]
  });

  service.interceptors.request.use(
    async (config) => {
      if (customRequest) {
        await customRequest(config);
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  service.interceptors.response.use(
    async (response) => {
      if (customResponse) {
        return await customResponse(response);
      }
      return response.data;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  return service;
};

export const defaultFetch = AxiosInterceptorsFactory();
