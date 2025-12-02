import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LogOut, LayoutDashboard, Home, LogIn } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export const Navbar: React.FC = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check if current user is the admin
  const isAdmin = user?.email === 'thepremanshu@gmail.com';

  const handleLogout = async () => {
    await signOut(auth);
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const NavLink = ({ to, active, children, icon: Icon }: any) => (
    <Link
      to={to}
      className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden ${
        active 
          ? 'text-white bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} className={active ? 'text-red-500' : 'text-zinc-500 group-hover:text-red-500 transition-colors'} />
      <span className="hidden sm:inline">{children}</span>
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent"></span>
      )}
    </Link>
  );

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <span className="text-2xl font-black text-white tracking-tighter transition-all group-hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                APNA <span className="text-red-600 group-hover:text-red-500 transition-colors">ADDA</span>
              </span>
            </Link>
            
            {/* Nav Items */}
            <div className="flex items-center gap-3">
              <NavLink to="/" active={location.pathname === '/'} icon={Home}>Home</NavLink>

              {user ? (
                <>
                  {isAdmin && (
                    <NavLink to="/admin" active={location.pathname === '/admin'} icon={LayoutDashboard}>Dashboard</NavLink>
                  )}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-500 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all duration-300 group"
                  >
                    <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <NavLink to="/login" active={location.pathname === '/login'} icon={LogIn}>Login</NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Logout"
        isDangerous={true}
      />
    </>
  );
};