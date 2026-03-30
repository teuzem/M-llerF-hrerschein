import React from 'react';
import { motion } from 'framer-motion';
import { Profile } from '../../lib/supabase';
import Avatar from '../ui/Avatar';

interface MentionSuggestionsProps {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
  selectedIndex: number;
}

const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({ profiles, onSelect, selectedIndex }) => {
  if (profiles.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full mb-2 w-full bg-white shadow-lg rounded-lg border p-2 z-20 max-h-60 overflow-y-auto"
    >
      <ul>
        {profiles.map((p, index) => (
          <li
            key={p.id}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(p);
            }}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
              index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
          >
            <Avatar name={p.full_name || ''} avatarUrl={p.avatar_url} size="sm" />
            <span className="font-medium">{p.full_name}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default MentionSuggestions;
