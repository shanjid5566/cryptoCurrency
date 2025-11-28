import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import apiService from '../../service/apiService';
import { setAuthToken } from '../../config/axiosInstance';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiService.post('/api/auth/login', { email, password });

      // Check for token in different possible locations
      const token = data.data?.token || data.data?.accessToken || data.token || data.accessToken;

      if (token) {
        setAuthToken(token);
      }

      Cookies.set('adminEmail', email, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set('isAdminLoggedIn', 'true', { expires: 7, secure: true, sameSite: 'strict' });

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error', err);

      // Build a helpful error message for debugging
      if (err.response) {
        // Server responded with a status outside 2xx
        const status = err.response.status;
        const data = err.response.data;
        const serverMsg = data?.message || data?.msg || JSON.stringify(data) || '';
        setError(`Server ${status}: ${serverMsg}`);
      } else if (err.request) {
        // Request made but no response (network / CORS / server down)
        setError('No response from server. Check network, CORS or server availability.');
      } else {
        // Something else
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='d-flex justify-content-center align-items-center min-vh-100 px-4' style={{ backgroundColor: '#f8f9fa' }}>
      <div className='card shadow p-4 w-100 bg-white' style={{ maxWidth: '400px', borderRadius: '12px' }}>
        <div className='d-flex align-items-center mb-4'>

          <h2 className='text-center flex-grow-1 mb-0' style={{ fontWeight: '600' }}>Admin Login</h2>
        </div>

        {error && <div className='alert alert-danger'>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className='mb-3'>
            <label htmlFor='email' className='form-label' style={{ fontWeight: '500', fontSize: '14px' }}>
              Email
            </label>
            <input
              type='email'
              className='form-control'
              id='email'
              placeholder='admin@crypto.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='password' className='form-label' style={{ fontWeight: '500', fontSize: '14px' }}>
              Password
            </label>
            <input
              type='password'
              className='form-control'
              id='password'
              placeholder='admin123'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type='submit' className='btn btn-primary w-100 mb-3' disabled={loading} style={{ borderRadius: '8px', padding: '12px', fontWeight: '600' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>



      </div>
    </div>
  );
};

export default AdminLogin;
