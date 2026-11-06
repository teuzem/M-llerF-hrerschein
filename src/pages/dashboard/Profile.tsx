import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import ProfileCompletion from '../../components/dashboard/ProfileCompletion';
import AvatarEditor from '../../components/dashboard/AvatarEditor';
import PasswordStrengthIndicator from '../../components/dashboard/PasswordStrengthIndicator';
import SocialLinksInput from '../../components/dashboard/SocialLinksInput';
import Switch from '../../components/ui/Switch';
import TwoFactorSetup from '../../components/auth/TwoFactorSetup';

import { User as UserIcon, Phone, Hash, Languages, Home, Building, MapPin, Shield, Edit2, X, Check, AlertTriangle, Trash2, Camera, Globe, Eye, Mail, ImagePlus } from 'lucide-react';
import { regions } from '../../lib/constants';

type ProfileFormValues = {
  full_name: string;
  phone: string;
  neph_number: string;
  bio: string;
  address: string;
  city: string;
  postal_code: string;
  region: { value: string; label: string } | null;
  social_links: { platform: string; url: string }[];
  is_public: boolean;
};

type PasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

const DashboardProfile = () => {
  const { t, i18n } = useTranslation();
  const { profile, updateProfile, refreshProfile, deleteAccount } = useAuth();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [passwordStrengthValue, setPasswordStrengthValue] = useState(0);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: { full_name: '', phone: '', neph_number: '', bio: '', address: '', city: '', postal_code: '', region: null, social_links: [], is_public: false },
    mode: 'onChange'
  });
  const { fields, append, remove } = useFieldArray({ control, name: "social_links" });
  const { handleSubmit: handlePasswordSubmit, reset: resetPassword, watch: watchPassword, control: passwordControl } = useForm<PasswordFormValues>({ mode: 'onChange' });

  const newPassword = watchPassword('newPassword');

  // Lazy-load zxcvbn to prevent crash
  useEffect(() => {
    if (newPassword) {
      import('@zxcvbn-ts/core').then(({ zxcvbn }) => {
        setPasswordStrengthValue(zxcvbn(newPassword).score);
      }).catch(() => {
        setPasswordStrengthValue(0);
      });
    } else {
      setPasswordStrengthValue(0);
    }
  }, [newPassword]);

  useEffect(() => {
    if (profile?.avatar_url) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
      setAvatarUrl(data.publicUrl);
    } else { setAvatarUrl(null); }
    if (profile?.cover_url) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(profile.cover_url);
      setCoverUrl(data.publicUrl);
    } else { setCoverUrl(null); }
  }, [profile?.avatar_url, profile?.cover_url]);

  const setFormDefaults = () => {
    if (profile) {
      const currentRegion = regions.find(r => r.value === profile.region);
      const socialLinksArray = profile.social_links ? Object.entries(profile.social_links).map(([platform, url]) => ({ platform, url: String(url) })) : [];
      reset({ full_name: profile.full_name || '', phone: profile.phone || '', neph_number: profile.neph_number || '', bio: profile.bio || '', address: profile.address || '', city: profile.city || '', postal_code: profile.postal_code || '', region: currentRegion || null, social_links: socialLinksArray, is_public: profile.is_public || false });
    }
  };

  useEffect(() => { setFormDefaults(); }, [profile, reset]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileLoading(true);
    try {
      const socialLinksObject = data.social_links.reduce((acc, link) => { if (link.url) acc[link.platform] = link.url; return acc; }, {} as { [key: string]: string });
      await updateProfile({ ...data, region: data.region?.value, social_links: socialLinksObject });
      toast.success(t('profile.update_success', 'Profil aktualisiert.'));
      setEditingSection(null);
    } catch(e) { toast.error(t('common.error', 'Ein Fehler ist aufgetreten')); }
    finally { setIsProfileLoading(false); }
  };

  const handleCancelEdit = () => { setFormDefaults(); setEditingSection(null); };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (passwordStrengthValue < 2) { toast.error(t('profile.password_weak', 'Das Passwort ist zu schwach.')); return; }
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;
      toast.success(t('profile.password_success', 'Passwort aktualisiert.'));
      resetPassword();
    } catch (error: any) { toast.error(error.message); }
    finally { setIsPasswordLoading(false); }
  };

  const handleLanguageChange = async (lang: 'de' | 'en' | 'fr') => {
    try { await updateProfile({ preferred_language: lang as any }); i18n.changeLanguage(lang); toast.success(t('profile.language_updated', 'Sprache aktualisiert.')); }
    catch (error) { console.error("Failed to update language"); }
  };

  const handlePublicToggle = async (isPublic: boolean) => {
    try { await updateProfile({ is_public: isPublic }); toast.success(t('profile.privacy_updated', 'Datenschutzeinstellungen aktualisiert.')); }
    catch (error) { toast.error(t('common.error')); }
  };

  const handleAvatarChange = async (file: File) => {
    if (!profile) return;
    setIsAvatarUploading(true);
    try {
      const filePath = `${profile.id}/${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      await updateProfile({ avatar_url: filePath });
      await refreshProfile();
      toast.success(t('profile.avatar_updated', 'Avatar aktualisiert!'));
    } catch (error: any) { toast.error(error.message); }
    finally { setIsAvatarUploading(false); }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { toast.error(t('profile.cover_too_large', 'Max. 5 MB für das Titelbild.')); return; }
    setIsCoverUploading(true);
    setShowCoverMenu(false);
    try {
      const filePath = `covers/${profile.id}/${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      await updateProfile({ cover_url: filePath });
      await refreshProfile();
      toast.success(t('profile.cover_updated', 'Titelbild aktualisiert!'));
    } catch (error: any) { toast.error(error.message); }
    finally { 
      setIsCoverUploading(false);
      // Reset file input so same file can be selected again
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleDeleteCover = async () => {
    if (!profile) return;
    setShowCoverMenu(false);
    try {
      await updateProfile({ cover_url: undefined });
      await refreshProfile();
      toast.success(t('profile.cover_deleted', 'Titelbild entfernt.'));
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try { await deleteAccount(); } catch { /* la suppression a deja ete traitee */ } finally { setIsDeleting(false); }
  };

  if (!profile) return null;

  const phoneValidation = { required: false, pattern: { value: /^(\+49|0)[1-9]\d{7,14}$/, message: t('profile.validation.phone_format', 'Ungültiges Telefonformat (DE)') } };
  const zipValidation = { required: false, pattern: { value: /^\d{5}$/, message: t('profile.validation.postal_code', 'PLZ muss 5 Ziffern lang sein') } };
  const nipValidation = { required: false, pattern: { value: /^[0-9]{12}$/, message: t('profile.validation.neph_format', 'NEPH muss 12 Ziffern lang sein') } };
  const memberSince = new Date(profile.created_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : i18n.language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long' });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10 max-w-5xl mx-auto">

      {/* ── Cover + Avatar Header ── */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        {/* Cover */}
        <div className="relative h-40 sm:h-52 md:h-60 w-full group">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Facebook-style cover actions */}
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
          <div className="absolute bottom-3 right-3 z-10">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowCoverMenu(!showCoverMenu); }}
                disabled={isCoverUploading}
                className="bg-white/90 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md border border-white/50"
              >
                {isCoverUploading ? (
                  <span className="animate-spin w-3.5 h-3.5 border-2 border-gray-400 border-t-gray-800 rounded-full inline-block" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                {t('profile.edit_cover', 'Titelbild bearbeiten')}
              </button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {showCoverMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 bottom-full mb-1.5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[180px] z-20"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); setShowCoverMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {t('profile.upload_cover', 'Foto hochladen')}
                    </button>
                    {coverUrl && (
                      <button
                        onClick={handleDeleteCover}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('profile.remove_cover', 'Titelbild entfernen')}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Name bar under cover */}
        <div className="px-4 sm:px-6 pb-5 pt-2 relative">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0 z-10 -mt-14 sm:-mt-16">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-white shadow-lg bg-white overflow-hidden">
                <AvatarEditor currentAvatarUrl={avatarUrl} onAvatarChange={handleAvatarChange} uploading={isAvatarUploading} />
              </div>
            </div>
            {/* Name + meta */}
            <div className="flex-1 min-w-0 pt-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate leading-tight">{profile.full_name || t('profile.unnamed', 'Unbenannter Nutzer')}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {profile.role === 'admin' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700">⭐ {t('profile.role_admin', 'Admin')}</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600">{t('profile.role_student', 'Fahrschüler')}</span>
                )}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-sm text-gray-500">{t('profile.member_since', 'Mitglied seit')} {memberSince}</span>
              </div>
              {profile.email && <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5"><Mail className="w-4 h-4" />{profile.email}</p>}
            </div>
          </div>

          {/* ── Contact Info Bar (directly under profile picture) ── */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <span className="text-base font-medium">{profile.phone || <span className="text-gray-400 italic text-base">{t('profile.not_provided', 'Nicht angegeben')}</span>}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <span className="text-base font-medium">{profile.email || <span className="text-gray-400 italic text-base">{t('profile.not_provided', 'Nicht angegeben')}</span>}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <span className="text-base font-medium">
                  {profile.city && profile.region 
                    ? `${profile.city}, ${profile.region}` 
                    : profile.city || profile.region || <span className="text-gray-400 italic text-base">{t('profile.not_provided', 'Nicht angegeben')}</span>}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Hash className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <span className="text-base font-medium">NEPH: {profile.neph_number || <span className="text-gray-400 italic text-base">{t('profile.not_provided', 'Nicht angegeben')}</span>}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT COLUMN */}
        <div className="space-y-5">

          {/* Profile Completion - FIRST card on left */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <ProfileCompletion profile={profile} />
          </div>

          {/* About Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">{t('profile.about', 'Steckbrief')}</h3>
              {editingSection !== 'about' && (
                <button onClick={() => setEditingSection('about')} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
            {editingSection === 'about' ? (
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-3">
                <Controller name="full_name" control={control} rules={{ required: t('application.form.required', 'Erforderlich') }} render={({ field, fieldState }) => <Input label={t('auth.full_name', 'Vollständiger Name')} registration={field} error={fieldState.error?.message} icon={<UserIcon className="w-4 h-4 text-gray-400" />} />} />
                <Controller name="bio" control={control} render={({ field }) => <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('profile.field.bio', 'Biografie')}</label><textarea {...field} placeholder={t('profile.field.bio_placeholder', 'Erzählen Sie etwas über sich...')} rows={2} className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50 focus:bg-white transition-colors" /></div>} />
                <Controller name="phone" control={control} rules={phoneValidation} render={({ field, fieldState }) => <Input label={t('auth.phone', 'Telefon')} registration={field} error={fieldState.error?.message} icon={<Phone className="w-4 h-4 text-gray-400" />} />} />
                <Controller name="neph_number" control={control} rules={nipValidation} render={({ field, fieldState }) => <Input label={t('profile.field.neph', 'NEPH-Nummer')} registration={field} error={fieldState.error?.message} icon={<Hash className="w-4 h-4 text-gray-400" />} />} />
                <div className="flex gap-2 justify-end pt-1">
                  <Button variant="secondary" onClick={handleCancelEdit} type="button" className="px-3 py-1.5 text-xs"><X className="w-3.5 h-3.5 mr-1" /> {t('common.cancel', 'Abbrechen')}</Button>
                  <Button type="submit" isLoading={isProfileLoading} className="px-3 py-1.5 text-xs"><Check className="w-3.5 h-3.5 mr-1" /> {t('common.save', 'Speichern')}</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {profile.bio ? <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl italic">"{profile.bio}"</p>
                  : <p className="text-gray-400 text-xs italic text-center bg-gray-50 p-3 rounded-xl">{t('profile.no_bio', 'Keine Biografie')}</p>}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center text-sm text-gray-600 gap-2.5"><Phone className="w-4 h-4 text-gray-400 flex-shrink-0" /><span className="truncate">{profile.phone || <span className="text-gray-300 italic text-xs">{t('profile.not_provided', 'Nicht angegeben')}</span>}</span></div>
                  <div className="flex items-center text-sm text-gray-600 gap-2.5"><Hash className="w-4 h-4 text-gray-400 flex-shrink-0" /><span className="truncate">NEPH: {profile.neph_number || <span className="text-gray-300 italic text-xs">{t('profile.not_provided', 'Nicht angegeben')}</span>}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Settings & Privacy */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t('profile.settings', 'Einstellungen')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs font-medium text-gray-700 gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />{t('profile.public_profile', 'Öffentliches Profil')}
                </div>
                <Switch enabled={profile.is_public || false} setEnabled={handlePublicToggle} />
              </div>
              <div>
                <label className="flex items-center text-xs font-medium text-gray-700 mb-1.5 gap-2"><Languages className="w-4 h-4 text-gray-400" />{t('profile.language', 'Sprache')}</label>
                <div className="flex gap-1.5">
                  {(['de', 'en', 'fr'] as const).map(lang => (
                    <button key={lang} onClick={() => handleLanguageChange(lang)} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${(profile.preferred_language || i18n.language) === lang ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                      {lang === 'de' ? '🇩🇪 DE' : lang === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Contact & Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500" />{t('profile.contact_info', 'Kontakt & Adresse')}</h3>
              {editingSection !== 'contact' && <button onClick={() => setEditingSection('contact')} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>}
            </div>
            {editingSection === 'contact' ? (
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-3">
                <Controller name="address" control={control} render={({ field }) => <Input label={t('profile.field.address', 'Adresse')} registration={field} icon={<Home className="w-4 h-4 text-gray-400" />} />} />
                <div className="grid grid-cols-2 gap-3">
                  <Controller name="city" control={control} render={({ field }) => <Input label={t('profile.field.city', 'Stadt')} registration={field} icon={<Building className="w-4 h-4 text-gray-400" />} />} />
                  <Controller name="postal_code" control={control} rules={zipValidation} render={({ field, fieldState }) => <Input label={t('profile.field.postal_code', 'PLZ')} registration={field} error={fieldState.error?.message} icon={<MapPin className="w-4 h-4 text-gray-400" />} />} />
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('profile.field.region', 'Region')}</label><Controller name="region" control={control} render={({ field }) => <Select {...field} options={regions} placeholder={t('common.select_prompt', 'Bitte wählen')} className="react-select-container" classNamePrefix="react-select" />} /></div>
                <div className="flex gap-2 justify-end pt-1">
                  <Button variant="secondary" onClick={handleCancelEdit} type="button" className="px-3 py-1.5 text-xs"><X className="w-3.5 h-3.5 mr-1" /> {t('common.cancel', 'Abbrechen')}</Button>
                  <Button type="submit" isLoading={isProfileLoading} className="px-3 py-1.5 text-xs"><Check className="w-3.5 h-3.5 mr-1" /> {t('common.save', 'Speichern')}</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[{ label: t('profile.field.address', 'Adresse'), value: profile.address },{ label: t('profile.field.city', 'Stadt'), value: profile.city },{ label: t('profile.field.postal_code', 'PLZ'), value: profile.postal_code },{ label: t('profile.field.region', 'Region'), value: regions.find(r => r.value === profile.region)?.label }].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{item.label}</span>
                    <span className="text-base text-gray-800 font-medium">{item.value || <span className="text-gray-300 font-normal italic text-sm">{t('profile.not_provided', 'Nicht angegeben')}</span>}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Globe className="w-4 h-4 text-purple-500" />{t('profile.social_media', 'Soziale Netzwerke')}</h3>
              {editingSection !== 'social' && <button onClick={() => setEditingSection('social')} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>}
            </div>
            {editingSection === 'social' ? (
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-3">
                <SocialLinksInput control={control} fields={fields} append={append} remove={remove} />
                <div className="flex gap-2 justify-end pt-1">
                  <Button variant="secondary" onClick={handleCancelEdit} type="button" className="px-3 py-1.5 text-xs"><X className="w-3.5 h-3.5 mr-1" /> {t('common.cancel', 'Abbrechen')}</Button>
                  <Button type="submit" isLoading={isProfileLoading} className="px-3 py-1.5 text-xs"><Check className="w-3.5 h-3.5 mr-1" /> {t('common.save', 'Speichern')}</Button>
                </div>
              </form>
            ) : (
              <div>
                {profile.social_links && Object.keys(profile.social_links).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(profile.social_links).map(([platform, url]) => (
                      <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 rounded-xl group text-gray-700 hover:text-blue-600">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow text-blue-500"><Globe className="w-4 h-4" /></div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold capitalize">{platform}</span>
                          <span className="text-[10px] text-gray-400 truncate">{url as string}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-gray-100 border-dashed text-sm">{t('profile.no_social_links', 'Keine sozialen Netzwerke verlinkt.')}</p>
                )}
              </div>
            )}
          </div>

          {/* Security & 2FA */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-green-500" />{t('profile.privacy_security', 'Sicherheit & 2FA')}</h3>
            <div className="space-y-5">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-semibold text-gray-800 text-xs">{t('profile.change_password', 'Passwort ändern')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Controller name="newPassword" control={passwordControl} rules={{ minLength: { value: 6, message: t('profile.password_min_length', 'Min. 6 Zeichen') }}} render={({ field, fieldState }) => <PasswordInput label={t('auth.password', 'Passwort')} registration={field} error={fieldState.error?.message} />} />
                    {newPassword && <div className="mt-1.5"><PasswordStrengthIndicator strength={passwordStrengthValue} /></div>}
                  </div>
                  <Controller name="confirmPassword" control={passwordControl} rules={{ validate: value => !newPassword || value === newPassword || t('profile.password_mismatch', 'Passwörter stimmen nicht überein') }} render={({ field, fieldState }) => <PasswordInput label={t('profile.confirm_password', 'Passwort bestätigen')} registration={field} error={fieldState.error?.message} />} />
                </div>
                <div className="flex justify-end"><Button type="submit" isLoading={isPasswordLoading} disabled={!newPassword} className="text-xs px-3 py-1.5">{t('profile.update_password', 'Passwort aktualisieren')}</Button></div>
              </form>
              <div>
                <h4 className="font-semibold text-gray-800 text-xs mb-3">{t('profile.two_factor', 'Zwei-Faktor-Authentifizierung (2FA)')}</h4>
                <TwoFactorSetup />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-0.5"><AlertTriangle className="w-3.5 h-3.5" />{t('profile.danger_zone', 'Gefahrenzone')}</h4>
                <p className="text-[11px] text-red-600">{t('profile.delete_warning', 'Wenn Sie Ihr Konto löschen, werden alle Ihre Daten unwiderruflich entfernt.')}</p>
              </div>
              {!showDeleteConfirm && <Button variant="secondary" onClick={() => setShowDeleteConfirm(true)} className="text-red-700 bg-white border-red-200 hover:bg-red-50 whitespace-nowrap text-xs"><Trash2 className="w-3.5 h-3.5 mr-1.5" />{t('profile.delete_account', 'Konto löschen')}</Button>}
            </div>
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 py-4 bg-white">
                  <p className="text-xs font-medium text-gray-800 mb-2">{t('profile.delete_confirm_text', 'Geben Sie DELETE ein, um die Löschung zu bestätigen:')}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" className="flex-1 px-3 py-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-center sm:text-left shadow-sm outline-none" />
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} className="flex-1 sm:flex-none text-xs">{t('common.cancel', 'Abbrechen')}</Button>
                      <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE' || isDeleting} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-white text-xs transition-colors shadow-sm ${deleteConfirmText === 'DELETE' && !isDeleting ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}>
                        {isDeleting ? t('profile.deleting', 'Löschen...') : t('profile.delete_permanently', 'Unwiderruflich löschen')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardProfile;
