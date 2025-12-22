import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Crown, Mail, LogOut, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading, isPremium } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-overlay" />
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="profile-section"
        >
          <h1 className="font-heading text-4xl text-white mb-8">MY PROFILE</h1>

          {/* Profile Card */}
          <div className="bg-[#18181b] border border-[#27272a] p-8 mb-8">
            <div className="flex items-center gap-6 mb-8">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-[#dc2626]"
                  data-testid="profile-picture"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#27272a] flex items-center justify-center">
                  <User className="w-10 h-10 text-[#a1a1aa]" />
                </div>
              )}
              <div>
                <h2 className="font-heading text-2xl text-white" data-testid="profile-name">
                  {user.name}
                </h2>
                <p className="text-[#a1a1aa] flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="border-t border-[#27272a] pt-6">
              <h3 className="font-heading text-lg text-white mb-4">SUBSCRIPTION</h3>
              
              <div className={`p-4 border ${isPremium ? 'border-[#eab308] bg-[#eab308]/10' : 'border-[#27272a]'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isPremium ? (
                    <Crown className="w-6 h-6 text-[#eab308]" />
                  ) : (
                    <User className="w-6 h-6 text-[#a1a1aa]" />
                  )}
                  <span className="font-heading text-xl text-white" data-testid="subscription-plan">
                    {user.subscription_plan?.toUpperCase() || 'FREE'} PLAN
                  </span>
                </div>
                
                {isPremium && user.subscription_expires && (
                  <p className="text-[#a1a1aa] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expires: {formatDate(user.subscription_expires)}
                  </p>
                )}

                {!isPremium && (
                  <Button
                    data-testid="upgrade-btn"
                    onClick={() => navigate('/pricing')}
                    className="mt-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </div>

            {/* Admin Badge */}
            {user.is_admin && (
              <div className="border-t border-[#27272a] pt-6 mt-6">
                <div className="bg-[#dc2626]/20 border border-[#dc2626] p-4">
                  <span className="text-[#dc2626] font-bold uppercase tracking-wider">
                    Admin Access
                  </span>
                  <p className="text-[#a1a1aa] text-sm mt-1">
                    You can upload and manage videos
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-[#27272a] hover:bg-[#3f3f46] text-white"
            >
              Go to Dashboard
            </Button>
            <Button
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="outline"
              className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
