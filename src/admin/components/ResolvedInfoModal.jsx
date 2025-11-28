import React from 'react';

const ResolvedInfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-body text-center p-5">
                        <div className="mb-4">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="fw-bold mb-3">Already Resolved</h4>
                        <p className="text-muted mb-0">Your issue has been already resolved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResolvedInfoModal;
