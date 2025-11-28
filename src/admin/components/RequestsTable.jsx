import React from 'react';
import { Copy } from 'lucide-react';

const RequestsTable = ({
  loading,
  error,
  filteredRequests,
  search,
  onViewRequest,
  onEditRequest,
}) => {
  if (loading) {
    return (
      <div className='text-center py-5'>
        <div className='spinner-border'></div>
      </div>
    );
  }

  if (error) {
    return <div className='alert alert-danger'>{error}</div>;
  }

  if (filteredRequests.length === 0) {
    return (
      <div className='alert alert-info'>
        {search
          ? 'No matching support requests found.'
          : 'No support requests found.'}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const colors = {
      OPEN: 'primary',
      IN_PROGRESS: 'warning',
      RESOLVED: 'success',
    };
    return colors[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'info',
    };
    return colors[priority] || 'secondary';
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className='card shadow-sm border-0'>
      <div className='table-responsive'>
        <table className='table table-hover align-middle mb-0'>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th
                style={{
                  padding: '16px',
                  paddingLeft: '20px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                User
              </th>
              <th
                style={{
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Subject
              </th>
              <th
                style={{
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Priority
              </th>
              <th
                style={{
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: '16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                <td
                  style={{
                    padding: '14px',
                    paddingLeft: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        color: '#007bff',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => copyToClipboard(r.id)}
                      title={r.id}
                    >
                      {truncateId(r.id)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(r.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#6c757d',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                      title='Copy ID'
                    >
                      <Copy size={14} style={{ color: '#007bff' }} />
                    </button>
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#495057' }}>
                    {r.user?.email || 'N/A'}
                  </div>
                </td>
                <td
                  style={{
                    padding: '14px',
                    fontSize: '0.9rem',
                    maxWidth: '200px',
                  }}
                >
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: '500',
                    }}
                  >
                    {r.subject}
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#495057' }}>
                    {r.category}
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  <span
                    className={`badge bg-${getPriorityBadge(r.priority)}`}
                    style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                  >
                    {r.priority}
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  <span
                    className={`badge bg-${getStatusBadge(r.status)}`}
                    style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                  >
                    {r.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: '14px',
                    fontSize: '0.85rem',
                    color: '#6c757d',
                  }}
                >
                  {new Date(r.createdAt).toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className='btn btn-primary btn-sm'
                      onClick={() => onViewRequest(r)}
                      style={{
                        fontSize: '0.85rem',
                        padding: '6px 16px',
                        fontWeight: '500',
                      }}
                    >
                      View
                    </button>
                    <button
                      className='btn btn-outline-primary btn-sm'
                      onClick={() => onEditRequest(r)}
                      style={{
                        fontSize: '0.85rem',
                        padding: '6px 16px',
                        fontWeight: '500',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsTable;
