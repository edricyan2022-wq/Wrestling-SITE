import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, Crown, Play, Lock, Zap, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Pricing() {
  const { user, login, isPremium, loading } = useAuth();
  const navigate = useNavigate();
  const [processingPlan, setProcessingPlan] = useState(null);

  const handleSubscribe = async (plan) => {
    if (!user) {
      login();
      return;
    }

    if (isPremium) {
      toast.info('You already have a premium subscription!');
      return;
    }

    setProcessingPlan(plan);
    try {
      const response = await axios.post(
        `${API}/payments/create-checkout`,
        { plan, origin_url: window.location.origin },
        { withCredentials: true }
      );
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error('Checkout error:', error);
    } finally {
      setProcessingPlan(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'FREE',
      description: 'Start your journey',
      price: 0,
      period: 'forever',
      features: [
        { text: 'Basic wrestling techniques', included: true },
        { text: 'Beginner tutorials', included: true },
        { text: 'Community access', included: true },
        { text: 'Secret techniques', included: false },
        { text: 'Advanced moves', included: false },
        { text: 'Priority support', included: false }
      ],
      cta: user ? 'Current Plan' : 'Get Started',
      popular: false,
      highlight: false
    },
    {
      id: 'monthly',
      name: 'MONTHLY PRO',
      description: 'Full access',
      price: 19.99,
      period: 'month',
      features: [
        { text: 'All basic techniques', included: true },
        { text: 'Secret techniques', included: true },
        { text: 'Advanced moves', included: true },
        { text: 'New videos weekly', included: true },
        { text: 'Priority support', included: true },
        { text: 'Cancel anytime', included: true }
      ],
      cta: isPremium ? 'Current Plan' : 'Subscribe Now',
      popular: true,
      highlight: true
    },
    {
      id: 'annual',
      name: 'ANNUAL PRO',
      description: '2 months free',
      price: 149.99,
      period: 'year',
      originalPrice: 239.88,
      features: [
        { text: 'Everything in Monthly', included: true },
        { text: 'Save $90/year', included: true },
        { text: 'Exclusive annual content', included: true },
        { text: 'VIP support', included: true },
        { text: 'Early access to new videos', included: true },
        { text: 'Downloadable resources', included: true }
      ],
      cta: isPremium ? 'Current Plan' : 'Subscribe Now',
      popular: false,
      highlight: false,
      bestValue: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-overlay" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-5xl sm:text-6xl text-white mb-4" data-testid="pricing-title">
            CHOOSE YOUR <span className="text-[#eab308]">PATH</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
            Unlock secret wrestling techniques and dominate your competition
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid={`pricing-card-${plan.id}`}
              className={`relative bg-[#18181b] p-8 ${
                plan.highlight 
                  ? 'border-2 border-[#dc2626]' 
                  : plan.bestValue 
                    ? 'border border-[#eab308]'
                    : 'border border-[#27272a]'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#dc2626] px-4 py-1 text-white text-sm font-bold uppercase">
                  Most Popular
                </div>
              )}
              
              {/* Best Value Badge */}
              {plan.bestValue && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#eab308] px-4 py-1 text-black text-sm font-bold uppercase">
                  Best Value
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-heading text-2xl text-white mb-2">{plan.name}</h2>
                <p className="text-[#a1a1aa]">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.originalPrice && (
                  <span className="text-[#a1a1aa] line-through text-lg mr-2">
                    ${plan.originalPrice}
                  </span>
                )}
                <span className="text-5xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-[#a1a1aa] text-lg">/{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-[#a1a1aa]' : 'text-[#52525b]'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                data-testid={`subscribe-${plan.id}-btn`}
                onClick={() => {
                  if (plan.id === 'free') {
                    user ? navigate('/dashboard') : login();
                  } else {
                    handleSubscribe(plan.id);
                  }
                }}
                disabled={processingPlan === plan.id || (isPremium && plan.id !== 'free')}
                className={`w-full py-6 font-bold uppercase tracking-wider ${
                  plan.highlight 
                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                    : plan.bestValue
                      ? 'bg-[#eab308] hover:bg-[#ca8a04] text-black'
                      : 'bg-[#27272a] hover:bg-[#3f3f46] text-white'
                }`}
              >
                {processingPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </span>
                ) : (
                  <>
                    {plan.id !== 'free' && <Crown className="w-4 h-4 mr-2" />}
                    {plan.cta}
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24"
        >
          <h2 className="font-heading text-3xl text-white text-center mb-12">
            WHAT YOU'LL <span className="text-[#dc2626]">LEARN</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#18181b] border border-[#27272a] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#27272a] flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-xl text-white">FREE CONTENT</h3>
              </div>
              <ul className="space-y-3 text-[#a1a1aa]">
                <li>• Basic stance and movement</li>
                <li>• Fundamental grips</li>
                <li>• Introduction to takedowns</li>
                <li>• Beginner defense techniques</li>
                <li>• Basic conditioning tips</li>
              </ul>
            </div>

            <div className="bg-[#18181b] border border-[#dc2626] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#dc2626] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-xl text-white">PREMIUM SECRETS</h3>
              </div>
              <ul className="space-y-3 text-[#a1a1aa]">
                <li>• Advanced chain wrestling</li>
                <li>• Counter techniques</li>
                <li>• Competition strategies</li>
                <li>• Secret setups and traps</li>
                <li>• Mental game mastery</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 text-center"
        >
          <p className="text-[#a1a1aa] mb-4">Have questions about the plans?</p>
          <a 
            href="mailto:edric.yan2022@gmail.com"
            data-testid="contact-email"
            className="inline-flex items-center gap-2 text-[#dc2626] hover:text-[#b91c1c] font-bold transition-colors"
          >
            <Mail className="w-5 h-5" />
            edric.yan2022@gmail.com
          </a>
        </motion.div>
      </main>
    </div>
  );
}
