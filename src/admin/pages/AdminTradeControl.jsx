import React, { useState } from 'react';
import QuickStats from '../components/QuickStats';
import UserProfileCard from '../components/UserProfileCard';
import AllUsersTable from '../components/AllUsersTable';
import usePendingDecisions from '../hooks/usePendingDecisions';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';

const AdminTradeControl = () => {
  const [uid, setUid] = useState('');
  console.log(uid);
  const [userData, setUserData] = useState(null);
  console.log(userData);
  const [tradeMode, setTradeMode] = useState('');
  const [customWinRate, setCustomWinRate] = useState(50);
  const [message, setMessage] = useState('');
  const [userDatabase, setUserDatabase] = useState({});
  const [activeTab, setActiveTab] = useState('individual');
  const [activeTrades, setActiveTrades] = useState([]);
  const [loadingActiveTrades, setLoadingActiveTrades] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [demoBalanceForm, setDemoBalanceForm] = useState({
    uid: '',
    currencyCode: 'USDT',
    newDemoBalance: '',
    reason: '',
  });
  const { trades } = usePendingDecisions();

  const fetchUser = async (id) => {
    try {
      const lookup = typeof id === 'string' && id.length > 0 ? id : uid;
      const trimmed = (lookup || '').toString().trim();
      console.log('Fetching user with ID:', trimmed);

      if (!trimmed) {
        toast.error('Please enter a User UID before fetching.');
        setMessage('Please enter a User UID before fetching.');
        setUserData(null);
        return;
      }

      try {
        console.log('Attempting to fetch from all users API for UID:', trimmed);
        const response = await axiosInstance.get(
          '/api/admin/trading/history?all=true&page=1&limit=100'
        );
        console.log('All users API Response:', response.data);

        if (response.data.success && response.data.data) {
          const payload = response.data.data;
          const allTrades = payload.trades || [];

          // Find user by UID from trades
          const userTrade = allTrades.find(
            (t) =>
              t.user?.uid === trimmed ||
              t.user?.id === trimmed ||
              t.userId === trimmed
          );

          if (userTrade && userTrade.user) {
            const apiUser = userTrade.user;
            console.log('Found user in all users:', apiUser);

            const user = {
              id: apiUser.id,
              uid: apiUser.uid || userTrade.uid || apiUser.id,
              email: apiUser.email || '',
              name: apiUser.fullName || apiUser.email?.split('@')[0] || 'User',
              fullName: apiUser.fullName || '',
              tradingBalance: apiUser.tradingBalance,
              profitLoss: userTrade.profitLoss,
              tradeId: userTrade.id,
              symbol: userTrade.symbol,
              tradeType: userTrade.tradeType,
              amount: userTrade.amount,
              entryPrice: userTrade.entryPrice,
              exitPrice: userTrade.exitPrice,
              status: userTrade.status,
              durationSeconds: userTrade.durationSeconds,
              expiresAt: userTrade.expiresAt,
              userWinPercentage: userTrade.userWinPercentage,
              randomNumber: userTrade.randomNumber,
              autoResult: userTrade.autoResult,
              adminDecision: userTrade.adminDecision,
              result: userTrade.result,
              outcomeReason: userTrade.outcomeReason,
              decidedBy: userTrade.decidedBy,
              decidedAt: userTrade.decidedAt,
              createdAt: userTrade.createdAt,
            };
            console.log('Processed user data:', user);
            setUserData(user);
            setTradeMode(user.tradeMode || 'random');
            setCustomWinRate(user.customWinRate || 50);
            setMessage('User loaded successfully.');
            toast.success('User loaded successfully!');
            return;
          } else {
            console.log('User not found in first page, checking more pages...');
            // If not found in first page, check more pages if available
            const totalPages = payload.pagination?.totalPages || 1;

            if (totalPages > 1) {
              for (let page = 2; page <= totalPages; page++) {
                const pageResponse = await axiosInstance.get(
                  `/api/admin/trading/history?all=true&page=${page}&limit=100`
                );
                const pageTrades = pageResponse.data?.data?.trades || [];
                const foundUser = pageTrades.find(
                  (t) =>
                    t.user?.uid === trimmed ||
                    t.user?.id === trimmed ||
                    t.userId === trimmed
                );

                if (foundUser && foundUser.user) {
                  const apiUser = foundUser.user;
                  const user = {
                    id: apiUser.id,
                    uid: apiUser.uid || foundUser.uid || apiUser.id,
                    email: apiUser.email || '',
                    name:
                      apiUser.fullName ||
                      apiUser.email?.split('@')[0] ||
                      'User',
                    fullName: apiUser.fullName || '',
                    tradingBalance: apiUser.tradingBalance,
                    profitLoss: foundUser.profitLoss,
                    tradeId: foundUser.id,
                    symbol: foundUser.symbol,
                    tradeType: foundUser.tradeType,
                    amount: foundUser.amount,
                    entryPrice: foundUser.entryPrice,
                    exitPrice: foundUser.exitPrice,
                    status: foundUser.status,
                    durationSeconds: foundUser.durationSeconds,
                    expiresAt: foundUser.expiresAt,
                    userWinPercentage: foundUser.userWinPercentage,
                    randomNumber: foundUser.randomNumber,
                    autoResult: foundUser.autoResult,
                    adminDecision: foundUser.adminDecision,
                    result: foundUser.result,
                    outcomeReason: foundUser.outcomeReason,
                    decidedBy: foundUser.decidedBy,
                    decidedAt: foundUser.decidedAt,
                    createdAt: foundUser.createdAt,
                  };
                  setUserData(user);
                  setTradeMode(user.tradeMode || 'random');
                  setCustomWinRate(user.customWinRate || 50);
                  setMessage('User loaded successfully.');
                  toast.success('User loaded successfully!');
                  return;
                }
              }
            }

            throw new Error('User not found in all users');
          }
        }
      } catch (apiError) {
        console.log(
          'API fetch failed, trying pending trades:',
          apiError.response?.data || apiError.message
        );

        // Fallback to pending trades from usePendingDecisions hook
        const match = Array.isArray(trades)
          ? trades.find(
              (t) =>
                t.user?.uid === trimmed ||
                t.user?.id === trimmed ||
                t.userId === trimmed ||
                t.userEmail === trimmed ||
                t.id === trimmed
            )
          : null;

        if (match) {
          const apiUser = match.user;
          if (apiUser) {
            const user = {
              id: apiUser.id,
              uid: apiUser.uid || match.uid || apiUser.id,
              email: apiUser.email || match.userEmail || '',
              name: apiUser.fullName || apiUser.email?.split('@')[0] || 'User',
              fullName: apiUser.fullName || '',
              tradingBalance: apiUser.tradingBalance,
              profitLoss: match.profitLoss,
              tradeId: match.id,
              symbol: match.symbol,
              tradeType: match.tradeType,
              amount: match.amount,
              entryPrice: match.entryPrice,
              exitPrice: match.exitPrice,
              status: match.status,
              durationSeconds: match.durationSeconds,
              expiresAt: match.expiresAt,
              userWinPercentage: match.userWinPercentage,
              randomNumber: match.randomNumber,
              autoResult: match.autoResult,
              adminDecision: match.adminDecision,
              result: match.result,
              outcomeReason: match.outcomeReason,
              decidedBy: match.decidedBy,
              decidedAt: match.decidedAt,
              createdAt: match.createdAt,
            };
            setUserData(user);
            setTradeMode('pending');
            setCustomWinRate(50);
            setMessage('User loaded from pending trades.');
            toast.success('User loaded from pending trades!');
          } else {
            setUserData(null);
            setMessage('User not found in database or pending trades');
            toast.error('User not found in database or pending trades');
          }
        } else {
          setUserData(null);
          setMessage('User not found in database or pending trades');
          toast.error('User not found in database or pending trades');
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage('Error fetching user.');
    }
  };

  const updateTradeMode = () => {
    try {
      setUserDatabase((prev) => ({
        ...prev,
        [uid]: {
          ...prev[uid],
          tradeMode,
          customWinRate: tradeMode === 'custom' ? customWinRate : undefined,
        },
      }));
      setMessage('Trade mode updated successfully.');
    } catch (error) {
      console.error('Error updating trade mode:', error);
      setMessage('Failed to update trade mode.');
    }
  };

  const simulateTrade = (result) => {
    if (!userData) return;

    const updatedUser = { ...userData };
    updatedUser.totalTrades += 1;
    updatedUser.lastTradeResult = result;

    if (result === 'win') {
      updatedUser.winStreak += 1;
      updatedUser.lossStreak = 0;
      updatedUser.profitLoss += 50;
      updatedUser.tradingBalance += 50;
    } else {
      updatedUser.lossStreak += 1;
      updatedUser.winStreak = 0;
      updatedUser.profitLoss -= 50;
      updatedUser.tradingBalance -= 50;
    }

    // Recalculate win rate
    const totalWins =
      Math.round((userData.winRate / 100) * userData.totalTrades) +
      (result === 'win' ? 1 : 0);
    updatedUser.winRate = Math.round(
      (totalWins / updatedUser.totalTrades) * 100
    );

    setUserDatabase((prev) => ({
      ...prev,
      [uid]: updatedUser,
    }));

    setUserData(updatedUser);
    const simMessage = `Trade simulated: ${result.toUpperCase()}!`;
    setMessage(simMessage);
  };

  const fetchActiveTrades = async () => {
    try {
      setLoadingActiveTrades(true);
      const response = await axiosInstance.get('/api/trading/active-trades');

      if (response.data.success) {
        setActiveTrades(response.data.data.trades || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching active trades:', error);
      toast.error('Failed to fetch active trades');
    } finally {
      setLoadingActiveTrades(false);
    }
  };

  const handleDemoBalanceSubmit = async () => {
    try {
      if (!demoBalanceForm.uid) {
        toast.error('Please enter User UID');
        return;
      }

      const response = await axiosInstance.post(
        '/api/admin/users/update-demo-balance',
        demoBalanceForm
      );

      if (response.data.success) {
        toast.success('Demo balance updated successfully!');
        setDemoBalanceForm({
          uid: '',
          currencyCode: 'USDT',
          newDemoBalance: '',
          reason: '',
        });
      }
    } catch (error) {
      console.error('Error updating demo balance:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update demo balance'
      );
    }
  };

  return (
    <div className='container mt-4 px-2 px-md-3'>
      <h3 className='mb-4'>Advanced Trade Control</h3>

      <QuickStats />

      {/* Tab Buttons */}
      <div
        className='mb-3 d-grid d-md-flex flex-wrap gap-2'
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
      >
        <button
          className={`btn ${
            activeTab === 'individual' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setActiveTab('individual')}
        >
          Individual
        </button>
        <button
          className={`btn ${
            activeTab === 'activeTrades' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => {
            setActiveTab('activeTrades');
            fetchActiveTrades();
          }}
        >
          Active Traders
        </button>
        <button
          className={`btn ${
            activeTab === 'allUsers' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setActiveTab('allUsers')}
        >
          All Users
        </button>

        <button
          className={`btn ${
            activeTab === 'demoBalance' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setActiveTab('demoBalance')}
        >
          Demo Balance
        </button>
      </div>

      {activeTab === 'individual' ? (
        // Individual User Control
        <>
          <div className='mb-3'>
            <input
              type='text'
              className='form-control'
              placeholder='Enter User UID (e.g., 2247777)'
              value={uid}
              onChange={(e) => setUid(e.target.value)}
            />
            <button
              className='btn btn-primary mt-2 me-2'
              onClick={() => fetchUser()}
            >
              Fetch User
            </button>
          </div>
          {userData && (
            <div className='row'>
              <UserProfileCard
                userData={userData}
                simulateTrade={simulateTrade}
              />
              {/* <TradeModeForm tradeMode={tradeMode} setTradeMode={setTradeMode} customWinRate={customWinRate} setCustomWinRate={setCustomWinRate} updateTradeMode={updateTradeMode} /> */}
            </div>
          )}
        </>
      ) : activeTab === 'activeTrades' ? (
        // Active Traders
        <div className='card shadow-sm'>
          <div className='card-header d-flex justify-content-between align-items-center'>
            <h5 className='mb-0'>Active Traders</h5>
            <button
              className='btn btn-sm btn-primary'
              onClick={fetchActiveTrades}
              disabled={loadingActiveTrades}
            >
              {loadingActiveTrades ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className='card-body'>
            {loadingActiveTrades ? (
              <div className='text-center py-4'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            ) : activeTrades.length === 0 ? (
              <div className='text-center py-4 text-muted'>
                No active trades found
              </div>
            ) : (
              <div className='table-responsive'>
                <table className='table table-hover align-middle mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th className='text-nowrap'>UID</th>
                      <th className='text-nowrap'>User</th>
                      <th className='text-nowrap'>Asset</th>
                      <th className='text-nowrap'>Type</th>
                      <th className='text-nowrap'>Amount</th>
                      <th className='text-nowrap'>Entry Price</th>
                      <th className='text-nowrap'>Current Price</th>
                      <th className='text-nowrap'>P&L</th>
                      <th className='text-nowrap'>Time Remaining</th>
                      <th className='text-nowrap'>Status</th>
                      <th className='text-nowrap'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrades
                      .slice(
                        (currentPage - 1) * rowsPerPage,
                        currentPage * rowsPerPage
                      )
                      .map((trade) => (
                        <tr key={trade.id}>
                          <td>
                            <small className='font-monospace text-muted'>
                              {trade.userUid || 'N/A'}
                            </small>
                          </td>
                          <td>
                            <div className='fw-semibold'>
                              {trade.userName || trade.userEmail}
                            </div>
                          </td>
                          <td>
                            <strong>{trade.symbol}</strong>
                            <div>
                              <small className='text-muted'>
                                {trade.cryptocurrencyName}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                trade.tradeType === 'LONG'
                                  ? 'bg-success'
                                  : 'bg-danger'
                              }`}
                            >
                              {trade.tradeType}
                            </span>
                          </td>
                          <td>
                            <span className='fw-bold text-primary'>
                              ${trade.amount}
                            </span>
                          </td>
                          <td>
                            $
                            {typeof trade.entryPrice === 'number'
                              ? trade.entryPrice.toFixed(6)
                              : 'N/A'}
                          </td>
                          <td>
                            $
                            {typeof trade.currentPrice === 'number'
                              ? trade.currentPrice.toFixed(6)
                              : 'N/A'}
                          </td>
                          <td>
                            <span
                              className={
                                trade.currentProfitLoss >= 0
                                  ? 'text-success fw-bold'
                                  : 'text-danger fw-bold'
                              }
                            >
                              {trade.currentProfitLoss >= 0 ? '+' : ''}
                              {typeof trade.currentProfitLoss === 'number'
                                ? trade.currentProfitLoss.toFixed(2)
                                : '0.00'}
                            </span>
                          </td>
                          <td>
                            <div className='d-flex flex-column'>
                              <span className='fw-semibold'>
                                {trade.timeRemainingFormatted}
                              </span>
                              <small className='text-muted'>
                                {trade.duration}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                trade.isExpired ? 'bg-secondary' : 'bg-success'
                              }`}
                            >
                              {trade.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className='btn btn-sm btn-primary'
                              onClick={() => {
                                setUid(trade.userUid);
                                setActiveTab('individual');
                                fetchUser(trade.userUid);
                              }}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loadingActiveTrades && activeTrades.length > rowsPerPage && (
              <div className='d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 px-2 pb-3'>
                <div className='text-muted small text-center text-sm-start'>
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(currentPage * rowsPerPage, activeTrades.length)} of{' '}
                  {activeTrades.length} trades
                </div>
                <nav>
                  <ul className='pagination pagination-sm mb-0'>
                    <li
                      className={`page-item ${
                        currentPage === 1 ? 'disabled' : ''
                      }`}
                    >
                      <button
                        className='page-link'
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                    </li>
                    {Array.from(
                      { length: Math.ceil(activeTrades.length / rowsPerPage) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? 'active' : ''
                        }`}
                      >
                        <button
                          className='page-link'
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage ===
                        Math.ceil(activeTrades.length / rowsPerPage)
                          ? 'disabled'
                          : ''
                      }`}
                    >
                      <button
                        className='page-link'
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={
                          currentPage ===
                          Math.ceil(activeTrades.length / rowsPerPage)
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'allUsers' ? (
        // All Users Overview
        <AllUsersTable
          userDatabase={userDatabase}
          onManage={(userId) => {
            setUid(userId);
            setActiveTab('individual');
            fetchUser(userId);
          }}
        />
      ) : (
        <div className='card shadow-sm'>
          <div className='card-body'>
            <h5 className='card-title mb-4'>Add Demo Balance</h5>
            <div className='mb-3'>
              <label className='form-label'>User UID</label>
              <input
                type='text'
                className='form-control'
                placeholder='Enter User UID'
                value={demoBalanceForm.uid}
                onChange={(e) =>
                  setDemoBalanceForm({
                    ...demoBalanceForm,
                    uid: e.target.value,
                  })
                }
              />
            </div>
            <div className='mb-3'>
              <label className='form-label'>Currency Code</label>
              <select
                className='form-select'
                value={demoBalanceForm.currencyCode}
                onChange={(e) =>
                  setDemoBalanceForm({
                    ...demoBalanceForm,
                    currencyCode: e.target.value,
                  })
                }
              >
                <option value='USDT'>USDT</option>
                <option value='BTC'>BTC</option>
                <option value='ETH'>ETH</option>
                <option value='USD'>USD</option>
              </select>
            </div>
            <div className='mb-3'>
              <label className='form-label'>New Demo Balance</label>
              <input
                type='number'
                className='form-control'
                placeholder='Enter amount'
                value={demoBalanceForm.newDemoBalance}
                onChange={(e) =>
                  setDemoBalanceForm({
                    ...demoBalanceForm,
                    newDemoBalance: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className='mb-3'>
              <label className='form-label'>Reason</label>
              <textarea
                className='form-control'
                rows='3'
                placeholder='Enter reason for adding balance'
                value={demoBalanceForm.reason}
                onChange={(e) =>
                  setDemoBalanceForm({
                    ...demoBalanceForm,
                    reason: e.target.value,
                  })
                }
              ></textarea>
            </div>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() => {
                  setDemoBalanceForm({
                    uid: '',
                    currencyCode: 'USDT',
                    newDemoBalance: '',
                    reason: '',
                  });
                }}
              >
                Reset Form
              </button>
              <button
                type='button'
                className='btn btn-success'
                onClick={handleDemoBalanceSubmit}
              >
                Add Balance
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInDown { from { transform: translateY(-40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AdminTradeControl;
