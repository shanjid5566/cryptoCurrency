import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import ManageModal from '../components/ManageModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTrades: 0,
    totalBalance: 45678.9,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('api/admin/dashboard');
        console.log(response.data);

        if (response.data.success && response.data.data) {
          const { stats, recentUsers } = response.data.data;

          // Update stats with real data from API
          setStats((prevStats) => ({
            ...prevStats,
            totalUsers: stats.users.total || 0,
            activeUsers: stats.users.active || 0,
            totalBalance: stats.wallets.totalBalance || 0,
          }));

          // Set recent users
          setRecentUsers(recentUsers);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTradingStats = async () => {
      try {
        const response = await axiosInstance.get(
          'api/admin/trading/statistics'
        );

        if (response.data.success && response.data.data) {
          const { totalTrades } = response.data.data;
          setStats((prevStats) => ({
            ...prevStats,
            totalTrades: totalTrades || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching trading stats:', error);
      }
    };

    fetchDashboardData();
    fetchTradingStats();
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
  };

  const handleUpdateUser = (updatedUser) => {
    // Find the old user before updating
    const oldUser = recentUsers.find((u) => u.id === updatedUser.id);

    // Update the user list
    setRecentUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    // Update active users count only if status actually changed
    if (oldUser && oldUser.status !== updatedUser.status) {
      setStats((prevStats) => ({
        ...prevStats,
        activeUsers:
          updatedUser.status === 'ACTIVE'
            ? prevStats.activeUsers + 1
            : prevStats.activeUsers - 1,
      }));
    }

    setSelectedUser(updatedUser);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className='container py-2 lg:py-5'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2>Admin Dashboard</h2>
      </div>

      {/* Statistics Cards */}
      <div className='row mb-4 g-3'>
        <div className='col-12 col-md-6 col-lg-3'>
          <div className='card text-center bg-primary text-white'>
            <div className='card-body'>
              <h3>{loading ? '...' : stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </div>
        <div className='col-12 col-md-6 col-lg-3'>
          <div className='card text-center bg-success text-white'>
            <div className='card-body'>
              <h3>{loading ? '...' : stats.activeUsers}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>
        <div className='col-12 col-md-6 col-lg-3'>
          <div className='card text-center bg-info text-white'>
            <div className='card-body'>
              <h3>{loading ? '...' : stats.totalTrades}</h3>
              <p>Total Trades</p>
            </div>
          </div>
        </div>
        <div className='col-12 col-md-6 col-lg-3'>
          <div className='card text-center bg-warning text-white'>
            <div className='card-body'>
              <h3>{loading ? '...' : `$${stats.totalBalance.toFixed(2)}`}</h3>
              <p>Total Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      {/* <div className="card p-4 shadow-sm">
        <h5>Welcome to Crypto Admin Panel!</h5>
        <p>
          Manage users, control trades, and monitor your platform from this
          dashboard.
        </p>
        <hr />
        <div className="row">
          <div className="col-md-6">
            <h6>Quick Actions:</h6>
            <ul>
              <li>View and manage registered users</li>
              <li>Control trade outcomes</li>
              <li>Handle support requests</li>
              <li>Configure wallet settings</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Recent Activity:</h6>
            <ul>
              <li>15 new users registered today</li>
              <li>234 trades executed</li>
              <li>5 support tickets pending</li>
              <li>All systems operational</li>
            </ul>
          </div>
        </div>
      </div> */}

      {/* Recent Users Table */}
      <div className='card p-4 shadow-sm'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h5>Recent Users</h5>
          <button
            className='btn btn-primary btn-sm'
            onClick={() => navigate('/admin/users')}
          >
            View All Users
          </button>
        </div>

        {loading ? (
          <div className='text-center py-4'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-hover'>
              <thead className='table-dark'>
                <tr>
                  <th>UID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>KYC Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
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
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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
        )}
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

export default AdminDashboard;
