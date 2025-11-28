import axiosInstance from "../config/axiosInstance";

const handleResponse = (res) => res.data;

const handleError = (error) => {
  if (error.response) {
    const e = new Error(error.response.data?.message || "API Error");
    e.status = error.response.status;
    e.data = error.response.data;
    throw e;
  }
  // Network or other errors
  throw new Error(error.message || "Network Error");
};

export const apiGet = async (url, params = {}) => {
  try {
    const res = await axiosInstance.get(url, { params });
    return handleResponse(res);
  } catch (err) {
    return handleError(err);
  }
};

export const apiPost = async (url, data = {}, config = {}) => {
  try {
    const res = await axiosInstance.post(url, data, config);
    return handleResponse(res);
  } catch (err) {
    return handleError(err);
  }
};

export const apiPut = async (url, data = {}, config = {}) => {
  try {
    const res = await axiosInstance.put(url, data, config);
    return handleResponse(res);
  } catch (err) {
    return handleError(err);
  }
};

export const apiDelete = async (url, params = {}) => {
  try {
    const res = await axiosInstance.delete(url, { params });
    return handleResponse(res);
  } catch (err) {
    return handleError(err);
  }
};

const apiService = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};

export default apiService;
