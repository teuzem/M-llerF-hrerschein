import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Transition, Dialog } from '@headlessui/react';
import { supabase, GalleryComment } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { X, Send, Heart } from 'lucide-react';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';

interface CommentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: string;
  onCommentPosted: () => void;
}

type CommentWithLikes = GalleryComment & {
  gallery_comment_likes: { count: number }[];
  user_has_liked: boolean;
};

const CommentSidebar: React.FC<CommentSidebarProps> = ({ isOpen, onClose, mediaId, onCommentPosted }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<CommentWithLikes[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ content: string }>();

  useEffect(() => {
    if (isOpen) {
      const fetchComments = async () => {
        setLoading(true);
        let query = supabase
          .from('gallery_comments')
          .select('*, profiles(*), gallery_comment_likes(count)')
          .eq('media_id', mediaId)
          .order('created_at', { ascending: true });

        const { data, error } = await query;

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }

        let commentsData = data as any[];

        if (user) {
          const commentIds = commentsData.map(c => c.id);
          const { data: userLikes, error: likesError } = await supabase
            .from('gallery_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id)
            .in('comment_id', commentIds);

          if (likesError) console.error('Fehler beim Laden der Kommentar-Likes', likesError);

          const userLikedIds = new Set(userLikes?.map(l => l.comment_id));
          commentsData = commentsData.map(c => ({
            ...c,
            user_has_liked: userLikedIds.has(c.id)
          }));
        }

        setComments(commentsData);
        setLoading(false);
      };
      fetchComments();
    }
  }, [isOpen, mediaId, user]);

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return;
    
    setComments(prev => prev.map(c => c.id === commentId ? {
      ...c,
      user_has_liked: !isLiked,
      gallery_comment_likes: [{ count: (c.gallery_comment_likes[0]?.count || 0) + (!isLiked ? 1 : -1) }]
    } : c));

    if (isLiked) {
      await supabase.from('gallery_comment_likes').delete().match({ comment_id: commentId, user_id: user.id });
    } else {
      await supabase.from('gallery_comment_likes').insert({ comment_id: commentId, user_id: user.id });
    }
  };

  const onCommentSubmit = async (data: { content: string }) => {
    if (!user) return;
    const { data: newCommentData, error } = await supabase
      .from('gallery_comments')
      .insert({ media_id: mediaId, user_id: user.id, content: data.content })
      .select('*, profiles(*), gallery_comment_likes(count)')
      .single();
    
    if (error) {
      toast.error(error.message);
    } else {
      setComments(prev => [...prev, { ...newCommentData, user_has_liked: false } as any]);
      reset();
      onCommentPosted();
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={React.Fragment} enter="ease-in-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-500" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child as={React.Fragment} enter="transform transition ease-in-out duration-500 sm:duration-700" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="bg-blue-700 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-white">Kommentare</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button type="button" className="relative rounded-md bg-blue-700 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white" onClick={onClose}><X className="h-6 w-6" /></button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-4 sm:px-6">
                      {loading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                        : comments.length > 0 ? (
                          <ul className="space-y-4 py-6">
                            {comments.map(comment => (
                              <li key={comment.id} className="flex gap-3">
                                <Avatar name={comment.profiles?.full_name || ''} avatarUrl={comment.profiles?.avatar_url} size="sm" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold">{comment.profiles?.full_name}</p>
                                  <p className="text-sm text-gray-700">{comment.content}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                                    <button onClick={() => handleLikeComment(comment.id, comment.user_has_liked)} className="flex items-center gap-1 hover:text-red-500">
                                      <Heart className={`w-3 h-3 ${comment.user_has_liked ? 'text-red-500 fill-current' : ''}`} />
                                      <span>{comment.gallery_comment_likes[0]?.count || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-center text-gray-500 py-10">Noch keine Kommentare.</p>
                        )}
                    </div>
                    <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                      {user ? (
                        <form onSubmit={handleSubmit(onCommentSubmit)} className="flex items-start gap-3">
                          <Avatar name={profile?.full_name || ''} avatarUrl={profile?.avatar_url} size="sm" />
                          <textarea {...register('content', { required: true })} placeholder="Kommentar hinzufügen..." rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                          <Button type="submit" isLoading={isSubmitting} className="p-2 aspect-square"><Send className="w-5 h-5" /></Button>
                        </form>
                      ) : (
                        <p className="text-center text-sm text-gray-500">Melden Sie sich an zum Kommentieren.</p>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CommentSidebar;
