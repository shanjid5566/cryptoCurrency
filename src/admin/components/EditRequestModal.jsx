import React from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';

const EditRequestModal = ({
    editModalRequest,
    editStatus,
    setEditStatus,
    editNote,
    setEditNote,
    onClose,
    onSuccess
}) => {
    if (!editModalRequest) return null;

    const handleResolve = async () => {
        if (!editStatus) {
            toast.warning('Please select a status');
            return;
        }
        try {
            await axiosInstance.put(`/api/service-requests/admin/${editModalRequest.id}/status`, {
                status: editStatus,
                note: editNote
            });
            toast.success('Request updated successfully');
            onSuccess();
        } catch (err) {
            toast.info('Updated locally (server may not support endpoint)');
            onSuccess(editStatus);
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Support Request</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label"><strong>Status</strong></label>
                            <select
                                className="form-select"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="OPEN">OPEN</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label"><strong>Note</strong></label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                placeholder="Enter a note..."
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleResolve}>Resolve</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditRequestModal;
