import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import { Copy } from 'lucide-react';

// Mock transaction data
const mockTransactions = [
  {
    id: 'txn001',
    userId: 'user1234567890',
    userName: 'John Doe',
    type: 'deposit',
    amount: 1500.0,
    currency: 'USDT',
    status: 'pending',
    method: 'TRC20',
    walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5oQHR7E',
    date: '2024-11-13 10:30',
    txHash: '0x1a2b3c4d5e6f...',
    fee: 1.0,
  },
  {
    id: 'txn002',
    userId: 'user0987654321',
    userName: 'Jane Smith',
    type: 'withdrawal',
    amount: 800.0,
    currency: 'BTC',
    status: 'completed',
    method: 'Bitcoin Network',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    date: '2024-11-12 15:45',
    txHash: '0x9f8e7d6c5b4a...',
    fee: 0.0005,
  },
  {
    id: 'txn003',
    userId: 'user5566778899',
    userName: 'Alice Brown',
    type: 'exchange',
    amount: 2000.0,
    currency: 'ETH to USDT',
    status: 'completed',
    method: 'Internal Exchange',
    walletAddress: 'Internal',
    date: '2024-11-11 09:20',
    txHash: 'exchange_internal',
    fee: 10.0,
  },
  {
    id: 'txn004',
    userId: 'user1122334455',
    userName: 'Bob Johnson',
    type: 'deposit',
    amount: 500.0,
    currency: 'ETH',
    status: 'rejected',
    method: 'ERC20',
    walletAddress: '0x742d35Cc6754C0532925a3b8D0C2d0E8b9c1a8e7',
    date: '2024-11-10 14:10',
    txHash: '0x5a4b3c2d1e0f...',
    fee: 0.001,
  },
];

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalExchanges: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialStats();
    fetchTransactions();
  }, []);

  const fetchFinancialStats = async () => {
    try {
      const response = await axiosInstance.get(
        'api/admin/financial/statistics'
      );

      if (response.data.success && response.data.data) {
        const { volume, transactions } = response.data.data;
        setStats({
          totalDeposits: volume.totalDeposits || 0,
          totalWithdrawals: volume.totalWithdrawals || 0,
          totalExchanges: volume.totalExchanges || 0,
          pending: transactions.pending || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching financial statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get(
        'api/admin/financial/transactions'
      );

      if (response.data.success && response.data.data) {
        setTransactions(response.data.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesType =
      filterType === 'all' ||
      txn.type.toUpperCase() === filterType.toUpperCase();
    const matchesStatus =
      filterStatus === 'all' ||
      txn.status.toUpperCase() === filterStatus.toUpperCase();
    const matchesSearch =
      (txn.user?.fullName || txn.user?.email || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.currency.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const updateTransactionStatus = async (action) => {
    try {
      const response = await axiosInstance.post(
        'api/admin/financial/process-transaction',
        {
          transactionId: selectedTransaction.id,
          action: action === 'COMPLETED' ? 'APPROVE' : 'REJECT',
          note: `Transaction ${
            action === 'COMPLETED' ? 'approved' : 'rejected'
          }`,
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Transaction ${
              action === 'COMPLETED' ? 'approved' : 'rejected'
            } successfully!`
        );

        // Update local state 
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.id === selectedTransaction.id ? { ...txn, status: action } : txn
          )
        );

        setSelectedTransaction((prev) => ({ ...prev, status: action }));

        // Refresh data
        fetchTransactions();
        fetchFinancialStats();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to update transaction status'
      );
    }
  };

  const getTotalByType = (type) => {
    return transactions
      .filter((txn) => txn.type === type && txn.status === 'completed')
      .reduce((sum, txn) => sum + txn.amount, 0);
  };

  const getPendingCount = () => {
    return transactions.filter((txn) => txn.status === 'pending').length;
  };

  return (
    <div className='container mt-4 mb-5 px-2 px-sm-3'>
      <h3 className='mb-3 mb-md-4'>Transaction Management</h3>
      {/* Statistics Cards */}
      <div className='row g-3 mb-4'>
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-primary text-white text-center h-100 shadow-sm rounded-3'>
            <div className='card-body'>
              <h4>{loading ? '...' : `$${stats.totalDeposits.toFixed(2)}`}</h4>
              <p>Total Deposits</p>
            </div>
          </div>
        </div>
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-danger text-white text-center h-100 shadow-sm rounded-3'>
            <div className='card-body'>
              <h4>
                {loading ? '...' : `$${stats.totalWithdrawals.toFixed(2)}`}
              </h4>
              <p>Total Withdrawals</p>
            </div>
          </div>
        </div>
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-info text-white text-center h-100 shadow-sm rounded-3'>
            <div className='card-body'>
              <h4>{loading ? '...' : `$${stats.totalExchanges.toFixed(2)}`}</h4>
              <p>Total Exchanges</p>
            </div>
          </div>
        </div>
        <div className='col-12 col-sm-6 col-xl-3'>
          <div className='card bg-warning text-white text-center h-100 shadow-sm rounded-3'>
            <div className='card-body'>
              <h4>{loading ? '...' : stats.pending}</h4>
              <p>Pending Requests</p>
            </div>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className='row g-2 mb-3'>
        <div className='col-12 col-sm-6 col-md-4 col-lg-3'>
          <input
            type='text'
            className='form-control'
            placeholder='Search transactions...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='col-12 col-sm-6 col-md-4 col-lg-3'>
          <select
            className='form-select'
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value='all'>All Types</option>
            <option value='DEPOSIT'>Deposits</option>
            <option value='WITHDRAWAL'>Withdrawals</option>
            <option value='EXCHANGE'>Exchanges</option>
          </select>
        </div>
        <div className='col-12 col-sm-6 col-md-4 col-lg-3'>
          <select
            className='form-select'
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value='all'>All Status</option>
            <option value='PENDING'>Pending</option>
            <option value='COMPLETED'>Completed</option>
            <option value='REJECTED'>Rejected</option>
          </select>
        </div>
      </div>
      {/* Transactions Table */}
      <div className='table-responsive'>
        <table className='table table-striped table-hover table-sm align-middle'>
          <thead
            className='table-dark'
            style={{ position: 'sticky', top: 0, zIndex: 1 }}
          >
            <tr>
              <th className='text-start ps-3'>ID</th>
              <th className='text-start'>User</th>
              <th className='text-start'>Type</th>
              <th className='text-start'>Amount</th>
              <th className='text-start'>Currency</th>
              <th className='text-start'>Method</th>
              <th className='text-start'>Status</th>
              <th className='text-start'>Date</th>
              <th className='text-start'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className='text-start ps-3'>
                    <span
                      style={{
                        cursor: 'pointer',
                        color: '#0d6efd',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => navigator.clipboard.writeText(txn.id)}
                      title='Click to copy'
                    >
                      {txn.id.substring(0, 8)}... <Copy size={14} />
                    </span>
                  </td>
                  <td className='text-start'>
                    <div className='fw-semibold'>
                      {txn.user?.fullName || txn.user?.email || 'N/A'}
                    </div>
                    <small className='text-muted'>UID: {txn.user?.uid}</small>
                  </td>
                  <td className='text-start'>
                    <span
                      className={`badge ${
                        txn.type === 'DEPOSIT'
                          ? 'bg-success'
                          : txn.type === 'WITHDRAWAL'
                          ? 'bg-danger'
                          : 'bg-info'
                      }`}
                    >
                      {txn.type.toLowerCase()}
                    </span>
                  </td>
                  <td className='text-start'>${txn.amount.toFixed(2)}</td>
                  <td className='text-start'>{txn.currency}</td>
                  <td className='text-start'>{txn.method || 'N/A'}</td>
                  <td className='text-start'>
                    <span
                      className={`badge ${
                        txn.status === 'COMPLETED'
                          ? 'bg-success'
                          : txn.status === 'PENDING'
                          ? 'bg-warning'
                          : 'bg-danger'
                      }`}
                    >
                      {txn.status.toLowerCase()}
                    </span>
                  </td>
                  <td className='text-start'>
                    {new Date(txn.createdAt).toLocaleString()}
                  </td>
                  <td className='text-start'>
                    <button
                      className='btn btn-sm btn-primary'
                      onClick={() => setSelectedTransaction(txn)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='9' className='text-center py-4 text-muted'>
                  {loading
                    ? 'Loading transactions...'
                    : 'No transactions found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div
          className='modal d-block'
          tabIndex='-1'
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <div className='modal-dialog modal-lg modal-dialog-centered'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  Transaction Details - {selectedTransaction.id}
                </h5>
                <button
                  className='btn-close'
                  onClick={() => setSelectedTransaction(null)}
                ></button>
              </div>
              <div className='modal-body'>
                <div className='row'>
                  <div className='col-md-6'>
                    <h6 className='text-primary mb-3'>
                      Transaction Information
                    </h6>
                    <table className='table table-sm table-borderless'>
                      <tbody>
                        <tr>
                          <td className='text-muted' style={{ width: '40%' }}>
                            ID:
                          </td>
                          <td>
                            <div
                              className='p-2 rounded'
                              style={{ backgroundColor: '#ffe6f0' }}
                            >
                              <span
                                className='font-monospace small'
                                style={{ color: '#d6336c' }}
                              >
                                {selectedTransaction.id}
                              </span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className='text-muted'>User Name:</td>
                          <td className='fw-semibold'>
                            {selectedTransaction.user?.fullName ||
                              selectedTransaction.user?.email ||
                              'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td className='text-muted'>User UID:</td>
                          <td>
                            <span className='badge bg-secondary'>
                              {selectedTransaction.user?.uid}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='text-muted'>Email:</td>
                          <td>{selectedTransaction.user?.email}</td>
                        </tr>
                        <tr>
                          <td className='text-muted'>Type:</td>
                          <td>
                            <span
                              className={`badge ${
                                selectedTransaction.type === 'DEPOSIT'
                                  ? 'bg-success'
                                  : selectedTransaction.type === 'WITHDRAWAL'
                                  ? 'bg-danger'
                                  : 'bg-info'
                              }`}
                            >
                              {selectedTransaction.type}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='text-muted'>Amount:</td>
                          <td className='fw-bold'>
                            ${selectedTransaction.amount?.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className='text-muted'>Currency:</td>
                          <td className='fw-semibold'>
                            {selectedTransaction.currency}
                          </td>
                        </tr>
                        <tr>
                          <td className='text-muted'>Fee:</td>
                          <td>${selectedTransaction.fee}</td>
                        </tr>
                        {selectedTransaction.netAmount !== undefined && (
                          <tr>
                            <td className='text-muted'>Net Amount:</td>
                            <td className='fw-bold text-success'>
                              ${selectedTransaction.netAmount?.toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className='col-md-6'>
                    <h6 className='text-primary mb-3'>Technical Details</h6>
                    <table className='table table-sm table-borderless'>
                      <tbody>
                        <tr>
                          <td className='text-muted' style={{ width: '45%' }}>
                            Method:
                          </td>
                          <td>{selectedTransaction.method || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className='text-muted'>Wallet Address:</td>
                          <td>
                            {selectedTransaction.walletAddress ? (
                              <div
                                className='p-2 rounded'
                                style={{ backgroundColor: '#ffe6f0' }}
                              >
                                <span
                                  className='font-monospace small'
                                  style={{
                                    color: '#d6336c',
                                    wordBreak: 'break-all',
                                  }}
                                >
                                  {selectedTransaction.walletAddress}
                                </span>
                              </div>
                            ) : (
                              <span className='text-muted'>N/A</span>
                            )}
                          </td>
                        </tr>
                        {selectedTransaction.externalTxId && (
                          <tr>
                            <td className='text-muted'>External TX ID:</td>
                            <td>
                              <code className='d-block p-2 bg-light rounded small'>
                                {selectedTransaction.externalTxId}
                              </code>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className='text-muted'>Created At:</td>
                          <td>
                            {new Date(
                              selectedTransaction.createdAt
                            ).toLocaleString()}
                          </td>
                        </tr>
                        {selectedTransaction.processedAt && (
                          <tr>
                            <td className='text-muted'>Processed At:</td>
                            <td>
                              {new Date(
                                selectedTransaction.processedAt
                              ).toLocaleString()}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className='text-muted'>Status:</td>
                          <td>
                            <span
                              className={`badge ${
                                selectedTransaction.status === 'COMPLETED'
                                  ? 'bg-success'
                                  : selectedTransaction.status === 'PENDING'
                                  ? 'bg-warning'
                                  : 'bg-danger'
                              }`}
                            >
                              {selectedTransaction.status}
                            </span>
                          </td>
                        </tr>
                        {selectedTransaction.processingNote && (
                          <tr>
                            <td className='text-muted'>Note:</td>
                            <td className='fst-italic small'>
                              {selectedTransaction.processingNote}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className='modal-footer justify-content-end gap-2 pt-3'>
                <button
                  className='btn px-4'
                  onClick={() => setSelectedTransaction(null)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '500',
                  }}
                >
                  Close
                </button>
                <button
                  className='btn px-4'
                  onClick={() => updateTransactionStatus('COMPLETED')}
                  style={{
                    backgroundColor: '#198754',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '500',
                  }}
                >
                  Approve
                </button>
                <button
                  className='btn px-4'
                  onClick={() => updateTransactionStatus('REJECTED')}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '500',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
