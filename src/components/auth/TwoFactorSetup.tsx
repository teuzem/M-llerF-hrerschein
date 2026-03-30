import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Shield, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const TwoFactorSetup: React.FC = () => {
  const { user, enrollTOTP, verifyTOTP, unenrollTOTP } = useAuth();
  const [step, setStep] = useState<'idle' | 'enrolling' | 'verifying'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const existingFactor = user?.factors?.find(f => f.factor_type === 'totp' && f.status === 'verified');
  const is2FAEnabled = !!existingFactor;

  const handleEnroll = async () => {
    setIsLoading(true);
    const result = await enrollTOTP();
    if (result) {
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setFactorId(result.factorId);
      setStep('verifying');
    }
    setIsLoading(false);
  };

  const handleVerify = async () => {
    if (!factorId || verificationCode.length !== 6) return;
    setIsLoading(true);
    const success = await verifyTOTP(factorId, verificationCode);
    if (success) {
      setStep('idle');
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerificationCode('');
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (!existingFactor) return;
    setIsLoading(true);
    const success = await unenrollTOTP(existingFactor.id);
    if (success) setStep('idle');
    setIsLoading(false);
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Geheimschlüssel kopiert');
    }
  };

  if (is2FAEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">2FA ist aktiviert</p>
            <p className="text-sm text-green-600">Ihr Konto ist durch die Zwei-Faktor-Authentifizierung geschützt.</p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleDisable} isLoading={isLoading} className="text-red-600 border-red-300 hover:bg-red-50">
          <ShieldOff className="w-4 h-4 mr-2" /> 2FA deaktivieren
        </Button>
      </div>
    );
  }

  if (step === 'verifying' && qrCode) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Scannen Sie diesen QR-Code mit Ihrer Authenticator-App (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg">
          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
        </div>

        {secret && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <code className="flex-1 text-xs font-mono text-gray-700 break-all">{secret}</code>
            <button onClick={copySecret} className="p-1.5 hover:bg-gray-200 rounded">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bestätigungscode eingeben</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => { setStep('idle'); setQrCode(null); }}>Abbrechen</Button>
          <Button onClick={handleVerify} isLoading={isLoading} disabled={verificationCode.length !== 6}>
            Aktivieren
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-yellow-800">2FA ist nicht aktiviert</p>
          <p className="text-sm text-yellow-600">Aktivieren Sie die Zwei-Faktor-Authentifizierung für zusätzliche Sicherheit.</p>
        </div>
      </div>
      <Button onClick={handleEnroll} isLoading={isLoading}>
        <Shield className="w-4 h-4 mr-2" /> 2FA aktivieren
      </Button>
    </div>
  );
};

export default TwoFactorSetup;
