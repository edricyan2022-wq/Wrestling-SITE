import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus('error');
    }
  }, []);

  const pollPaymentStatus = async (sessionId) => {
    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(
        `${API}/payments/status/${sessionId}`,
        { withCredentials: true }
      );

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        // Refresh user data to update subscription
        await refreshUser();
      } else if (response.data.status === 'expired') {
        setStatus('expired');
      } else {
        // Continue polling
        setAttempts(prev => prev + 1);
        setTimeout(() => pollPaymentStatus(sessionId), 2000);
      }
    } catch (error) {
      console.error('Payment status error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-overlay" />
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#18181b] border border-[#27272a] p-12 text-center"
          data-testid="payment-result"
        >
          {status === 'checking' && (
            <>
              <Loader className="w-16 h-16 text-[#dc2626] mx-auto mb-6 animate-spin" />
              <h1 className="font-heading text-3xl text-white mb-4">PROCESSING PAYMENT</h1>
              <p className="text-[#a1a1aa] mb-4">
                Please wait while we confirm your payment...
              </p>
              <div className="w-full bg-[#27272a] h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(attempts / maxAttempts) * 100}%` }}
                  className="h-full bg-[#dc2626]"
                />
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-[#22c55e] mx-auto mb-6" />
              </motion.div>
              <h1 className="font-heading text-3xl text-white mb-4">PAYMENT SUCCESSFUL!</h1>
              <p className="text-[#a1a1aa] mb-8">
                Welcome to the premium club! You now have access to all secret techniques and advanced moves.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  data-testid="go-to-dashboard-btn"
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8"
                >
                  Start Learning
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="border-[#27272a] text-white hover:border-white"
                >
                  View Profile
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-[#dc2626] mx-auto mb-6" />
              <h1 className="font-heading text-3xl text-white mb-4">PAYMENT ERROR</h1>
              <p className="text-[#a1a1aa] mb-8">
                Something went wrong with your payment. Please try again or contact support.
              </p>
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
              >
                Try Again
              </Button>
            </>
          )}

          {status === 'expired' && (
            <>
              <XCircle className="w-16 h-16 text-[#f59e0b] mx-auto mb-6" />
              <h1 className="font-heading text-3xl text-white mb-4">SESSION EXPIRED</h1>
              <p className="text-[#a1a1aa] mb-8">
                Your payment session has expired. Please try again.
              </p>
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
              >
                Try Again
              </Button>
            </>
          )}

          {status === 'timeout' && (
            <>
              <Loader className="w-16 h-16 text-[#f59e0b] mx-auto mb-6" />
              <h1 className="font-heading text-3xl text-white mb-4">STILL PROCESSING</h1>
              <p className="text-[#a1a1aa] mb-8">
                Your payment is taking longer than expected. Please check your email for confirmation or contact support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                >
                  Check Again
                </Button>
                <a href="mailto:edric.yan2022@gmail.com">
                  <Button
                    variant="outline"
                    className="border-[#27272a] text-white hover:border-white w-full"
                  >
                    Contact Support
                  </Button>
                </a>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
