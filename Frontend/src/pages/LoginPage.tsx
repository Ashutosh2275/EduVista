import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, useToast } from '../components/ui';
import { Logo } from '../components/branding';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { authErrorToastMessage, isAuthError } from '../utils/authErrors';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    const remembered = authService.getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    setErrors({});

    if (!email.trim() || !password) {
      setErrors({
        email: !email.trim() ? 'Email is required.' : undefined,
        password: !password ? 'Password is required.' : undefined,
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const user = await login({ email, password, rememberMe });

      if (rememberMe) {
        authService.rememberEmail(email.trim());
      } else {
        authService.rememberEmail(null);
      }

      addToast({ type: 'success', title: 'Welcome back!', description: 'You are now signed in.' });

      if (from && from.startsWith('/admin') && user.role === 'ADMIN') {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (from && !from.startsWith('/admin')) {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      if (isAuthError(error)) {
        const toast = authErrorToastMessage(error);
        addToast({ type: 'error', title: toast.title, description: toast.description });

        if (error.code === 'INVALID_EMAIL') {
          setErrors({ email: error.message });
        } else if (
          error.code === 'INVALID_PASSWORD' ||
          error.code === 'INVALID_CREDENTIALS' ||
          error.code === 'USER_NOT_FOUND'
        ) {
          setErrors({ password: error.message });
        } else if (error.code === 'REQUIRED_FIELDS') {
          setErrors({ form: error.message });
        } else if (error.code === 'NETWORK_ERROR') {
          setErrors({ form: 'Network error. Please check your connection.' });
        } else if (error.code === 'SERVER_ERROR') {
          setErrors({ form: 'Server unavailable. Please try again later.' });
        } else if (error.code === 'ACCOUNT_DISABLED' || error.code === 'FORBIDDEN') {
          setErrors({ form: error.message });
        } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
          setErrors({ form: error.message });
        } else {
          setErrors({ form: error.message });
        }
      } else {
        addToast({
          type: 'error',
          title: 'Sign in failed',
          description: 'Something went wrong. Please try again.',
        });
        setErrors({ form: 'Something went wrong. Please try again.' });
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent via-accent-dark to-secondary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <Logo variant="auth" theme="dark" asLink className="mb-16" />

          <h1 className="text-display-md font-heading font-semibold mb-6">
            Discover Your
            <br />
            Educational Journey
          </h1>

          <p className="text-body text-white/80 max-w-sm mb-12">
            Join thousands of students who have found their perfect college through
            our AI-powered discovery platform.
          </p>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
            <p className="text-body-sm text-white/90 mb-4">
              "EduVista made finding the right college so much easier. The AI recommendations
              were spot on!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                PS
              </div>
              <div>
                <p className="text-body-sm font-medium">Priya Sharma</p>
                <p className="text-body-xs text-white/60">IIT Delhi, 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo (Mobile) */}
          <Logo variant="wordmark" asLink className="lg:hidden mb-10" />

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-display-sm font-heading font-semibold text-primary mb-2">
              Welcome back
            </h2>
            <p className="text-body text-muted">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <p className="text-body-sm text-error bg-error/5 border border-error/20 rounded-xl px-4 py-3">
                {errors.form}
              </p>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              error={errors.email}
              fullWidth
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                error={errors.password}
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-muted hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent focus:outline-none focus-visible:outline-none"
                />
                <span className="text-body-sm text-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-body-sm font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-body-sm text-muted mt-10">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
