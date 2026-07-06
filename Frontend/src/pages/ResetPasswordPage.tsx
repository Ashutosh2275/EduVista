import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Input, useToast } from '../components/ui';
import { Logo } from '../components/branding';
import { authService } from '../services/authService';
import { isAuthError } from '../utils/authErrors';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; form?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!token) {
      setErrors({ form: 'Invalid reset link. Please request a new password reset email.' });
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(token, password, confirmPassword);
      setIsSuccess(true);
      addToast({
        type: 'success',
        title: 'Password updated',
        description: 'Your password has been reset. You can now sign in.',
      });
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (error) {
      if (isAuthError(error)) {
        if (error.code === 'WEAK_PASSWORD' || error.code === 'INVALID_PASSWORD') {
          setErrors({ password: error.message });
        } else if (error.code === 'PASSWORD_MISMATCH') {
          setErrors({ confirmPassword: error.message });
        } else if (error.code === 'INVALID_RESET_TOKEN' || error.code === 'RESET_TOKEN_EXPIRED') {
          setErrors({ form: error.message });
        } else if (error.code === 'NETWORK_ERROR') {
          setErrors({ form: 'Network error. Please check your connection.' });
        } else {
          setErrors({ form: error.message });
        }
        addToast({ type: 'error', title: 'Reset failed', description: error.message });
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' });
        addToast({ type: 'error', title: 'Reset failed', description: 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md text-center">
          <Logo variant="wordmark" asLink className="mb-10 mx-auto" />
          <h1 className="text-display-sm font-heading font-semibold text-primary mb-4">Invalid reset link</h1>
          <p className="text-body text-muted mb-8">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link to="/forgot-password">
            <Button fullWidth>Request new reset link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md text-center">
          <Logo variant="wordmark" asLink className="mb-10 mx-auto" />
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
          <h1 className="text-display-sm font-heading font-semibold text-primary mb-4">Password reset successful</h1>
          <p className="text-body text-muted mb-4">Redirecting you to the login page...</p>
          <Link to="/login" className="text-body-sm font-medium text-accent hover:underline">
            Go to login now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <Logo variant="wordmark" asLink className="mb-10" />
        <h1 className="text-display-sm font-heading font-semibold text-primary mb-2">Set a new password</h1>
        <p className="text-body text-muted mb-8">
          Choose a strong password for your EduVista account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && (
            <p className="text-body-sm text-error bg-error/5 border border-error/20 rounded-xl px-4 py-3">
              {errors.form}
            </p>
          )}

          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={errors.password}
              fullWidth
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-muted hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword}
              fullWidth
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[38px] text-muted hover:text-primary transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Reset Password
          </Button>
        </form>
        <p className="text-center text-body-sm text-muted mt-8">
          <Link to="/login" className="font-medium text-accent hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
