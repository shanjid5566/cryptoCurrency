import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/transactions', label: 'Transactions' },
  { to: '/admin/trade-control', label: 'Trade Control' },
  { to: '/admin/wallets', label: 'Wallet Settings' },
  // { to: '/admin/content', label: 'Content Management' },
  // { to: '/admin/access', label: 'Access Control' },
  // { to: '/admin/notifications', label: 'Notifications' },
  { to: '/admin/support', label: 'Support' },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  // Track viewport to keep sidebar visible
  const [isLgUp, setIsLgUp] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 992px)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 992px)');
    const handler = (e) => setIsLgUp(e.matches);
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isOpen && !isLgUp) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen, isLgUp]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className='sidebar-overlay d-lg-none'
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`admin-sidebar bg-dark text-white p-3`}
        style={{
          width: '250px',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1050,
          transition: 'transform 0.3s ease-in-out',
          transform: isLgUp
            ? 'translateX(0)'
            : isOpen
            ? 'translateX(0)'
            : 'translateX(-100%)',
          boxShadow: '0 0.5rem 1rem rgba(0,0,0,.15)',
        }}
      >
        {/* Close button for mobile */}
        <div className='d-flex justify-content-between align-items-center mb-3 d-lg-none'>
          <h4 className='mb-0'>Admin Panel</h4>
          <button
            className='btn btn-link text-white p-0'
            onClick={onClose}
            aria-label='Close sidebar'
            style={{
              fontSize: '28px',
              width: '40px',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            ×
          </button>
        </div>

        <h4 className='mb-4 d-none d-lg-block' style={{ marginLeft: 12 }}>
          Admin Panel
        </h4>

        <ul
          className='nav flex-column gap-2'
          style={{ listStyle: 'none', paddingLeft: 0, marginLeft: 0 }}
        >
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#0d6efd' : 'transparent',
                  color: 'white',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'block',
                })}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default AdminSidebar;
