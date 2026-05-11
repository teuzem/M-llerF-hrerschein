import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, User, LogOut, Car, LayoutDashboard, FileText, FolderOpen, HelpCircle, MessageSquare, Image as ImageIcon, MessageCircle as MessageIcon, ShoppingCart, Trash2 } from 'lucide-react'
import { useAuth, Profile } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../ui/Avatar'

const getGreeting = (t: (key: string) => string): string => {
  const hours = new Date().getHours();
  if (hours < 12) return t('greetings.morning');
  if (hours < 18) return t('greetings.afternoon');
  return t('greetings.evening');
};

const getProfileCompletion = (profile: Profile | null): number => {
  if (!profile) return 0;
  const fields: (keyof Profile)[] = ['full_name', 'phone', 'neph_number', 'avatar_url', 'address', 'city', 'postal_code', 'region', 'bio'];
  const filledCount = fields.filter(field => !!profile[field]).length;
  return Math.round((filledCount / fields.length) * 100);
};

export default function Header() {
  const { t, i18n } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const { items, getCartCount, getTotal, removeFromCart, openOrderModal } = useCart()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const cartCount = getCartCount()

  // Close cart dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleLanguage = () => {
    const langs = ['de', 'en', 'fr'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    const nextLang = langs[nextIndex];
    i18n.changeLanguage(nextLang);
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const currentFlag = i18n.language === 'de' ? '🇩🇪' : i18n.language === 'en' ? '🇺🇸' : '🇫🇷';
  const currentLangCode = i18n.language.toUpperCase();
  const greeting = getGreeting(t);
  const profileCompletion = useMemo(() => getProfileCompletion(profile), [profile]);

  const navLinks = [
    { to: "/", label: t('nav.home') },
    { to: "/services", label: t('nav.services') },
    { to: "/pricing", label: t('nav.pricing') },
    { to: "/testimonials", label: t('nav.testimonials') },
    { to: "/gallery", label: t('nav.gallery') },
    { to: "/contact", label: t('nav.contact') },
  ];

  const dashboardLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('header.user_menu.dashboard') },
    { to: '/dashboard/applications', icon: FileText, label: t('header.user_menu.applications') },
    { to: '/dashboard/messages', icon: MessageIcon, label: t('header.user_menu.messages') },
    { to: '/dashboard/profile', icon: User, label: t('header.user_menu.profile') },
    { to: '/dashboard/testimonials', icon: MessageSquare, label: t('header.user_menu.testimonials') },
    { to: '/dashboard/media', icon: ImageIcon, label: t('header.user_menu.media') },
    { to: '/dashboard/documents', icon: FolderOpen, label: t('header.user_menu.documents') },
    { to: '/dashboard/help', icon: HelpCircle, label: t('header.user_menu.help') },
  ];

  return (
    <header className="bg-white shadow-lg border-b-4 border-german-red sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-german-black via-german-red to-german-gold rounded-lg flex items-center justify-center shadow-lg">
              <Car className="w-7 h-7 text-german-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent">
                MüllerFührerschein
              </span>
              <span className="text-xs text-gray-600 font-medium">
                Berlin • Deutschland
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-gray-700 hover:text-german-red font-medium transition-colors duration-200">{link.label}</Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200" 
              title={i18n.language === 'de' ? 'Sprache wechseln' : i18n.language === 'en' ? 'Change language' : 'Changer de langue'}
            >
              <span className="text-lg">{currentFlag}</span>
              <span className="text-sm font-medium">{currentLangCode}</span>
            </button>

            {/* Cart Button */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-german-red text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-german-red" />
                        {t('cart.title')} ({cartCount})
                      </h3>
                    </div>
                    {items.length === 0 ? (
                      <div className="p-6 text-center">
                        <ShoppingCart className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">{t('cart.empty')}</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-56 overflow-y-auto p-3 space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
                              <div className="w-8 h-8 bg-german-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-black text-german-red">{item.category}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-german-red font-bold">{item.price.toLocaleString()}€</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-gray-600">{t('order.total')}</span>
                            <span className="text-lg font-black text-german-red">{getTotal().toLocaleString()}€</span>
                          </div>
                          <button
                            onClick={() => { setIsCartOpen(false); openOrderModal(); }}
                            className="w-full py-2.5 bg-gradient-to-r from-german-red to-red-600 text-white font-semibold rounded-xl text-sm hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                          >
                            {t('cart.checkout')}
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user && profile ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-german-red text-white hover:bg-red-700 transition-colors duration-200">
                  <Avatar name={profile.full_name || ''} avatarUrl={profile.avatar_url} size="sm" />
                  <span className="font-medium">{profile.full_name}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 origin-top-right">
                      <div className="p-4 border-b">
                        <p className="text-sm text-gray-500">{greeting},</p>
                        <p className="font-semibold text-lg text-gray-800">{profile.full_name}</p>
                        <div className="mt-3">
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                            <span>{t('header.user_menu.profile_completion')}</span>
                            <span className="font-bold text-german-red">{profileCompletion}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-german-red h-1.5 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 grid grid-cols-2 gap-2">
                        {dashboardLinks.map(link => (
                          <Link key={link.to} to={link.to} className="flex items-center gap-3 p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}>
                            <link.icon className="w-4 h-4 text-gray-500" />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t">
                        <button onClick={handleSignOut} className="w-full text-left p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 text-sm">
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-german-red font-medium hover:text-red-800 transition-colors duration-200">{t('nav.login')}</Link>
                <Link to="/register" className="px-6 py-2 bg-gradient-to-r from-german-black via-german-red to-german-gold text-white font-medium rounded-lg hover:from-gray-900 hover:via-red-700 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105 shadow-lg">{t('nav.register')}</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-german-red hover:bg-gray-100 transition-colors duration-200">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} className="text-gray-700 hover:text-german-red font-medium py-2 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>{link.label}</Link>
                ))}

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button 
                    onClick={() => {
                      toggleLanguage();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 mb-4 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="text-lg">{currentFlag}</span>
                    <span className="font-medium text-gray-700">{i18n.language === 'de' ? 'Sprache:' : i18n.language === 'en' ? 'Language:' : 'Langue:'} {currentLangCode}</span>
                  </button>

                  {user ? (
                    <div className="space-y-2">
                      <Link to="/dashboard" className="block w-full text-left px-4 py-2 bg-german-red text-white rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>{t('nav.dashboard')}</Link>
                      <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/login" className="block w-full text-center px-4 py-2 text-german-red border border-german-red rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>{t('nav.login')}</Link>
                      <Link to="/register" className="block w-full text-center px-4 py-2 bg-gradient-to-r from-german-black via-german-red to-german-gold text-white font-medium rounded-lg" onClick={() => setIsMenuOpen(false)}>{t('nav.register')}</Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
