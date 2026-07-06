import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button, Input, useToast } from '../components/ui';
import { Logo } from '../components/branding';
import { authService } from '../services/authService';
import { isAuthError } from '../utils/authErrors';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; form?: string }>({});
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Email is required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email);
      addToast({
        type: 'success',
        title: 'Password reset link sent successfully.',
        description: import.meta.env.DEV
          ? 'If an account exists, a reset link has been generated. In development, check the backend console for the reset URL when email is not configured.'
          : 'Check your inbox for instructions to reset your password.',
      });
      setEmail('');
    } catch (error) {
      if (isAuthError(error)) {
        if (error.code === 'INVALID_EMAIL') {
          setErrors({ email: error.message });
        } else if (error.code === 'USER_NOT_FOUND') {
          setErrors({ email: error.message });
        } else if (error.code === 'SMTP_NOT_CONFIGURED' || error.code === 'EMAIL_SEND_FAILED') {
          setErrors({ form: error.message });
        } else if (error.code === 'NETWORK_ERROR') {
          setErrors({ form: 'Network error. Please check your connection.' });
        } else if (error.code === 'SERVER_ERROR') {
          setErrors({ form: 'Server unavailable. Please try again later.' });
        } else {
          setErrors({ form: error.message });
        }
        addToast({ type: 'error', title: 'Could not send reset link', description: error.message });
      } else {
        addToast({
          type: 'error',
          title: 'Could not send reset link',
          description: 'Something went wrong. Please try again.',
        });
        setErrors({ form: 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <Logo variant="wordmark" asLink className="mb-10" />
        <h1 className="text-display-sm font-heading font-semibold text-primary mb-2">Forgot password?</h1>
        <p className="text-body text-muted mb-8">
          Enter your email and we'll send you a link to reset your password.
        </p>
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
            required
          />
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Send Reset Link
          </Button>
        </form>
        <p className="text-center text-body-sm text-muted mt-8">
          <Link to="/login" className="font-medium text-accent hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
