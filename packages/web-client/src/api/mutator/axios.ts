import Axios, { AxiosRequestConfig, AxiosError } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});



export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const accessToken = localStorage.getItem("accessToken");
  const source = Axios.CancelToken.source();
  const headers = accessToken ? { ...config.headers, Authorization: `Bearer ${accessToken}` } : config.headers;
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    headers: headers,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
