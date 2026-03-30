import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, TestimonialComment } from '../../../lib/supabase';
import Avatar from '../../ui/Avatar';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface DashboardCommentSectionProps {
  testimonialId: string;
}

const DashboardCommentSection: React.FC<DashboardCommentSectionProps> = ({ testimonialId }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<TestimonialComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonial_comments')
        .select('*, profile:profiles(full_name, avatar_url)')
        .eq('testimonial_id', testimonialId)
        .order('created_at', { ascending: true });
      
      if (error) console.error('Error fetching comments:', error);
      else setComments(data as any);
      setLoading(false);
    };
    fetchComments();
  }, [testimonialId]);

  return (
    <div className="pt-2 pb-4 px-4 bg-gray-50">
      <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Kommentare</h4>
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start space-x-2">
              <Avatar name={comment.profile?.full_name || 'U'} avatarUrl={comment.profile?.avatar_url} size="sm" />
              <div className="flex-1 bg-white p-2 rounded-md border text-xs">
                <p className="font-semibold text-gray-800">{comment.profile?.full_name}</p>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center p-4">Keine Kommentare für diese Bewertung.</p>
      )}
    </div>
  );
};

export default DashboardCommentSection;
