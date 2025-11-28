import React from 'react';

const ViewRequestModal = ({ modalRequest, onClose }) => {
  if (!modalRequest) return null;

  const getStatusBadge = (status) => {
    const statusColors = {
      OPEN: { bg: '#e3f2fd', text: '#1976d2', border: '#90caf9' },
      IN_PROGRESS: { bg: '#fff3e0', text: '#f57c00', border: '#ffb74d' },
      RESOLVED: { bg: '#e8f5e9', text: '#388e3c', border: '#81c784' },
    };
    const colors = statusColors[status] || {
      bg: '#f5f5f5',
      text: '#666',
      border: '#ddd',
    };
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: '600',
          border: `1px solid ${colors.border}`,
        }}
      >
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      HIGH: { bg: '#ffebee', text: '#c62828', border: '#ef5350' },
      MEDIUM: { bg: '#fff3e0', text: '#f57c00', border: '#ffb74d' },
      LOW: { bg: '#f3e5f5', text: '#7b1fa2', border: '#ba68c8' },
    };
    const colors = priorityColors[priority] || {
      bg: '#f5f5f5',
      text: '#666',
      border: '#ddd',
    };
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: '600',
          border: `1px solid ${colors.border}`,
        }}
      >
        {priority}
      </span>
    );
  };

  return (
    <div
      className='modal show d-block'
      tabIndex='-1'
      role='dialog'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className='modal-dialog modal-lg modal-dialog-centered'
        role='document'
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className='modal-content'
          style={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <div
            className='modal-header'
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              borderBottom: 'none',
              padding: '20px 24px',
            }}
          >
            <h5
              className='modal-title'
              style={{ fontWeight: '600', fontSize: '1.25rem' }}
            >
              Support Request Details
            </h5>
            <button
              type='button'
              className='btn-close btn-close-white'
              onClick={onClose}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <div className='modal-body' style={{ padding: '24px' }}>
            {/* Request ID with pink background */}
            <div
              style={{
                backgroundColor: '#ffe6f0',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffc0d9',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#999',
                  marginBottom: '4px',
                }}
              >
                REQUEST ID
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  color: '#d6336c',
                  fontWeight: '600',
                  wordBreak: 'break-all',
                }}
              >
                {modalRequest.id}
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#999',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}
              >
                Subject
              </div>
              <div
                style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}
              >
                {modalRequest.subject}
              </div>
            </div>

            {/* User Info */}
            <div
              style={{
                backgroundColor: '#f8f9fa',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#999',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}
              >
                User Information
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#495057',
                  }}
                >
                  {modalRequest.user?.fullName}
                </span>
                <span style={{ color: '#adb5bd' }}>•</span>
                <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  {modalRequest.user?.email}
                </span>
              </div>
            </div>

            {/* Category, Priority, Status in Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                  }}
                >
                  Category
                </div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: '#495057',
                    fontWeight: '500',
                  }}
                >
                  {modalRequest.category}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                  }}
                >
                  Priority
                </div>
                <div>{getPriorityBadge(modalRequest.priority)}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                  }}
                >
                  Status
                </div>
                <div>{getStatusBadge(modalRequest.status)}</div>
              </div>
            </div>

            {/* Timestamps */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: modalRequest.resolvedAt
                  ? '1fr 1fr'
                  : '1fr',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                  }}
                >
                  Created At
                </div>
                <div style={{ fontSize: '0.9rem', color: '#495057' }}>
                  {new Date(modalRequest.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {modalRequest.resolvedAt && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                    }}
                  >
                    Resolved At
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: '#28a745',
                      fontWeight: '500',
                    }}
                  >
                    {new Date(modalRequest.resolvedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Message */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#999',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}
              >
                Original Message
              </div>
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  fontSize: '0.95rem',
                  color: '#495057',
                  lineHeight: '1.6',
                }}
              >
                {modalRequest.message}
              </div>
            </div>

            {/* Conversation */}
            {modalRequest.messages && modalRequest.messages.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                  }}
                >
                  Conversation ({modalRequest.messages.length})
                </div>
                <div
                  style={{
                    maxHeight: '320px',
                    overflowY: 'auto',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#fafbfc',
                  }}
                >
                  {modalRequest.messages.map((m, index) => (
                    <div
                      key={m.id}
                      style={{
                        marginBottom:
                          index < modalRequest.messages.length - 1
                            ? '12px'
                            : '0',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: m.isAdminReply ? '#e3f2fd' : '#ffffff',
                        border: `1px solid ${
                          m.isAdminReply ? '#90caf9' : '#e9ecef'
                        }`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: m.isAdminReply ? '#1976d2' : '#6c757d',
                            textTransform: 'uppercase',
                          }}
                        >
                          {m.isAdminReply ? '👨‍💼 Admin' : '👤 User'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>
                          {new Date(m.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: '#495057',
                          lineHeight: '1.5',
                        }}
                      >
                        {m.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div
            className='modal-footer'
            style={{
              borderTop: '1px solid #e9ecef',
              padding: '16px 24px',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              backgroundColor: '#f8f9fa',
            }}
          >
            <button
              className='btn btn-secondary'
              onClick={onClose}
              style={{
                padding: '8px 24px',
                fontWeight: '500',
                borderRadius: '6px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRequestModal;
