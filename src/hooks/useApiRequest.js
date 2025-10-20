import { BASE_URL } from "../config";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useApiRequest = (options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const refetch = async (url, method = "GET", body = null) => {
    setLoading(true);
    setError(null);

    try {
  // Support both 'token' (canonical) and legacy 'userToken'
  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      // Debug: help trace missing/expired token on refresh
      console.debug(`useApiRequest: calling ${url} method=${method} using token:`, token);

      const response = await axios({
        url: `${BASE_URL}${url}`,
        method,
        data: body,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          ...options.headers,
        },
        ...options,
      });

      setData(response?.data);
      return response?.data;
    } catch (err) {
      // If unauthorized, include status for easier debugging
      const status = err.response?.status;
      console.warn(`useApiRequest: ${method} ${url} failed`, { status, message: err.message });
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, refetch, BASE_URL };
};

export default useApiRequest;
