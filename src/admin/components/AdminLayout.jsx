import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('adminEmail');
    Cookies.remove('isAdminLoggedIn');
    Cookies.remove('accessToken');
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className='d-flex' style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#f8f9fa' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className='flex-grow-1 admin-layout-main' style={{ width: '100%', marginLeft: '250px', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <div className='p-3 p-md-4' style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1000}}>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center gap-3'>
              {/* Mobile Hamburger Menu */}
              <button 
                className='btn btn-outline-primary d-lg-none'
                onClick={toggleSidebar}
                style={{ padding: '6px 12px' }}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
              <h2 className='mb-0'>Admin</h2>
            </div>
            <button className='btn btn-outline-danger btn-sm' onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className='p-3 p-md-4' style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
