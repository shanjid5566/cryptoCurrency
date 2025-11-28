import React, { useState } from 'react';
import usePendingDecisions from '../hooks/usePendingDecisions';

const AllUsersTable = ({ userDatabase, onManage }) => {
  const { totalActive, summary, trades, loading, error, refresh } =
    usePendingDecisions();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Function to generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const totalPages = Math.ceil(trades.length / rowsPerPage);
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = currentPage;
      let endPage = currentPage + 1;

      if (endPage >= totalPages - 1) {
        startPage = totalPages - 2;
        endPage = totalPages;
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      } else {
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages - 1);
        pages.push(totalPages);
      }
    }

    return pages;
  };
  return (
    <div className='card shadow-sm'>
      <div className='card-header d-flex justify-content-between align-items-center'>
        <h5 className='mb-0'>All Traders Overview</h5>
        <button
          className='btn btn-sm btn-primary'
          onClick={refresh}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      <div className='card-body'>
        {/* Pending trades summary */}
        <div className='mb-3'>
          <div className='d-flex align-items-center flex-wrap gap-2'>
            <strong className='me-2'>Pending Trades:</strong>
            {loading ? (
              <span className='text-muted'>Loading...</span>
            ) : (
              <>
                <span className='badge bg-primary me-2'>
                  Total: {totalActive ?? 0}
                </span>
                {summary && (
                  <>
                    <span className='badge bg-secondary me-2'>
                      Expired: {summary.expired ?? 0}
                    </span>
                    <span className='badge bg-success me-2'>
                      Running: {summary.running ?? 0}
                    </span>
                    <span className='badge bg-info me-2'>
                      Manual: {summary.manualMode ?? 0}
                    </span>
                    <span className='badge bg-warning me-2'>
                      Percentage: {summary.percentageMode ?? 0}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className='text-center py-4'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : trades.length === 0 ? (
          <div className='text-center py-4 text-muted'>No trades found</div>
        ) : (
          <div className='table-responsive'>
            <table
              className='table table-hover align-middle mb-0'
              style={{
                borderTop: '1px solid #dee2e6',
                borderBottom: '1px solid #dee2e6',
              }}
            >
              <thead
                style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6',
                }}
              >
                <tr>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    UID
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    User
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    Asset
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    Type
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    Amount
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    Entry Price
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    Suggestion
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    Status
                  </th>
                  <th className='text-nowrap' style={{ fontWeight: '600' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trades
                  .slice(
                    (currentPage - 1) * rowsPerPage,
                    currentPage * rowsPerPage
                  )
                  .map((t) => (
                    <tr key={t.id}>
                      <td>
                        <small className='font-monospace text-muted'>
                          {t.user?.uid || t.user?.id?.substring(0, 8) || 'N/A'}
                        </small>
                      </td>
                      <td>
                        <div className='fw-semibold'>
                          {t.user?.fullName || t.user?.email}
                        </div>
                      </td>
                      <td>
                        <strong>{t.symbol}</strong>
                        <div>
                          <small className='text-muted'>
                            {t.cryptocurrencyName || ''}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            t.tradeType === 'LONG' ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {t.tradeType}
                        </span>
                      </td>
                      <td>${t.amount}</td>
                      <td>
                        $
                        {typeof t.entryPrice === 'number'
                          ? t.entryPrice.toFixed(6)
                          : 'N/A'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            t.suggestedResult === 'WIN'
                              ? 'bg-success'
                              : 'bg-danger'
                          }`}
                        >
                          {t.suggestedResult ||
                            (t.userWinPercentage
                              ? t.userWinPercentage + '%'
                              : '-')}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            t.isExpired ? 'bg-secondary' : 'bg-success'
                          }`}
                        >
                          {t.status || (t.isExpired ? 'EXPIRED' : 'ACTIVE')}
                        </span>
                      </td>
                      <td>
                        <button
                          className='btn btn-sm btn-primary'
                          onClick={() =>
                            onManage(
                              t.user?.uid || t.user?.id || t.userId || t.id
                            )
                          }
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

        {/* Pagination - Bottom */}
        {!loading && trades.length > rowsPerPage && (
          <div className='d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3'>
            <div className='text-muted small text-center text-sm-start'>
              Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
              {Math.min(currentPage * rowsPerPage, trades.length)} of{' '}
              {trades.length} trades
            </div>
            <nav>
              <ul className='pagination pagination-sm mb-0'>
                <li
                  className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                >
                  <button
                    className='page-link'
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                </li>
                {getPaginationNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <li
                        key={`ellipsis-${index}`}
                        className='page-item disabled'
                      >
                        <span className='page-link'>...</span>
                      </li>
                    );
                  }
                  return (
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
                  );
                })}
                <li
                  className={`page-item ${
                    currentPage === Math.ceil(trades.length / rowsPerPage)
                      ? 'disabled'
                      : ''
                  }`}
                >
                  <button
                    className='page-link'
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(trades.length / rowsPerPage)
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
  );
};

export default AllUsersTable;
