import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import { Trash2, Mail, MailOpen } from 'lucide-react';
import Pagination from '../components/Pagination';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showClearAllModal, setShowClearAllModal] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get('/api/service-requests/notifications/list');
                const items = res?.data?.data?.notifications || [];

                const mapped = items.map((it) => ({
                    id: it.id,
                    title: it.title || it.request?.subject || 'Notification',
                    message: it.message || it.request?.subject || '',
                    read: typeof it.isRead === 'boolean' ? it.isRead : !!it.read,
                    createdAt: it.createdAt ? new Date(it.createdAt) : new Date(),
                    raw: it,
                }));

                setNotifications(mapped);
                setCurrentPage(1);
            } catch (err) {
                console.error('Failed to load notifications', err);
                setError('Failed to load notifications');
                // prevent duplicate toasts for the same error
                toast.error('Failed to load notifications', { toastId: 'notifications-load-error' });
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const toggleRead = async (id) => {
        const prev = notifications;
        const updated = prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
        setNotifications(updated);

        try {
            await axiosInstance.patch(`/api/service-requests/notifications/${id}/read`, { isRead: updated.find((x) => x.id === id).read });
        } catch (err) {
            console.debug('Mark-read API call failed (may be missing)', err?.response?.status || err.message);
        }
    };

    const deleteNotification = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        const id = deleteId;
        setDeleteId(null);

        const prev = notifications;
        const newList = prev.filter((n) => n.id !== id);
        setNotifications(newList);

        // Adjust page if needed
        const maxPage = Math.ceil(newList.length / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) {
            setCurrentPage(Math.max(1, maxPage));
        }

        try {
            await axiosInstance.delete(`/api/service-requests/notifications/${id}`);
            toast.success('Notification removed');
        } catch (err) {
            setNotifications(prev);
            console.error('Failed to delete notification', err);
            // use a toastId per notification id to avoid duplicate error toasts
            toast.error('Failed to delete notification', { toastId: `notification-delete-error-${id}` });
        }
    };

    const clearAll = () => {
        setShowClearAllModal(true);
    };

    const confirmClearAll = async () => {
        setShowClearAllModal(false);

        const prev = notifications;
        setNotifications([]);
        setCurrentPage(1);

        try {
            await axiosInstance.post('/api/service-requests/notifications/clear');
            toast.success('All notifications removed');
        } catch (err) {
            setNotifications(prev);
            console.debug('Clear-all API call failed (may be missing)', err?.response?.status || err.message);
            // show info once for clear-all fallback
            toast.info('Cleared locally (server sync skipped)', { toastId: 'notifications-clear-local' });
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedNotifications = notifications.slice(startIdx, startIdx + itemsPerPage);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className='container py-4'>
            {/* Header Section */}
            <div className='mb-4'>
                <div className='d-flex justify-content-between align-items-center mb-3'>
                    <div>
                        <h2 className='mb-2' style={{ color: '#2c3e50', fontWeight: '600' }}>
                            Notifications
                        </h2>
                        <p className='text-muted mb-0'>
                            Total: <strong style={{ color: '#e74c3c' }}>{notifications.length}</strong>
                            {unreadCount > 0 && (
                                <> • Unread: <strong style={{ color: '#f39c12' }}>{unreadCount}</strong></>
                            )}
                        </p>
                    </div>
                    <button
                        className='btn btn-outline-danger'
                        onClick={clearAll}
                        disabled={notifications.length === 0 || loading}
                        style={{ minWidth: '120px' }}
                    >
                        <Trash2 size={18} className='me-2' style={{ display: 'inline' }} />
                        Clear All
                    </button>
                </div>

                {/* Stats Cards */}
                <div className='row g-2 g-md-3'>
                    <div className='col-md-4 col-12'>
                        <div className={`card shadow-sm border-0 rounded-1 bg-primary text-white stat-card text-center`}>
                            <div className='stat-title'>Total Notifications</div>
                            <div className='stat-value'>{notifications.length}</div>
                        </div>
                    </div>
                    <div className='col-md-4 col-12'>
                        <div className={`card shadow-sm border-0 rounded-1 bg-warning text-white stat-card text-center`}>
                            <div className='stat-title'>Unread</div>
                            <div className='stat-value'>{unreadCount}</div>
                        </div>
                    </div>
                    <div className='col-md-4 col-12'>
                        <div className={`card shadow-sm border-0 rounded-1 bg-success text-white stat-card text-center`}>
                            <div className='stat-title'>Read</div>
                            <div className='stat-value'>{notifications.length - unreadCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className='d-flex justify-content-center py-5'>
                    <div className='spinner-border text-primary' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className='alert alert-danger alert-dismissible fade show' role='alert'>
                    {error}
                </div>
            ) : notifications.length === 0 ? (
                <div className='alert alert-info text-center py-5'>
                    📭 No notifications yet. You're all caught up!
                </div>
            ) : (
                <>
                    {/* Notifications List */}
                    <div className='row'>
                        {paginatedNotifications.map((n) => (
                            <div key={n.id} className='col-12 mb-3'>
                                <div
                                    className={`card border-0 shadow-sm transition ${!n.read ? 'border-start border-5' : ''}`}
                                    style={{
                                        borderLeftColor: !n.read ? '#3498db' : 'transparent',
                                        backgroundColor: !n.read ? '#f0f8ff' : '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div className='card-body'>
                                        <div className='d-flex flex-column flex-md-row justify-content-between align-items-start'>
                                            <div className='flex-grow-1 w-100'>
                                                <div className='d-flex align-items-center mb-2'>
                                                    {n.read ? (
                                                        <MailOpen size={20} className='me-2' style={{ color: '#95a5a6' }} />
                                                    ) : (
                                                        <Mail size={20} className='me-2' style={{ color: '#3498db' }} />
                                                    )}
                                                    <h5 className='mb-0' style={{ color: '#2c3e50' }}>
                                                        {n.title}
                                                    </h5>
                                                    {!n.read && (
                                                        <span className='badge bg-primary ms-2'>New</span>
                                                    )}
                                                </div>
                                                <p className='card-text text-muted mb-2' style={{ fontSize: '14px' }}>
                                                    {n.message}
                                                </p>
                                                <small className='text-muted d-block mb-3 mb-md-0'>
                                                    🕐 {n.createdAt?.toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </small>
                                            </div>

                                            {/* Desktop buttons */}
                                            <div className='d-none d-md-flex flex-column gap-2 ms-3' style={{ minWidth: '110px' }}>
                                                <button
                                                    className={`btn btn-sm ${n.read ? 'btn-outline-primary' : 'btn-primary'}`}
                                                    onClick={() => toggleRead(n.id)}
                                                    title={n.read ? 'Mark as Unread' : 'Mark as Read'}
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {n.read ? 'Mark Unread' : 'Mark Read'}
                                                </button>
                                                <button
                                                    className='btn btn-sm btn-outline-danger'
                                                    onClick={() => deleteNotification(n.id)}
                                                    title='Delete notification'
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile buttons */}
                                        <div className='d-flex d-md-none gap-2 mt-3 pt-3 border-top'>
                                            <button
                                                className={`btn btn-sm flex-fill ${n.read ? 'btn-outline-primary' : 'btn-primary'}`}
                                                onClick={() => toggleRead(n.id)}
                                                title={n.read ? 'Mark as Unread' : 'Mark as Read'}
                                            >
                                                {n.read ? 'Mark Unread' : 'Mark Read'}
                                            </button>
                                            <button
                                                className='btn btn-sm btn-outline-danger'
                                                onClick={() => deleteNotification(n.id)}
                                                title='Delete notification'
                                                style={{ minWidth: '45px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={notifications.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className='modal show d-block'
                    tabIndex='-1'
                    style={{ 
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        animation: 'fadeIn 0.2s ease-in-out'
                    }}
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div 
                        className='modal-dialog modal-dialog-centered'
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'slideInDown 0.3s ease-out'
                        }}
                    >
                        <div className='modal-content'>
                            <div className='modal-body text-center py-4'>
                                <div className='mb-3' style={{ animation: 'scaleIn 0.4s ease-out' }}>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='64'
                                        height='64'
                                        fill='#ffc107'
                                        className='bi bi-exclamation-triangle'
                                        viewBox='0 0 16 16'
                                    >
                                        <path d='M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z'/>
                                        <path d='M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z'/>
                                    </svg>
                                </div>
                                <h5 className='modal-title mb-2'>Delete notification?</h5>
                                <p className='text-muted mb-4'>This action cannot be undone.</p>
                                <div className='d-flex gap-2 justify-content-center'>
                                    <button
                                        type='button'
                                        className='btn btn-secondary px-4'
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='button'
                                        className='btn btn-danger px-4'
                                        onClick={confirmDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Confirmation Modal */}
            {showClearAllModal && (
                <div
                    className='modal show d-block'
                    tabIndex='-1'
                    style={{ 
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        animation: 'fadeIn 0.2s ease-in-out'
                    }}
                    onClick={() => setShowClearAllModal(false)}
                >
                    <div 
                        className='modal-dialog modal-dialog-centered'
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'slideInDown 0.3s ease-out'
                        }}
                    >
                        <div className='modal-content'>
                            <div className='modal-body text-center py-4'>
                                <div className='mb-3' style={{ animation: 'scaleIn 0.4s ease-out' }}>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='64'
                                        height='64'
                                        fill='#ffc107'
                                        className='bi bi-exclamation-triangle'
                                        viewBox='0 0 16 16'
                                    >
                                        <path d='M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z'/>
                                        <path d='M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z'/>
                                    </svg>
                                </div>
                                <h5 className='modal-title mb-2'>Clear all notifications?</h5>
                                <p className='text-muted mb-4'>All notifications will be removed.</p>
                                <div className='d-flex gap-2 justify-content-center'>
                                    <button
                                        type='button'
                                        className='btn btn-secondary px-4'
                                        onClick={() => setShowClearAllModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='button'
                                        className='btn btn-danger px-4'
                                        onClick={confirmClearAll}
                                    >
                                        Clear All
                                    </button>
                                </div>
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
            `}</style>
        </div>
    );
};

export default AdminNotifications;