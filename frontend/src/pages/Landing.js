import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Play, Lock, Crown, Mail, ChevronRight, Zap, Target, Trophy, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';

export default function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: Target, title: 'Expert Techniques', desc: 'Learn from championship-level wrestling moves' },
    { icon: Zap, title: 'Secret Moves', desc: 'Unlock hidden techniques that give you the edge' },
    { icon: Trophy, title: 'Competition Ready', desc: 'Train like a champion, compete like a winner' },
    { icon: Users, title: 'Community', desc: 'Join wrestlers who are leveling up their game' }
  ];

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-overlay" />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1549505415-e16dbd446231?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Wrestling"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1 bg-[#dc2626] text-white text-sm font-bold uppercase tracking-wider mb-6">
              Master The Mat
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight">
              UNLOCK YOUR<br />
              <span className="text-[#dc2626]">WRESTLING</span><br />
              POTENTIAL
            </h1>
            <p className="text-[#a1a1aa] text-lg mb-8 max-w-lg">
              Learn championship-winning techniques, secret moves, and competition strategies from expert coaches.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Button 
                  data-testid="go-to-dashboard-btn"
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-6 text-lg font-bold uppercase tracking-wider"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Training
                </Button>
              ) : (
                <Button 
                  data-testid="get-started-btn"
                  onClick={login}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-6 text-lg font-bold uppercase tracking-wider"
                >
                  Get Started Free
                </Button>
              )}
              <Button 
                data-testid="view-pricing-btn"
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="border-white/20 hover:border-white text-white px-8 py-6 text-lg font-bold uppercase tracking-wider bg-transparent"
              >
                View Plans
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              WHY <span className="text-[#dc2626]">IRON HOLD</span>
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Everything you need to dominate on the mat
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#18181b] border border-[#27272a] p-8 group hover:border-[#dc2626]/50 transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-[#dc2626] flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl text-white mb-3">{feature.title}</h3>
                <p className="text-[#a1a1aa]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-[#18181b] relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl sm:text-5xl text-white mb-4">
              CHOOSE YOUR <span className="text-[#eab308]">PATH</span>
            </h2>
            <p className="text-[#a1a1aa] text-lg">
              Start free and upgrade when you're ready
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#09090b] border border-[#27272a] p-8"
            >
              <h3 className="font-heading text-2xl text-white mb-2">FREE</h3>
              <p className="text-[#a1a1aa] mb-6">Basic techniques</p>
              <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-[#a1a1aa]">/forever</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Play className="w-4 h-4 text-[#22c55e]" /> Basic wrestling moves
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Play className="w-4 h-4 text-[#22c55e]" /> Beginner tutorials
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Lock className="w-4 h-4 text-[#dc2626]" /> Secret techniques locked
                </li>
              </ul>
              <Button 
                data-testid="free-plan-btn"
                onClick={() => user ? navigate('/dashboard') : login()}
                className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Button>
            </motion.div>

            {/* Monthly Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#09090b] border-2 border-[#dc2626] p-8 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#dc2626] px-4 py-1 text-white text-sm font-bold uppercase">
                Popular
              </div>
              <h3 className="font-heading text-2xl text-white mb-2">MONTHLY PRO</h3>
              <p className="text-[#a1a1aa] mb-6">Full access</p>
              <div className="text-4xl font-bold text-white mb-6">$19.99<span className="text-lg text-[#a1a1aa]">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Play className="w-4 h-4 text-[#22c55e]" /> All basic techniques
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Crown className="w-4 h-4 text-[#eab308]" /> Secret techniques
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Crown className="w-4 h-4 text-[#eab308]" /> Advanced moves
                </li>
              </ul>
              <Button 
                data-testid="monthly-plan-btn"
                onClick={() => navigate('/pricing')}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white"
              >
                Subscribe Now
              </Button>
            </motion.div>

            {/* Annual Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#09090b] border border-[#eab308] p-8 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#eab308] px-4 py-1 text-black text-sm font-bold uppercase">
                Best Value
              </div>
              <h3 className="font-heading text-2xl text-white mb-2">ANNUAL PRO</h3>
              <p className="text-[#a1a1aa] mb-6">2 months free</p>
              <div className="text-4xl font-bold text-white mb-6">$149.99<span className="text-lg text-[#a1a1aa]">/year</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Play className="w-4 h-4 text-[#22c55e]" /> Everything in Monthly
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Crown className="w-4 h-4 text-[#eab308]" /> Save $90/year
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <Crown className="w-4 h-4 text-[#eab308]" /> Priority support
                </li>
              </ul>
              <Button 
                data-testid="annual-plan-btn"
                onClick={() => navigate('/pricing')}
                className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-black font-bold"
              >
                Subscribe Now
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#18181b] border border-[#27272a] p-12 text-center"
          >
            <h2 className="font-heading text-4xl text-white mb-4">
              HAVE QUESTIONS?
            </h2>
            <p className="text-[#a1a1aa] text-lg mb-8 max-w-xl mx-auto">
              Get in touch and I'll help you start your wrestling journey
            </p>
            <a 
              href="mailto:edric.yan2022@gmail.com"
              data-testid="contact-email-link"
              className="inline-flex items-center gap-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-4 font-bold uppercase tracking-wider transition-colors"
            >
              <Mail className="w-5 h-5" />
              edric.yan2022@gmail.com
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-heading text-xl text-white">IRON HOLD</div>
          <p className="text-[#a1a1aa] text-sm">© 2024 Iron Hold Wrestling. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
