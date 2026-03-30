import React from 'react';
import { supabase } from '../../lib/supabase';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 'md' }) => {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (avatarUrl) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrl);
      setUrl(data.publicUrl);
    } else {
      setUrl(null);
    }
  }, [avatarUrl]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center font-bold text-white`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
