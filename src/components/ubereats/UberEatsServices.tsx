import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  Users, 
  CreditCard, 
  FileText, 
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
  ArrowLeft,
  Star,
  Award,
  UserCheck,
  Unlock
} from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

// Interface pour les props du composant
interface UberEatsServicesProps {
  serviceType?: 'creation' | 'activation' | 'deblocage';
  className?: string;
}

// Composant pour la création de compte
const CreateAccountService: React.FC = () => {
  const { t } = useTranslation('ubereats');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseType: '',
    licenseNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(t('create_account.success'));
    } catch (error) {
      alert(t('create_account.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      icon: FileText,
      title: t('create_account.steps.documents'),
      description: t('create_account.steps.documents_desc')
    },
    {
      icon: UserCheck,
      title: t('create_account.steps.verification'),
      description: t('create_account.steps.verification_desc')
    },
    {
      icon: CheckCircle,
      title: t('create_account.steps.approval'),
      description: t('create_account.steps.approval_desc')
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('create_account.title')}
          </h2>
          <p className="text-gray-600 text-lg">
            {t('create_account.subtitle')}
          </p>
        </div>

        {/* Processus en étapes */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Comment ça marche ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                  <step.icon className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create_account.form.full_name')} *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('create_account.form.full_name_placeholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create_account.form.email')} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="exemple@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create_account.form.phone')} *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+49 xxx xxx xxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create_account.form.license_type')} *
              </label>
              <select
                required
                value={formData.licenseType}
                onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{t('common.select_prompt')}</option>
                <option value="b">Permis B (Voiture)</option>
                <option value="a1">Permis A1 (Moto légère)</option>
                <option value="a">Permis A (Moto)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create_account.form.password')} *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create_account.form.confirm_password')} *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('create_account.form.license_number')}
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('create_account.form.license_number_placeholder')}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important :</p>
                <p>{t('create_account.disclaimer')}</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 py-4 text-lg"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Users className="mr-2 h-5 w-5" />
            )}
            {isLoading ? t('common.loading') : t('create_account.form.submit')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

// Composant pour l'activation de compte
const ActivationService: React.FC = () => {
  const { t } = useTranslation('ubereats');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'approved' | 'rejected'>('pending');

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'yellow',
      title: t('activation.status.pending'),
      description: t('activation.status.pending_desc')
    },
    in_progress: {
      icon: CheckCircle,
      color: 'blue',
      title: t('activation.status.in_progress'),
      description: t('activation.status.in_progress_desc')
    },
    approved: {
      icon: Award,
      color: 'green',
      title: t('activation.status.approved'),
      description: t('activation.status.approved_desc')
    },
    rejected: {
      icon: AlertCircle,
      color: 'red',
      title: t('activation.status.rejected'),
      description: t('activation.status.rejected_desc')
    }
  };

  const currentStatus = statusConfig[status];

  const requirements = [
    {
      icon: FileText,
      title: t('activation.requirements.documents'),
      description: t('activation.requirements.documents_desc'),
      completed: true
    },
    {
      icon: CheckCircle,
      title: t('activation.requirements.background_check'),
      description: t('activation.requirements.background_check_desc'),
      completed: true
    },
    {
      icon: CreditCard,
      title: t('activation.requirements.bank_info'),
      description: t('activation.requirements.bank_info_desc'),
      completed: false
    },
    {
      icon: Users,
      title: t('activation.requirements.training'),
      description: t('activation.requirements.training_desc'),
      completed: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('activation.title')}
          </h2>
          <p className="text-gray-600 text-lg">
            {t('activation.subtitle')}
          </p>
        </div>

        {/* Statut actuel */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center justify-center w-16 h-16 bg-${currentStatus.color}-100 rounded-full`}>
              <currentStatus.icon className={`h-8 w-8 text-${currentStatus.color}-600`} />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStatus.title}
            </h3>
            <p className="text-gray-600">
              {currentStatus.description}
            </p>
          </div>
        </div>

        {/* Progression */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {t('activation.progress.title')}
          </h3>
          <div className="space-y-4">
            {requirements.map((req, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center p-4 rounded-lg border-2 ${
                  req.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${
                  req.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {req.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{req.title}</h4>
                  <p className="text-sm text-gray-600">{req.description}</p>
                </div>
                <div className={`text-sm font-medium ${
                  req.completed ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {req.completed ? t('common.completed') : t('common.in_progress')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link to="/contact">
              <Phone className="mr-2 h-4 w-4" />
              {t('activation.contact_support')}
            </Link>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Mail className="mr-2 h-4 w-4" />
            {t('activation.send_documents')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Composant pour le déblocage de compte
const UnlockService: React.FC = () => {
  const { t } = useTranslation('ubereats');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(t('unlock.success'));
    } catch (error) {
      alert(t('unlock.error'));
    } finally {
      setIsUnlocking(false);
    }
  };

  const requirements = [
    {
      icon: CheckCircle,
      title: t('unlock.requirements.license'),
      description: t('unlock.requirements.license_desc'),
      status: 'completed'
    },
    {
      icon: CheckCircle,
      title: t('unlock.requirements.insurance'),
      description: t('unlock.requirements.insurance_desc'),
      status: 'completed'
    },
    {
      icon: Clock,
      title: t('unlock.requirements.background_check'),
      description: t('unlock.requirements.background_check_desc'),
      status: 'in_progress'
    },
    {
      icon: Clock,
      title: t('unlock.requirements.app_download'),
      description: t('unlock.requirements.app_download_desc'),
      status: 'pending'
    },
    {
      icon: Clock,
      title: t('unlock.requirements.bank_details'),
      description: t('unlock.requirements.bank_details_desc'),
      status: 'pending'
    }
  ];

  const steps = [
    {
      number: 1,
      title: t('unlock.process.step1'),
      description: t('unlock.process.step1_desc')
    },
    {
      number: 2,
      title: t('unlock.process.step2'),
      description: t('unlock.process.step2_desc')
    },
    {
      number: 3,
      title: t('unlock.process.step3'),
      description: t('unlock.process.step3_desc')
    },
    {
      number: 4,
      title: t('unlock.process.step4'),
      description: t('unlock.process.step4_desc')
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('unlock.title')}
          </h2>
          <p className="text-gray-600 text-lg">
            {t('unlock.subtitle')}
          </p>
        </div>

        {/* Exigences */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {t('unlock.requirements.title')}
          </h3>
          <div className="space-y-4">
            {requirements.map((req, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-4 rounded-lg border border-gray-200"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${
                  req.status === 'completed' ? 'bg-green-100' : 
                  req.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <req.icon className={`h-5 w-5 ${
                    req.status === 'completed' ? 'text-green-600' : 
                    req.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{req.title}</h4>
                  <p className="text-sm text-gray-600">{req.description}</p>
                </div>
                <div className={`text-sm font-medium ${
                  req.status === 'completed' ? 'text-green-600' : 
                  req.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {req.status === 'completed' ? t('common.completed') : 
                   req.status === 'in_progress' ? t('common.in_progress') : t('common.pending')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Processus */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {t('unlock.process.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold mr-4 mt-1">
                  {step.number}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-4">
              <Unlock className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('unlock.ready_title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('unlock.ready_description')}
            </p>
          </div>
          
          <Button 
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="bg-green-600 hover:bg-green-700 py-4 px-8 text-lg"
          >
            {isUnlocking ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Unlock className="mr-2 h-5 w-5" />
            )}
            {isUnlocking ? t('common.loading') : t('unlock.cta')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Composant principal
const UberEatsServices: React.FC<UberEatsServicesProps> = ({ 
  serviceType = 'creation',
  className = '' 
}) => {
  const { t } = useTranslation();

  const renderService = () => {
    switch (serviceType) {
      case 'activation':
        return <ActivationService />;
      case 'deblocage':
        return <UnlockService />;
      default:
        return <CreateAccountService />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation breadcrumbs */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600">Accueil</Link>
            <ArrowRight className="h-4 w-4" />
            <Link to="/ubereats" className="hover:text-green-600">Uber Eats</Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-gray-900">
              {serviceType === 'creation' && 'Création de compte'}
              {serviceType === 'activation' && 'Activation'}
              {serviceType === 'deblocage' && 'Déblocage'}
            </span>
          </nav>
        </motion.div>

        {/* Service content */}
        {renderService()}

        {/* Navigation footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" asChild>
            <Link to="/ubereats">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux services Uber Eats
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UberEatsServices;