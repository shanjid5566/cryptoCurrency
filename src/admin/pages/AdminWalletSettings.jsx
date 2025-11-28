import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import { ChevronLeft, Trash2, AlertTriangle } from 'lucide-react';

const AdminWalletSettings = () => {
  const [inputWallets, setInputWallets] = useState({
    trcWallet: '',
    ercWallet: '',
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState({});
  const [loading, setLoading] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState({
    trc: null,
    erc: null,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    addressId: null,
    network: '',
  });

  // Fetch existing addresses when component mounts or asset changes
  useEffect(() => {
    if (selectedAsset) {
      fetchDepositAddresses();
    }
  }, [selectedAsset]);

  const fetchDepositAddresses = async () => {
    try {
      const response = await axiosInstance.get(
        '/api/financial/deposit-addresses'
      );
      if (response.data.success) {
        const addresses = response.data.data.addresses;
        const addressesByAsset = {};

        addresses.forEach((addr) => {
          if (!addressesByAsset[addr.currency]) {
            addressesByAsset[addr.currency] = {};
          }
          addressesByAsset[addr.currency][addr.network] = addr;
        });

        setSavedAddresses(addressesByAsset);
      }
    } catch (error) {
      console.error('Error fetching deposit addresses:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setInputWallets((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setInputWallets({ trcWallet: '', ercWallet: '' });
  };

  const saveWalletAddress = async (network, address) => {
    if (!address.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    const payload = {
      currencyCode: selectedAsset,
      network: network,
      address: address,
    };

    console.log('=== Saving Wallet Address ===');
    console.log('Network:', network);
    console.log('Address:', address);
    console.log('Currency:', selectedAsset);
    console.log('Full Payload:', JSON.stringify(payload, null, 2));

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        '/api/financial/deposit-addresses',
        payload
      );

      console.log('=== API Response ===');
      console.log('Response:', response.data);

      if (response.data.success) {
        toast.success(`${network} address added successfully!`);
        setInputWallets({ trcWallet: '', ercWallet: '' });
        fetchDepositAddresses();
      }
    } catch (error) {
      console.error('=== Error Saving Wallet Address ===');
      console.error('Error:', error);
      console.error('Error Response:', error.response?.data);
      toast.error('Failed to save wallet address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateWalletAddress = async (addressId, network, newAddress) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/api/financial/deposit-addresses/${addressId}`,
        {
          address: newAddress,
        }
      );

      if (response.data.success) {
        toast.success(`${network} address updated successfully!`);
        setEditingAddress({ trc: null, erc: null });
        fetchDepositAddresses();
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      toast.error('Failed to update wallet address.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (addressId, network) => {
    setDeleteTarget({ addressId, network });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget({ addressId: null, network: '' });
  };

  const confirmDelete = async () => {
    const { addressId, network } = deleteTarget;

    try {
      setLoading(true);
      const response = await axiosInstance.delete(
        `/api/financial/deposit-addresses/${addressId}`
      );

      if (response.data.success) {
        toast.success(`${network} address deleted successfully!`);
        fetchDepositAddresses();
        closeDeleteModal();
      }
    } catch (error) {
      console.error('Error deleting wallet address:', error);
      toast.error('Failed to delete wallet address.');
    } finally {
      setLoading(false);
    }
  };

  const currentAddresses = selectedAsset
    ? savedAddresses[selectedAsset] || {}
    : {};

  return (
    <div className='container mt-4'>
      <h3>Wallet Settings</h3>

      {selectedAsset && (
        <div className='mb-3'>
          <button
            className='btn back-btn btn-sm btn-outline-primary d-flex align-items-center'
            onClick={() => setSelectedAsset(null)}
          >
            <ChevronLeft size={16} className='me-1' />
            Back
          </button>
        </div>
      )}

      <div className='row g-3 g-md-4'>
        <div className={selectedAsset ? 'col-12 col-md-8' : 'col-12'}>
          {selectedAsset ? (
            <div className='card h-100'>
              <div className='card-header'>
                <div className='d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0'>Update Wallet Addresses</h5>
                  <div>
                    <small className='text-muted me-2'>{selectedAsset}</small>
                  </div>
                </div>
              </div>
              <div className='card-body d-flex flex-column justify-content-center'>
                <div className='mb-4'>
                  <label className='form-label'>
                    <strong>TRC20 Wallet Address (Tron Network)</strong>
                  </label>
                  <div className='input-group'>
                    <input
                      type='text'
                      className='form-control'
                      value={inputWallets.trcWallet}
                      onChange={(e) =>
                        handleInputChange('trcWallet', e.target.value)
                      }
                      placeholder='Enter TRC20 wallet address'
                    />
                    <button
                      className='btn btn-primary'
                      onClick={() =>
                        saveWalletAddress('TRC20', inputWallets.trcWallet)
                      }
                      disabled={loading || !inputWallets.trcWallet.trim()}
                    >
                      {loading ? 'Saving...' : 'Save TRC20'}
                    </button>
                  </div>
                  <small className='text-muted'>
                    This address will be used for {selectedAsset} TRC20, TRX and
                    other Tron-based tokens
                  </small>
                </div>

                <div className='mb-0'>
                  <label className='form-label'>
                    <strong>ERC20 Wallet Address (Ethereum Network)</strong>
                  </label>
                  <div className='input-group'>
                    <input
                      type='text'
                      className='form-control'
                      value={inputWallets.ercWallet}
                      onChange={(e) =>
                        handleInputChange('ercWallet', e.target.value)
                      }
                      placeholder='Enter ERC20 wallet address'
                    />
                    <button
                      className='btn btn-primary'
                      onClick={() =>
                        saveWalletAddress('ERC20', inputWallets.ercWallet)
                      }
                      disabled={loading || !inputWallets.ercWallet.trim()}
                    >
                      {loading ? 'Saving...' : 'Save ERC20'}
                    </button>
                  </div>
                  <small className='text-muted'>
                    This address will be used for {selectedAsset} ERC20, ETH,
                    USDC and other Ethereum-based tokens
                  </small>
                </div>
              </div>
            </div>
          ) : (
            <div className='card'>
              <div className='card-header'>
                <h5 className='mb-0'>Select Asset</h5>
              </div>
              <div className='card-body'>
                <div className='row g-3'>
                  {['USDT', 'USDC', 'ETH', 'BTC'].map((asset) => (
                    <div key={asset} className='col-12 col-md-6'>
                      <button
                        type='button'
                        className='btn btn-outline-secondary py-3 px-4 text-uppercase w-100 option-btn'
                        style={{ borderRadius: 6 }}
                        onClick={() => handleSelectAsset(asset)}
                      >
                        {asset}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedAsset && (
          <div className='col-md-4 col-12'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5>Current Settings</h5>
              </div>
              <div className='card-body'>
                {/* TRC20 Address Section */}
                <div className='mb-3 pb-3 border-bottom'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <strong>TRC20 Address:</strong>
                    {currentAddresses.TRC20 && (
                      <div className='btn-group btn-group-sm'>
                        <button
                          className='btn btn-outline-primary'
                          onClick={() =>
                            setEditingAddress({
                              ...editingAddress,
                              trc: currentAddresses.TRC20.address,
                            })
                          }
                          disabled={loading}
                        >
                          Update
                        </button>
                        <button
                          className='btn btn-outline-danger'
                          onClick={() =>
                            openDeleteModal(currentAddresses.TRC20.id, 'TRC20')
                          }
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {editingAddress.trc ? (
                    <div className='input-group input-group-sm'>
                      <input
                        type='text'
                        className='form-control'
                        value={editingAddress.trc}
                        onChange={(e) =>
                          setEditingAddress({
                            ...editingAddress,
                            trc: e.target.value,
                          })
                        }
                      />
                      <button
                        className='btn btn-success'
                        onClick={() =>
                          updateWalletAddress(
                            currentAddresses.TRC20.id,
                            'TRC20',
                            editingAddress.trc
                          )
                        }
                      >
                        Save
                      </button>
                      <button
                        className='btn btn-secondary'
                        onClick={() =>
                          setEditingAddress({ ...editingAddress, trc: null })
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className='small text-break mb-0'>
                      {currentAddresses.TRC20?.address || 'Not set'}
                    </p>
                  )}
                </div>

                {/* ERC20 Address Section */}
                <div className='mb-3'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <strong>ERC20 Address:</strong>
                    {currentAddresses.ERC20 && (
                      <div className='btn-group btn-group-sm'>
                        <button
                          className='btn btn-outline-primary'
                          onClick={() =>
                            setEditingAddress({
                              ...editingAddress,
                              erc: currentAddresses.ERC20.address,
                            })
                          }
                          disabled={loading}
                        >
                          Update
                        </button>
                        <button
                          className='btn btn-outline-danger'
                          onClick={() =>
                            openDeleteModal(currentAddresses.ERC20.id, 'ERC20')
                          }
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {editingAddress.erc ? (
                    <div className='input-group input-group-sm'>
                      <input
                        type='text'
                        className='form-control'
                        value={editingAddress.erc}
                        onChange={(e) =>
                          setEditingAddress({
                            ...editingAddress,
                            erc: e.target.value,
                          })
                        }
                      />
                      <button
                        className='btn btn-success'
                        onClick={() =>
                          updateWalletAddress(
                            currentAddresses.ERC20.id,
                            'ERC20',
                            editingAddress.erc
                          )
                        }
                      >
                        Save
                      </button>
                      <button
                        className='btn btn-secondary'
                        onClick={() =>
                          setEditingAddress({ ...editingAddress, erc: null })
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className='small text-break mb-0'>
                      {currentAddresses.ERC20?.address || 'Not set'}
                    </p>
                  )}
                </div>

                <div className='alert alert-info small mb-0'>
                  <strong>Note:</strong> These wallet addresses will be shown to
                  users for deposits.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className='modal show d-block'
          tabIndex='-1'
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
          onClick={closeDeleteModal}
        >
          <div
            className='modal-dialog modal-dialog-centered'
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideInDown 0.3s ease-out',
            }}
          >
            <div className='modal-content'>
              <div className='modal-header border-0'>
                <h5 className='modal-title'>Confirm Delete</h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={closeDeleteModal}
                  aria-label='Close'
                ></button>
              </div>
              <div className='modal-body'>
                <div className='text-center mb-3'>
                  <Trash2 size={48} color='#dc3545' />
                </div>
                <p className='text-center mb-2'>
                  Are you sure you want to delete the{' '}
                  <strong>{deleteTarget.network}</strong> address?
                </p>
                <p className='text-center text-muted small mb-0'>
                  This action cannot be undone.
                </p>
              </div>
              <div className='modal-footer border-0'>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={closeDeleteModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='btn btn-danger'
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Warning Modal */}
      {showWarningModal && (
        <div
          className='modal show d-block'
          tabIndex='-1'
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
          onClick={() => setShowWarningModal(false)}
        >
          <div
            className='modal-dialog modal-dialog-centered'
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideInDown 0.3s ease-out',
            }}
          >
            <div className='modal-content'>
              <div className='modal-body text-center py-4'>
                <div
                  className='mb-3'
                  style={{ animation: 'scaleIn 0.4s ease-out' }}
                >
                  <AlertTriangle size={64} color='#ffc107' />
                </div>
                <h5 className='modal-title mb-3'>Missing Information</h5>
                <p className='text-muted mb-4'>
                  Please enter both TRC20 and ERC20 wallet addresses before
                  saving.
                </p>
                <button
                  type='button'
                  className='btn btn-primary px-4'
                  onClick={() => setShowWarningModal(false)}
                  style={{ transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = 'scale(1.05)')
                  }
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInDown {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
        }

        .btn-outline-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(13, 110, 253, 0.2);
        }

        .btn-outline-danger:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(220, 53, 69, 0.2);
        }

        /* Lighter placeholder text for inputs */
        .card .form-control::placeholder {
          color: #9aa2ac;
          opacity: 1;
        }
        .card .form-control:-ms-input-placeholder {
          color: #9aa2ac;
        }
        .card .form-control::-ms-input-placeholder {
          color: #9aa2ac;
        }

        .back-btn {
          border-radius: 20px;
          padding: 0.35rem 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
          display: inline-flex;
          gap: .4rem;
          align-items: center;
        }

        .back-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .back-btn svg {
          transition: transform 0.2s ease;
        }

        .back-btn:hover svg {
          transform: translateX(-2px);
        }

        /* Option buttons styling */
        .option-btn {
          color: #000 !important;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 2px solid #dee2e6;
        }

        .option-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #0d6efd;
          background-color: #f8f9fa !important;
        }

        /* Button group improvements */
        .btn-group-sm .btn {
          transition: all 0.2s ease;
        }

        .input-group .btn {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminWalletSettings;
