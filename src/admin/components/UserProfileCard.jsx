import React, { useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import SimulationModal from './SimulationModal';
import { toast } from 'react-toastify';

const UserProfileCard = ({ userData, simulateTrade }) => {
  const [showSimConfirm, setShowSimConfirm] = useState(false);
  const [showSimResult, setShowSimResult] = useState(false);
  const [simConfig, setSimConfig] = useState({
    type: 'success',
    title: '',
    message: '',
  });
  const [simInput, setSimInput] = useState('');
  const [pendingDecision, setPendingDecision] = useState(null);

  if (!userData) return null;

  const handleManualDecision = (decision) => {
    setPendingDecision(decision === 'win' ? 'WIN' : 'LOSE');
    setSimInput('');
    setShowSimConfirm(true);
  };

  const confirmSimulation = async () => {
    setShowSimConfirm(false);

    if (!userData.tradeId) {
      toast.error('No active trade found for this user');
      return;
    }

    try {
      const payload = {
        tradeId: userData.tradeId,
        decision: pendingDecision,
        reason: simInput || `Admin manual decision: ${pendingDecision}`,
      };

      const response = await axiosInstance.post(
        '/api/admin/trading/manual-decision',
        payload
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Trade decision (${pendingDecision}) applied successfully`
        );
        setSimConfig({
          type: 'success',
          title: 'Success',
          message:
            response.data.message ||
            `Trade decision (${pendingDecision}) applied successfully`,
        });
        setShowSimResult(true);
      }
    } catch (err) {
      console.error('Manual decision error:', err);
      const errorMsg =
        err?.response?.data?.message ||
        err.message ||
        'Failed to apply manual decision';
      toast.error(errorMsg);
      setSimConfig({
        type: 'error',
        title: 'Error',
        message: errorMsg,
      });
      setShowSimResult(true);
    }
  };

  return (
    <div className='col-12'>
      <div className='card shadow-sm border-0'>
        <div
          className='card-header bg-gradient text-white'
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <h5 className='mb-0'>
            <i className='bi bi-person-circle me-2'></i>User Trading Profile
          </h5>
        </div>
        <div className='card-body p-4'>
          {/* Current Active Trade Info */}
          {userData.tradeId ? (
            <>
              {/* Main Trade Info Card */}
              <div className='row g-3 mb-4'>
                <div className='col-md-6'>
                  <div
                    className='card h-100 border-0 shadow-sm'
                    style={{
                      background:
                        'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    }}
                  >
                    <div className='card-body'>
                      <h6 className='text-primary mb-3 fw-bold'>
                        <i className='bi bi-info-circle-fill me-2'></i>User
                        Information
                      </h6>
                      <table className='table table-borderless table-sm mb-0'>
                        <tbody>
                          <tr>
                            <td className='text-muted' style={{ width: '35%' }}>
                              Trade ID
                            </td>
                            <td className='font-monospace fw-semibold text-dark small'>
                              {userData.tradeId}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='2'>
                              <hr className='my-1' />
                            </td>
                          </tr>
                          <tr>
                            <td className='text-muted'>User UID</td>
                            <td>
                              <span className='badge bg-secondary px-3 py-1'>
                                {userData.uid}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className='text-muted'>Email</td>
                            <td className='fw-semibold'>{userData.email}</td>
                          </tr>
                          <tr>
                            <td className='text-muted'>Name</td>
                            <td className='fw-semibold text-dark'>
                              {userData.name}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div
                    className='card h-100 border-0 shadow-sm'
                    style={{
                      background:
                        'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
                    }}
                  >
                    <div className='card-body'>
                      <h6 className='text-danger mb-3 fw-bold'>
                        <i className='bi bi-graph-up-arrow me-2'></i>Trade
                        Details
                      </h6>
                      <div className='mb-2'>
                        <small className='text-muted'>Symbol</small>
                        <div className='fw-bold fs-4 text-dark'>
                          {userData.symbol}
                        </div>
                      </div>
                      <hr className='my-2' />
                      <div className='row g-2'>
                        <div className='col-6'>
                          <small className='text-muted d-block'>Type</small>
                          <span
                            className={`badge ${
                              userData.tradeType === 'LONG'
                                ? 'bg-success'
                                : 'bg-danger'
                            } px-3 py-1`}
                          >
                            {userData.tradeType}
                          </span>
                        </div>
                        <div className='col-6'>
                          <small className='text-muted d-block'>Amount</small>
                          <div className='fw-bold text-dark'>
                            ${userData.amount}
                          </div>
                        </div>
                      </div>
                      <div className='mt-2'>
                        <small className='text-muted'>Entry Price</small>
                        <div className='fw-bold fs-5 text-primary'>
                          ${userData.entryPrice}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              {(userData.durationSeconds ||
                userData.expiresAt ||
                userData.createdAt ||
                userData.decidedAt) && (
                <div
                  className='card border-0 shadow-sm mb-4'
                  style={{
                    background:
                      'linear-gradient(135deg, #ffecd215 0%, #fcb69f15 100%)',
                  }}
                >
                  <div className='card-body'>
                    <h6 className='text-info mb-3 fw-bold'>
                      <i className='bi bi-clock-history me-2'></i>Timeline
                      Information
                    </h6>
                    <div className='row g-3'>
                      {userData.durationSeconds && (
                        <div className='col-md-3 col-6'>
                          <small className='text-muted d-block'>Duration</small>
                          <span className='fw-semibold text-dark'>
                            {userData.durationSeconds}s
                          </span>
                        </div>
                      )}
                      {userData.expiresAt && (
                        <div className='col-md-3 col-6'>
                          <small className='text-muted d-block'>
                            Expires At
                          </small>
                          <span className='fw-semibold text-dark small'>
                            {new Date(userData.expiresAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {userData.createdAt && (
                        <div className='col-md-3 col-6'>
                          <small className='text-muted d-block'>
                            Created At
                          </small>
                          <span className='fw-semibold text-dark small'>
                            {new Date(userData.createdAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {userData.decidedAt && (
                        <div className='col-md-3 col-6'>
                          <small className='text-muted d-block'>
                            Decided At
                          </small>
                          <span className='fw-semibold text-dark small'>
                            {new Date(userData.decidedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {userData.decidedBy && (
                      <div className='mt-3 pt-3 border-top'>
                        <small className='text-muted d-block mb-1'>
                          Decided By (Admin ID)
                        </small>
                        <span className='font-monospace small badge bg-secondary'>
                          {userData.decidedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Decision Section */}
              <div className='card border-0 shadow-sm bg-white'>
                <div className='card-body'>
                  <h6 className='text-dark mb-3 fw-bold'>
                    <i className='bi bi-lightning-charge-fill me-2'></i>Manual
                    Trade Decision
                  </h6>
                  <div className='d-flex gap-3'>
                    <button
                      className='btn btn-success btn-lg px-4'
                      onClick={() => handleManualDecision('win')}
                    >
                      <i className='bi bi-check-circle-fill me-2'></i>
                      Force Win
                    </button>
                    <button
                      className='btn btn-danger btn-lg px-4'
                      onClick={() => handleManualDecision('loss')}
                    >
                      <i className='bi bi-x-circle-fill me-2'></i>
                      Force Loss
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className='text-center py-5'>
              <div className='mb-4'>
                <i
                  className='bi bi-inbox text-muted'
                  style={{ fontSize: '4rem', opacity: 0.3 }}
                ></i>
              </div>
              <h5 className='text-muted mb-2'>No Active Trade Found</h5>
              <p className='text-muted mb-3'>
                User{' '}
                <span className='badge bg-secondary mx-1'>{userData.uid}</span>
                <span className='text-dark'>({userData.email})</span> does not
                have any active trades.
              </p>
              <div className='alert alert-info d-inline-block'>
                <i className='bi bi-info-circle me-2'></i>
                Trade information will appear here when user places a trade.
              </div>
            </div>
          )}
        </div>
      </div>

      <SimulationModal
        showConfirm={showSimConfirm}
        showResult={showSimResult}
        simConfig={simConfig}
        simInput={simInput}
        onSimInputChange={(v) => setSimInput(v)}
        onCancelConfirm={() => {
          setShowSimConfirm(false);
          setShowSimResult(false);
        }}
        onConfirmOk={confirmSimulation}
        onCloseResult={() => setShowSimResult(false)}
      />
    </div>
  );
};

export default UserProfileCard;
