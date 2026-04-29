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
    // Restrict to fetch/XHR adapters to prevent plaintext HTTP in Node.js environments
    adapter: ["fetch", "xhr"]
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
