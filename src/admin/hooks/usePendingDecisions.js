import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../config/axiosInstance';

export default function usePendingDecisions() {
  const [totalActive, setTotalActive] = useState(null);
  const [totalTraders, setTotalTraders] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trades, setTrades] = useState([]);

  const mountedRef = useRef(true);
  const controllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Fetch first page to get total count
      const firstRes = await axiosInstance.get(
        '/api/admin/trading/history?all=true&page=1&limit=100',
        {
          signal: controller.signal,
        }
      );

      const firstApiBody = firstRes && firstRes.data ? firstRes.data : null;
      const firstPayload =
        firstApiBody && firstApiBody.data ? firstApiBody.data : firstApiBody;

      // Get total pages from pagination
      const totalPages = firstPayload?.pagination?.totalPages || 1;
      const totalTrades = firstPayload?.pagination?.totalTrades || 0;

      // Collect all trades
      let allTrades = [];

      // Get trades from first page
      if (firstPayload && Array.isArray(firstPayload.trades)) {
        allTrades = firstPayload.trades;
      }

      // If there are more pages, fetch them
      if (totalPages > 1 && allTrades.length < totalTrades) {
        const remainingPages = [];
        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(
            axiosInstance.get(
              `/api/admin/trading/history?all=true&page=${page}&limit=100`,
              { signal: controller.signal }
            )
          );
        }

        const responses = await Promise.all(remainingPages);
        responses.forEach((resp) => {
          const respData = resp?.data?.data || resp?.data;
          if (respData && Array.isArray(respData.trades)) {
            allTrades = allTrades.concat(respData.trades);
          }
        });
      }

      // Use the aggregated data
      const res = firstRes;
      const apiBody = firstApiBody;
      const payload = {
        ...firstPayload,
        trades: allTrades,
      };

      // normalize trades list from payload
      let tradesList = [];
      if (Array.isArray(payload)) {
        tradesList = payload;
      } else if (payload && Array.isArray(payload.trades)) {
        tradesList = payload.trades;
      } else if (apiBody && Array.isArray(apiBody.trades)) {
        tradesList = apiBody.trades;
      } else if (apiBody && Array.isArray(apiBody.data)) {
        tradesList = apiBody.data;
      }

      // compute totalActive: prefer pagination.totalTrades, then summary.totalActive, then fallback
      let value = 0;
      if (payload == null) {
        value = 0;
      } else if (
        payload.pagination &&
        typeof payload.pagination.totalTrades === 'number'
      ) {
        value = payload.pagination.totalTrades;
      } else if (
        apiBody &&
        apiBody.pagination &&
        typeof apiBody.pagination.totalTrades === 'number'
      ) {
        value = apiBody.pagination.totalTrades;
      } else if (
        payload.summary &&
        typeof payload.summary.totalActive === 'number'
      ) {
        value = payload.summary.totalActive;
      } else if (typeof payload.total === 'number') {
        value = payload.total;
      } else if (Array.isArray(tradesList)) {
        value = tradesList.length;
      }

      // extract unique users from tradesList
      const usersMap = new Map();
      tradesList.forEach((t) => {
        const user = t?.user;
        if (user) {
          const id = user.id || user._id || null;
          if (id) usersMap.set(String(id), user);
        }
      });
      const uniqueUsers = Array.from(usersMap.values());

      if (mountedRef.current) {
        setTotalActive(Number(value));
        setSummary(
          (payload && payload.summary) || (apiBody && apiBody.summary) || null
        );
        setTrades(tradesList);
        setUsers(uniqueUsers);
        setTotalTraders(uniqueUsers.length);
      }
    } catch (err) {
      const isCanceled =
        err &&
        (err.name === 'CanceledError' ||
          err.name === 'AbortError' ||
          err.code === 'ERR_CANCELED');
      if (!isCanceled && mountedRef.current) {
        console.error('usePendingDecisions error:', err);
        setError(
          err && err.message ? err.message : 'Failed to fetch pending decisions'
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      controllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [fetchData]);

  return {
    totalActive,
    loading,
    error,
    summary,
    trades,
    refresh: fetchData,
  };
}
