import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Breadcrumbs from '../components/ui/Breadcrumbs';

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, challengeTOTP } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const result = await signIn(data.email, data.password);
      if (result.requiresMFA && result.factorId) {
        setMfaStep(true);
        setMfaFactorId(result.factorId);
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error toast is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    if (!mfaFactorId || mfaCode.length !== 6) return;
    setMfaLoading(true);
    try {
      const success = await challengeTOTP(mfaFactorId, mfaCode);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error toast handled in AuthContext
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <Breadcrumbs />
        </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl"
      >
        {mfaStep ? (
          <>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Zwei-Faktor-Authentifizierung</h2>
              <p className="mt-2 text-sm text-gray-600">
                Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 text-center text-3xl font-mono tracking-[0.6em] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                autoFocus
              />
              <Button onClick={handleMfaVerify} isLoading={mfaLoading} disabled={mfaCode.length !== 6} className="w-full">
                Verifizieren
              </Button>
              <button
                onClick={() => { setMfaStep(false); setMfaCode(''); setMfaFactorId(null); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Zurück zur Anmeldung
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('auth.login.title')}</h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {t('auth.login.subtitle')}
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-4">
                <Input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  label={t('auth.email')}
                  registration={register('email', { required: t('auth.validation.email_required') })}
                  error={errors.email?.message}
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  label={t('auth.password')}
                  registration={register('password', { required: t('auth.validation.password_required') })}
                  error={errors.password?.message}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-medium text-german-red hover:text-blue-500">
                    {t('auth.forgot_password')}
                  </a>
                </div>
              </div>
              <div>
                <Button type="submit" isLoading={isLoading} className="w-full">
                  {t('auth.login_button')}
                </Button>
              </div>
            </form>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('auth.no_account')}{' '}
                <Link to="/register" className="font-medium text-german-red hover:text-blue-500">
                  {t('auth.sign_up')}
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
