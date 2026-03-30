import React from 'react';
import { useTranslation } from 'react-i18next';
import { Control, useFieldArray, Controller } from 'react-hook-form';
import { Link as LinkIcon, Trash2, PlusCircle, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Button from '../ui/Button';

interface SocialLinksInputProps {
  control: Control<any>;
  fields: any[];
  append: (obj: any) => void;
  remove: (index: number) => void;
}

const socialIcons: { [key: string]: React.ReactNode } = {
  facebook: <Facebook className="w-5 h-5 text-german-red" />,
  twitter: <Twitter className="w-5 h-5 text-sky-500" />,
  instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  linkedin: <Linkedin className="w-5 h-5 text-german-gold" />,
  default: <LinkIcon className="w-5 h-5 text-gray-400" />,
};

const getSocialIcon = (url: string) => {
  if (url.includes('facebook.com')) return socialIcons.facebook;
  if (url.includes('twitter.com') || url.includes('x.com')) return socialIcons.twitter;
  if (url.includes('instagram.com')) return socialIcons.instagram;
  if (url.includes('linkedin.com')) return socialIcons.linkedin;
  return socialIcons.default;
};

const SocialLinksInput: React.FC<SocialLinksInputProps> = ({ control, fields, append, remove }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {getSocialIcon((control as any)._getWatch(`social_links.${index}.url`) || '')}
            </div>
            <Controller
              name={`social_links.${index}.url`}
              control={control}
              defaultValue={field.url}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="https://..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                />
              )}
            />
          </div>
          <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ platform: 'other', url: '' })}
        className="text-sm"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Social Media Link hinzufügen
      </Button>
    </div>
  );
};

export default SocialLinksInput;
