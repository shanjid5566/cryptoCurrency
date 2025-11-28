import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import ManageModal from '../components/ManageModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    // Set items per page based on screen size
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 768 ? 5 : 10);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);

    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users');
      if (response.data.success && response.data.data) {
        console.log(response.data.data.users);
        setUsers(response.data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.uid?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const pages = [];

    if (totalPages <= 3) {
      // Show all pages if 3 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Check if we're in the last 3 pages
      if (currentPage >= totalPages - 2) {
        // Show last 3 pages without ellipsis (e.g., 6,7,8)
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page and next page (2 consecutive)
        pages.push(currentPage);
        pages.push(currentPage + 1);
        // Add ellipsis
        pages.push('...');
        // Add last 2 pages
        pages.push(totalPages - 1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const openModal = (user) => {
    setSelectedUser(user);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setSelectedUser(updatedUser);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className='container py-2 lg:py-5'>
      <div className='card shadow-sm'>
        <div className='card-header d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>Registered Users</h5>
        </div>
        <div className='card-body'>
          {/* Search Input */}
          <div className='mb-3'>
            <input
              className='form-control'
              placeholder='Search by UID, Email or Name'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className='text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          ) : (
            <>
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
                        Email
                      </th>
                      <th className='text-nowrap' style={{ fontWeight: '600' }}>
                        Name
                      </th>
                      <th className='text-nowrap' style={{ fontWeight: '600' }}>
                        Status
                      </th>
                      <th className='text-nowrap' style={{ fontWeight: '600' }}>
                        KYC Status
                      </th>
                      <th className='text-nowrap' style={{ fontWeight: '600' }}>
                        Joined
                      </th>
                      <th className='text-nowrap' style={{ fontWeight: '600' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.uid}</td>
                          <td>{user.email}</td>
                          <td>{user.fullName || 'N/A'}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.status === 'ACTIVE'
                                  ? 'bg-success'
                                  : 'bg-danger'
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                user.kycStatus === 'APPROVED'
                                  ? 'bg-success'
                                  : user.kycStatus === 'PENDING'
                                  ? 'bg-warning'
                                  : 'bg-danger'
                              }`}
                            >
                              {user.kycStatus}
                            </span>
                          </td>
                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className='btn btn-sm btn-primary'
                              onClick={() => openModal(user)}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan='7' className='text-center'>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > itemsPerPage && (
                <div className='d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3'>
                  <div className='text-muted small text-center text-sm-start'>
                    Showing {indexOfFirstItem + 1} to{' '}
                    {Math.min(indexOfLastItem, filteredUsers.length)} of{' '}
                    {filteredUsers.length} users
                  </div>
                  <nav>
                    <ul className='pagination pagination-sm mb-0'>
                      <li
                        className={`page-item ${
                          currentPage === 1 ? 'disabled' : ''
                        }`}
                      >
                        <button
                          className='page-link'
                          onClick={() => handlePageChange(currentPage - 1)}
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
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      })}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? 'disabled' : ''
                        }`}
                      >
                        <button
                          className='page-link'
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Management Modal */}
      <ManageModal
        selectedUser={selectedUser}
        onClose={handleCloseModal}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
};

export default AdminUsers;
