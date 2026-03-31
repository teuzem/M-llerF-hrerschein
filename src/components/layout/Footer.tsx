import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Car,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: t('footer.links.home'), href: '/' },
      { name: t('footer.links.services'), href: '/services' },
      { name: t('footer.links.pricing'), href: '/pricing' },
      { name: t('footer.links.clients'), href: '/clients' },
    ],
    support: [
      { name: t('footer.links.contact'), href: '/contact' },
      { name: t('common.faq'), href: '/faq' },
      { name: t('footer.links.legal'), href: '/legal' },
      { name: t('footer.links.privacy'), href: '/privacy' },
    ],
    social: [
      { name: 'Facebook', href: '#', icon: Facebook },
      { name: 'Twitter', href: '#', icon: Twitter },
      { name: 'Instagram', href: '#', icon: Instagram },
      { name: 'LinkedIn', href: '#', icon: Linkedin },
    ]
  };

  return (
    <footer className="bg-german-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-german-red to-german-gold rounded-lg flex items-center justify-center">
                <Car className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {t('footer.company')}
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-german-red transition-colors duration-300 group"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-german-gold">{t('common.home')}</h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white flex items-center group transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-german-red opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-german-gold">{t('dashboard.nav.help')}</h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white flex items-center group transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-german-red opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold mb-6 text-german-gold">{t('footer.contact.title')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-german-red flex-shrink-0" />
                <a href="tel:+4915212399096">+49 15 212399096</a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-german-red flex-shrink-0" />
                <a href="mailto:mulerfuhrerschein@gmail.com">mulerfuhrerschein@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              {t('footer.service_tag')}
            </span>
            <span className="hidden md:inline text-white/10">|</span>
            <span>{t('footer.location')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
