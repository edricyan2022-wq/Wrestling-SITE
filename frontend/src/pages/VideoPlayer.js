import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`${API}/videos/${videoId}`, { withCredentials: true });
      setVideo(response.data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 403) {
        setError('premium');
      } else if (error.response?.status === 401) {
        setError('login');
      } else {
        setError('notfound');
      }
    } finally {
      setVideoLoading(false);
    }
  };

  if (loading || videoLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <div className="noise-overlay" />
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#18181b] border border-[#27272a] p-12 text-center"
          >
            {error === 'premium' && (
              <>
                <Lock className="w-16 h-16 text-[#dc2626] mx-auto mb-6" />
                <h1 className="font-heading text-3xl text-white mb-4">PREMIUM CONTENT</h1>
                <p className="text-[#a1a1aa] mb-8">
                  This secret technique is available only for premium members.
                </p>
                <Button
                  data-testid="upgrade-btn"
                  onClick={() => navigate('/pricing')}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </>
            )}
            {error === 'login' && (
              <>
                <Lock className="w-16 h-16 text-[#dc2626] mx-auto mb-6" />
                <h1 className="font-heading text-3xl text-white mb-4">LOGIN REQUIRED</h1>
                <p className="text-[#a1a1aa] mb-8">
                  Please login to view this content.
                </p>
                <Button
                  data-testid="login-btn"
                  onClick={() => {
                    const redirectUrl = window.location.origin + '/auth/callback';
                    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
                  }}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                >
                  Login
                </Button>
              </>
            )}
            {error === 'notfound' && (
              <>
                <h1 className="font-heading text-3xl text-white mb-4">VIDEO NOT FOUND</h1>
                <p className="text-[#a1a1aa] mb-8">
                  The video you're looking for doesn't exist.
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                >
                  Back to Dashboard
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-overlay" />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          data-testid="back-btn"
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="text-[#a1a1aa] hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Videos
        </Button>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#18181b] border border-[#27272a]"
        >
          <div className="aspect-video bg-black">
            <iframe
              data-testid="video-player"
              src={video.video_url}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#dc2626] text-sm font-bold uppercase tracking-wider">
                {video.category}
              </span>
              {video.is_premium && (
                <span className="bg-gradient-to-r from-[#eab308] to-[#fbbf24] text-black px-2 py-0.5 text-xs font-bold uppercase flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-white mb-4" data-testid="video-title">
              {video.title}
            </h1>
            <p className="text-[#a1a1aa] text-lg" data-testid="video-description">
              {video.description}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
