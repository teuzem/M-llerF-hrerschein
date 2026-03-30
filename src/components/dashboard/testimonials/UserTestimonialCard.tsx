import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Testimonial } from '../../../lib/supabase';
import { Star, Edit, Trash2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardCommentSection from './DashboardCommentSection';

interface UserTestimonialCardProps {
  testimonial: Testimonial & { comments?: { count: number }[] };
  onDelete: (id: string) => void;
  onEdit: (testimonial: Testimonial) => void;
}

const StatusBadge: React.FC<{ status: Testimonial['status'] }> = ({ status }) => {
  const statusMap = {
    approved: { label: 'Veröffentlicht', color: 'green' },
    pending: { label: 'Ausstehend', color: 'yellow' },
    rejected: { label: 'Abgelehnt', color: 'red' },
  };

  const { label, color } = statusMap[status];
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  };

  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color]}`}>{label}</span>;
};

const UserTestimonialCard: React.FC<UserTestimonialCardProps> = ({ testimonial, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const totalReactions = Object.values(testimonial.reactions || {}).reduce((a, b) => a + b, 0);
  const commentCount = testimonial.comments?.[0]?.count || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <StatusBadge status={testimonial.status} />
          <div className="flex items-center mt-2 sm:mt-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4" fill={i < testimonial.rating ? '#FFC107' : '#E0E0E0'} strokeWidth={0} />
            ))}
          </div>
        </div>
        <p className="text-gray-600 italic text-sm line-clamp-2">"{testimonial.content}"</p>
        <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
          <span>{new Date(testimonial.created_at).toLocaleDateString('de-DE')}</span>
          <div className="flex items-center space-x-4">
            <span>{totalReactions} Reaktionen</span>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 text-gray-500 hover:text-german-red">
              <MessageCircle className="w-3 h-3" />
              <span>{commentCount} Kommentar(e)</span>
              {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-end space-x-2 border-t">
        <button onClick={() => onEdit(testimonial)} className="p-2 text-gray-500 hover:text-german-red hover:bg-blue-50 rounded-full" title="Bearbeiten">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(testimonial.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Löschen">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {showComments && <DashboardCommentSection testimonialId={testimonial.id} />}
    </div>
  );
};

export default UserTestimonialCard;
