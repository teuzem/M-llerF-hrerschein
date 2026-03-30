import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { supabase, LicenseType, Testimonial } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { Star, User, Mail, Car, Bike, Truck, Bus, Tractor, FileText } from 'lucide-react';
import AdvancedMediaUploader from './AdvancedMediaUploader';

interface TestimonialFormProps {
  onFormSubmit: () => void;
  licenseTypes: LicenseType[];
  existingTestimonial?: Testimonial | null;
}

type FormValues = {
  author_name: string;
  author_email: string;
  content: string;
  media: (File | string)[];
  licenses: { value: string; label: string }[];
};

const TestimonialForm: React.FC<TestimonialFormProps> = ({ onFormSubmit, licenseTypes, existingTestimonial }) => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(existingTestimonial?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const getCategoryIcon = (category: string) => {
    const cat = category.toUpperCase();
    if (cat.includes('A')) return <Bike className="w-4 h-4 mr-2 text-gray-500" />;
    if (cat.includes('B')) return <Car className="w-4 h-4 mr-2 text-gray-500" />;
    if (cat.includes('C')) return <Truck className="w-4 h-4 mr-2 text-gray-500" />;
    if (cat.includes('D')) return <Bus className="w-4 h-4 mr-2 text-gray-500" />;
    if (cat.includes('T') || cat.includes('L')) return <Tractor className="w-4 h-4 mr-2 text-gray-500" />;
    return <FileText className="w-4 h-4 mr-2 text-gray-500" />;
  };

  const licenseOptions = licenseTypes.map(lt => ({
    value: lt.id,
    label: `${t('common.application')} ${lt.category} - ${lt.name_de}`,
    category: lt.category
  }));

  const formatOptionLabel = ({ label, category }: { label: string, category: string }) => (
    <div className="flex items-center">
      {getCategoryIcon(category)}
      <span>{label}</span>
    </div>
  );

  const { control, register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (existingTestimonial) {
      const initialMedia = existingTestimonial.media_urls || [];
      const initialLicenses = licenseTypes
        .filter(lt => existingTestimonial.license_type_ids?.includes(lt.id))
        .map(lt => ({ value: lt.id, label: `${t('common.application')} ${lt.category} - ${lt.name_de}`, category: lt.category }));

      reset({
        author_name: existingTestimonial.author_name,
        content: existingTestimonial.content,
        media: initialMedia,
        licenses: initialLicenses,
      });
      setRating(existingTestimonial.rating);
    } else {
      reset({
        author_name: profile?.full_name || '',
        author_email: user?.email || '',
        media: [],
        licenses: [],
      });
    }
  }, [existingTestimonial, profile, user, reset, licenseTypes]);

  const onSubmit = async (data: FormValues) => {
    if (rating === 0) {
      toast.error(t('testimonials.form.rating_required'));
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('content', data.content);
      
      if (existingTestimonial) {
        formData.append('testimonial_id', existingTestimonial.id);
      }

      data.licenses.forEach(license => formData.append('license_type_ids[]', license.value));

      if (user && profile) {
        formData.append('user_id', user.id);
        formData.append('author_name', profile.full_name || '');
        formData.append('city', profile.city || '');
        formData.append('region', profile.region || '');
      } else {
        formData.append('author_name', data.author_name);
        formData.append('author_email', data.author_email);
      }

      // Handle media files and URLs
      const mediaFiles: File[] = [];
      const mediaUrls: string[] = [];
      const existingMediaUrls: string[] = [];

      (data.media || []).forEach(item => {
        if (typeof item === 'string') {
          // This is an existing URL from an update
          existingMediaUrls.push(item);
        } else if (item instanceof File) {
          if (item.type.includes('external')) {
            mediaUrls.push(item.name);
          } else {
            mediaFiles.push(item);
          }
        }
      });

      mediaFiles.forEach(file => formData.append('media_files[]', file, file.name));
      mediaUrls.forEach(url => formData.append('media_urls_input[]', url));
      existingMediaUrls.forEach(url => formData.append('existing_media_urls[]', url));

      const { data: response, error } = await supabase.functions.invoke('submit-testimonial', {
        body: formData,
      });

      if (error || response.error) throw new Error(error?.message || response?.error);
      
      toast.success(existingTestimonial ? t('dashboard.testimonials.update_success') : t('testimonials.form.success'));
      onFormSubmit();
    } catch (error: any) {
      toast.error(error.message || t('testimonials.form.submit_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{existingTestimonial ? t('dashboard.testimonials.edit_modal_title') : t('testimonials.form.title')}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input {...register('author_name', { required: !user })} placeholder={t('testimonials.form.name')} disabled={!!user} className="w-full pl-10 p-2 border border-gray-300 rounded-lg" />
          </div>
          {!user && !existingTestimonial && (
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" {...register('author_email', { required: !user })} placeholder={t('testimonials.form.email')} className="w-full pl-10 p-2 border border-gray-300 rounded-lg" />
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('testimonials.form.rating')}</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-8 h-8 cursor-pointer" fill={(hoverRating || rating) >= star ? '#FFC107' : '#E0E0E0'} strokeWidth={0} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('testimonials.form.licenses')}</label>
            <Controller
              name="licenses"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={licenseOptions}
                  formatOptionLabel={formatOptionLabel as any}
                  placeholder={t('form.select_placeholder')}
                  classNamePrefix="react-select"
                />
              )}
            />
          </div>
        </div>

        <textarea {...register('content', { required: true })} rows={4} placeholder={t('testimonials.form.review')} className="w-full p-2 border border-gray-300 rounded-lg"></textarea>
        
        <Controller
          name="media"
          control={control}
          render={({ field }) => (
            <AdvancedMediaUploader
              label={t('testimonials.form.media')}
              files={(field.value || []).map(f => typeof f === 'string' ? new File([], f, { type: 'image/external' }) : f)}
              onFilesChange={(files) => {
                const updatedFiles = files.map(f => f.type.includes('external') ? f.name : f);
                field.onChange(updatedFiles);
              }}
            />
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={onFormSubmit}>{t('common.cancel')}</Button>
          <Button type="submit" isLoading={isLoading}>{t('common.save')}</Button>
        </div>
      </form>
    </div>
  );
};

export default TestimonialForm;
