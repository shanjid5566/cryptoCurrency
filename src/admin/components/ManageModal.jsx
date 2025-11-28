import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';

const ManageModal = ({ selectedUser, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...selectedUser });
  const [loading, setLoading] = useState(false);
  const [kycReason, setKycReason] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Update editedUser when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setEditedUser({ ...selectedUser });
      setHasChanges(false);
    }
  }, [selectedUser]);

  // Check for changes whenever editedUser changes
  useEffect(() => {
    if (selectedUser && editMode) {
      const changed =
        editedUser.fullName !== selectedUser.fullName ||
        editedUser.email !== selectedUser.email ||
        editedUser.phone !== selectedUser.phone ||
        editedUser.dateOfBirth !== selectedUser.dateOfBirth ||
        editedUser.age !== selectedUser.age ||
        editedUser.country !== selectedUser.country ||
        editedUser.address !== selectedUser.address;

      setHasChanges(changed);
    }
  }, [editedUser, selectedUser, editMode]);

  const openEditMode = () => {
    setEditedUser({ ...selectedUser }); // Reset to current user data
    setHasChanges(false);
    setEditMode(true);
  };

  const saveUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/api/admin/users/${selectedUser.id}/profile`,
        {
          fullName: editedUser.fullName,
          email: editedUser.email,
          phone: editedUser.phone,
          dateOfBirth: editedUser.dateOfBirth,
          age: editedUser.age,
          country: editedUser.country,
          address: editedUser.address,
        }
      );

      if (response.data.success) {
        onUpdate(editedUser);
        toast.success('User profile updated successfully!');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBanStatus = async () => {
    try {
      setLoading(true);
      const isSuspended = selectedUser.status === 'SUSPENDED';
      const endpoint = isSuspended
        ? `/api/admin/users/${selectedUser.uid}/unsuspend`
        : `/api/admin/users/${selectedUser.uid}/suspend`;

      const response = await axiosInstance.post(endpoint);

      // Handle successful response
      if (response.data.success || response.status === 200) {
        const newStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
        onUpdate({ ...selectedUser, status: newStatus });
        toast.success(
          `User ${isSuspended ? 'unsuspended' : 'suspended'} successfully!`
        );
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update user status.');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update user status. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const approveKYC = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        '/api/admin/kyc/update-status',
        {
          userId: selectedUser.id,
          status: 'APPROVED',
          reason: kycReason || 'All documents verified and valid',
        }
      );

      if (response.data.success) {
        onUpdate({ ...selectedUser, kycStatus: 'APPROVED' });
        toast.success('KYC Approved successfully!');
        setKycReason('');
        onClose();
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rejectKYC = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        '/api/admin/kyc/update-status',
        {
          userId: selectedUser.id,
          status: 'REJECTED',
          reason: kycReason || 'Documents verification failed',
        }
      );

      if (response.data.success) {
        onUpdate({ ...selectedUser, kycStatus: 'REJECTED' });
        toast.success('KYC Rejected successfully!');
        setKycReason('');
        onClose();
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedUser) return null;

  return (
    <div
      className='modal d-block'
      tabIndex='-1'
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div className='modal-dialog modal-lg modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>
              {editMode ? 'Edit User Profile' : 'Manage User'} -{' '}
              {selectedUser.fullName || selectedUser.email}
            </h5>
            <button className='btn-close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            {!editMode ? (
              // View Mode
              <div className='row'>
                <div className='col-md-6'>
                  <h6>Basic Information</h6>
                  <p>
                    <strong>User ID:</strong> {selectedUser.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Name:</strong> {selectedUser.fullName || 'N/A'}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedUser.phone || 'N/A'}
                  </p>
                  <p>
                    <strong>Country:</strong> {selectedUser.country || 'N/A'}
                  </p>
                  <p>
                    <strong>Join Date:</strong>{' '}
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{' '}
                    {selectedUser.updatedAt
                      ? new Date(selectedUser.updatedAt).toLocaleString()
                      : 'N/A'}
                  </p>

                  <h6 className='mt-3'>Account Status</h6>
                  <p>
                    <strong>Status:</strong>
                    <span
                      className={`badge ms-2 ${
                        selectedUser.status === 'ACTIVE'
                          ? 'bg-success'
                          : 'bg-danger'
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  </p>
                  <p>
                    <strong>KYC Status:</strong>
                    <span
                      className={`badge ms-2 ${
                        selectedUser.kycStatus === 'APPROVED'
                          ? 'bg-success'
                          : selectedUser.kycStatus === 'PENDING'
                          ? 'bg-warning'
                          : 'bg-danger'
                      }`}
                    >
                      {selectedUser.kycStatus}
                    </span>
                  </p>
                </div>

                <div className='col-md-6'>
                  <h6>KYC Documents</h6>
                  {selectedUser.idCardFront && (
                    <div className='mb-2'>
                      <strong>ID Card Front:</strong>
                      <br />
                      <img
                        src={selectedUser.idCardFront}
                        alt='ID Front'
                        className='img-fluid mt-1'
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  {selectedUser.idCardBack && (
                    <div className='mb-2'>
                      <strong>ID Card Back:</strong>
                      <br />
                      <img
                        src={selectedUser.idCardBack}
                        alt='ID Back'
                        className='img-fluid mt-1'
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  {selectedUser.selfieVideo && (
                    <div className='mb-2'>
                      <strong>Selfie Video:</strong>
                      <br />
                      <video
                        src={selectedUser.selfieVideo}
                        controls
                        className='img-fluid mt-1'
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className='row'>
                <div className='col-md-6'>
                  <h6>Edit Profile Information</h6>
                  <div className='mb-3'>
                    <label className='form-label'>Full Name</label>
                    <input
                      type='text'
                      className='form-control'
                      value={editedUser.fullName || ''}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Email</label>
                    <input
                      type='email'
                      className='form-control'
                      value={editedUser.email}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Phone</label>
                    <input
                      type='text'
                      className='form-control'
                      value={editedUser.phone || ''}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className='col-md-6'>
                  <h6>Additional Details</h6>
                  <div className='mb-3'>
                    <label className='form-label'>Date of Birth</label>
                    <input
                      type='date'
                      className='form-control'
                      value={editedUser.dateOfBirth || ''}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Age</label>
                    <input
                      type='number'
                      className='form-control'
                      value={editedUser.age || ''}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          age: parseInt(e.target.value) || '',
                        })
                      }
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Country</label>
                    <input
                      type='text'
                      className='form-control'
                      value={editedUser.country || ''}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className='col-12'>
                  <div className='mb-3'>
                    <label className='form-label'>Address</label>
                    <textarea
                      className='form-control'
                      rows='3'
                      value={editedUser.address || ''}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='modal-footer'>
            <button className='btn btn-secondary' onClick={onClose}>
              Close
            </button>

            {!editMode ? (
              <>
                <button className='btn btn-info me-2' onClick={openEditMode}>
                  ✏️ Edit Profile
                </button>
                {selectedUser.kycStatus === 'PENDING' && (
                  <>
                    <div className='mb-3'>
                      <label className='form-label'>Reason (Optional)</label>
                      <input
                        type='text'
                        className='form-control'
                        placeholder='Enter reason for approval/rejection'
                        value={kycReason}
                        onChange={(e) => setKycReason(e.target.value)}
                      />
                    </div>
                    <button
                      className='btn btn-success me-2'
                      onClick={approveKYC}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : '✓ Approve KYC'}
                    </button>
                    <button
                      className='btn btn-warning me-2'
                      onClick={rejectKYC}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : '✗ Reject KYC'}
                    </button>
                  </>
                )}
                <button
                  className='btn btn-danger'
                  onClick={toggleBanStatus}
                  disabled={loading}
                >
                  {loading
                    ? 'Processing...'
                    : selectedUser.status === 'ACTIVE'
                    ? '🚫 Suspend User'
                    : '✅ Unsuspend User'}
                </button>
              </>
            ) : (
              <>
                <button
                  className='btn btn-secondary me-2'
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className='btn btn-primary'
                  onClick={saveUserProfile}
                  disabled={loading || !hasChanges}
                >
                  {loading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageModal;
