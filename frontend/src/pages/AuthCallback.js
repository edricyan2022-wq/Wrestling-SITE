import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { processSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      // Extract session_id from URL fragment
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionId = params.get('session_id');

      if (sessionId) {
        try {
          await processSession(sessionId);
          // Clear the hash and redirect to dashboard
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error('Auth callback error:', error);
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#dc2626] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white text-lg font-heading">AUTHENTICATING...</p>
      </div>
    </div>
  );
}
