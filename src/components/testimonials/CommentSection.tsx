import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase, TestimonialComment } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface CommentSectionProps {
  testimonialId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ testimonialId }) => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<TestimonialComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm<{ content: string }>();

  useEffect(() => {
    const fetchComments = async () => {
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

  const onCommentSubmit = async (data: { content: string }) => {
    if (!user) {
      toast.error(t('testimonials.social.login_required_comment'));
      return;
    }
    const { data: newComment, error } = await supabase
      .from('testimonial_comments')
      .insert({ testimonial_id: testimonialId, user_id: user.id, content: data.content })
      .select('*, profile:profiles(full_name, avatar_url)')
      .single();

    if (error) {
      toast.error(t('testimonials.form.submit_error'));
    } else {
      setComments(prev => [...prev, newComment as any]);
      reset();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      {loading ? <p>{t('testimonials.comments.loading')}</p> : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Avatar name={comment.profile?.full_name || 'U'} avatarUrl={comment.profile?.avatar_url} size="sm" />
              <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold text-sm">{comment.profile?.full_name}</p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {user && (
        <form onSubmit={handleSubmit(onCommentSubmit)} className="mt-4 flex items-start space-x-3">
          <Avatar name={profile?.full_name || 'U'} avatarUrl={profile?.avatar_url} size="sm" />
          <div className="flex-1">
            <textarea {...register('content', { required: true })} rows={1} placeholder={t('comments.placeholder')} className="w-full p-2 border border-gray-300 rounded-lg text-sm"></textarea>
            <Button type="submit" className="mt-2 text-xs px-3 py-1">{t('testimonials.comments.submit')}</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
