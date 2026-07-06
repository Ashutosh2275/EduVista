import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Input, Dropdown, useToast } from '../components/ui';
import { Logo } from '../components/branding';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePhone, validatePasswordStrength } from '../services/authService';
import { isAuthError } from '../utils/authErrors';

const fieldOptions = [
  { value: 'engineering', label: 'Engineering & Technology' },
  { value: 'medical', label: 'Medical & Healthcare' },
  { value: 'business', label: 'Business & Management' },
  { value: 'arts', label: 'Arts & Humanities' },
  { value: 'science', label: 'Science & Research' },
  { value: 'law', label: 'Law' },
  { value: 'other', label: 'Other' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    field: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '', form: '' }));
  };

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = 'Full name is required.';
    if (!formData.email.trim()) nextErrors.email = 'Email is required.';
    else if (!validateEmail(formData.email)) nextErrors.email = 'Please enter a valid email address.';
    if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!validatePhone(formData.phone)) nextErrors.phone = 'Please enter a valid 10-digit phone number.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepTwo = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.password) nextErrors.password = 'Password is required.';
    else if (!validatePasswordStrength(formData.password)) {
      nextErrors.password = 'Use 8+ chars with upper, lower, number, and special character.';
    }

    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptedTerms) nextErrors.form = 'Please accept the terms and privacy policy.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStepOne()) setStep(2);
      return;
    }

    if (!validateStepTwo()) return;

    setIsSubmitting(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        field: formData.field,
      });

      addToast({
        type: 'success',
        title: 'Account created!',
        description: 'Please sign in with your new credentials.',
      });
      navigate('/login');
    } catch (error) {
      if (isAuthError(error)) {
        addToast({ type: 'error', title: 'Registration failed', description: error.message });
        if (error.code === 'EMAIL_EXISTS') setErrors({ email: error.message });
        else if (error.code === 'INVALID_EMAIL') setErrors({ email: error.message });
        else if (error.code === 'INVALID_PHONE') setErrors({ phone: error.message });
        else if (error.code === 'WEAK_PASSWORD') setErrors({ password: error.message });
        else if (error.code === 'NETWORK_ERROR') setErrors({ form: 'Network error. Please check your connection.' });
        else if (error.code === 'SERVER_ERROR') setErrors({ form: 'Server unavailable. Please try again later.' });
        else setErrors({ form: error.message });
      } else {
        addToast({ type: 'error', title: 'Registration failed', description: 'Please try again.' });
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    'Personalized AI-powered college recommendations',
    'Compare and shortlist multiple colleges',
    'Track your application status',
    'Access detailed college insights and reviews',
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-40 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <Logo variant="auth" theme="dark" asLink className="mb-16" />

          <h1 className="text-display-md font-heading font-semibold mb-6">
            Start Your Journey
            <br />
            Today
          </h1>

          <p className="text-body text-white/80 max-w-sm mb-12">
            Create your account and begin exploring thousands of colleges tailored
            to your unique aspirations and goals.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-body-sm text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Logo variant="wordmark" asLink className="lg:hidden mb-10" />

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-body-sm font-medium transition-colors',
                step >= 1 ? 'bg-accent text-white' : 'bg-border text-muted'
              )}>
                1
              </div>
              <div className={cn(
                'flex-1 h-0.5 transition-colors',
                step >= 2 ? 'bg-accent' : 'bg-border'
              )} />
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-body-sm font-medium transition-colors',
                step >= 2 ? 'bg-accent text-white' : 'bg-border text-muted'
              )}>
                2
              </div>
            </div>

            <h2 className="text-display-sm font-heading font-semibold text-primary mb-2">
              {step === 1 ? 'Create your account' : 'Just a few more details'}
            </h2>
            <p className="text-body text-muted">
              {step === 1
                ? 'Enter your basic information to get started'
                : 'Help us personalize your experience'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <p className="text-body-sm text-error bg-error/5 border border-error/20 rounded-xl px-4 py-3">
                {errors.form}
              </p>
            )}

            {step === 1 && (
              <>
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<User className="w-4 h-4" />}
                  error={errors.name}
                  fullWidth
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                  fullWidth
                />

                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={<Phone className="w-4 h-4" />}
                  error={errors.phone}
                  fullWidth
                />
              </>
            )}

            {step === 2 && (
              <>
                <Dropdown
                  label="Field of Interest"
                  options={fieldOptions}
                  value={formData.field}
                  onChange={(value) => setFormData({ ...formData, field: value })}
                  fullWidth
                />

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
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

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                  fullWidth
                />

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      setErrors((prev) => ({ ...prev, form: '' }));
                    }}
                    className="w-4 h-4 mt-0.5 rounded border-border text-accent focus:outline-none focus-visible:outline-none"
                  />
                  <span className="text-body-sm text-muted">
                    I agree to the{' '}
                    <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                  </span>
                </label>
              </>
            )}

            <div className="flex gap-4">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {step === 1 ? 'Continue' : 'Create Account'}
              </Button>
            </div>
          </form>

          <p className="text-center text-body-sm text-muted mt-10">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
