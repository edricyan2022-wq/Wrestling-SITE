import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, Crown, Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Navbar = () => {
  const { user, login, logout, isPremium, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Videos', path: '/dashboard' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-2xl text-white" data-testid="logo">
              IRON <span className="text-[#dc2626]">HOLD</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`font-medium uppercase tracking-wider text-sm transition-colors ${
                  location.pathname === link.path 
                    ? 'text-white' 
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] px-3 py-2 hover:border-[#dc2626]/50 transition-colors"
                    data-testid="user-menu-btn"
                  >
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-[#a1a1aa]" />
                    )}
                    <span className="text-white text-sm max-w-[100px] truncate">{user.name}</span>
                    {isPremium && <Crown className="w-4 h-4 text-[#eab308]" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#18181b] border-[#27272a] w-48">
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="text-white hover:bg-[#27272a] cursor-pointer"
                    data-testid="dropdown-profile"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/dashboard')}
                    className="text-white hover:bg-[#27272a] cursor-pointer"
                    data-testid="dropdown-dashboard"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {!isPremium && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/pricing')}
                      className="text-[#eab308] hover:bg-[#27272a] cursor-pointer"
                      data-testid="dropdown-upgrade"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#27272a]" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-[#dc2626] hover:bg-[#27272a] cursor-pointer"
                    data-testid="dropdown-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                data-testid="login-btn"
                onClick={login}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold uppercase tracking-wider"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-[#27272a]"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium uppercase tracking-wider text-sm ${
                    location.pathname === link.path 
                      ? 'text-white' 
                      : 'text-[#a1a1aa]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#a1a1aa] font-medium uppercase tracking-wider text-sm"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[#dc2626] font-medium uppercase tracking-wider text-sm text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    login();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold uppercase tracking-wider w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
