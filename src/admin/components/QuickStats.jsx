import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';

const QuickStats = () => {
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalWins: 0,
    totalLosses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTradingStats = async () => {
      try {
        const response = await axiosInstance.get(
          '/api/admin/trading/statistics'
        );

        if (response.data.success && response.data.data) {
          const { totalTrades, totalWins, totalLosses } = response.data.data;
          setStats({
            totalTrades: totalTrades || 0,
            totalWins: totalWins || 0,
            totalLosses: totalLosses || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching trading statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingStats();
  }, []);

  return (
    <div className='row g-2 g-md-3 mb-4'>
      <div className='col-md-3 col-12'>
        <div className='card bg-primary text-white text-center'>
          <div className='card-body'>
            <h4>{loading ? '…' : stats.totalTrades}</h4>
            <p>Total Traders</p>
          </div>
        </div>
      </div>
      <div className='col-md-3 col-12'>
        <div className='card bg-success text-white text-center'>
          <div className='card-body'>
            <h4>{loading ? '…' : stats.totalWins}</h4>
            <p>Traders Win</p>
          </div>
        </div>
      </div>
      <div className='col-md-3 col-12'>
        <div className='card bg-danger text-white text-center'>
          <div className='card-body'>
            <h4>{loading ? '…' : stats.totalLosses}</h4>
            <p>Traders Lose</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
