import { Edit, Star, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Review {
    id: string;
    user_id: string;
    equipment_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_name?: string;
    helpful_count?: number;
    avatar_url?: string;
    email?: string;
}

interface ProductReviewsProps {
    equipmentId?: string;
    onRatingUpdate?: (newRating: number, reviewCount: number) => void;
}

export function ProductReviews({ equipmentId, onRatingUpdate }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [helpfulMarked, setHelpfulMarked] = useState<Record<string, boolean>>({});
    const [editMode, setEditMode] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (equipmentId) {
            fetchReviews();
        }
    }, [equipmentId]);

    const fetchReviews = async () => {
        if (!equipmentId) return;

        try {
            setLoading(true);

            // Fetch reviews for this equipment
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .eq('equipment_id', equipmentId)
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            // If we have reviews, fetch the user info separately
            if (reviewsData && reviewsData.length > 0) {
                // Get unique user IDs
                const userIds = [...new Set(reviewsData.map(review => review.user_id))];

                // Fetch user info
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('id, email, full_name, avatar_url')
                    .in('id', userIds);

                if (usersError) throw usersError;

                // Create a map of user info
                const userMap = (usersData || []).reduce((map, user) => {
                    map[user.id] = user;
                    return map;
                }, {} as Record<string, any>);

                // Process reviews to include user name and avatar
                const processedReviews = reviewsData.map(review => {
                    const userData = userMap[review.user_id];
                    return {
                        ...review,
                        user_name: userData?.full_name || userData?.email?.split('@')[0] || 'Người dùng ẩn danh',
                        email: userData?.email,
                        avatar_url: userData?.avatar_url,
                        helpful_count: review.helpful_count || 0
                    };
                });

                setReviews(processedReviews);

                // Check if current user has already submitted a review
                if (user) {
                    const userReview = processedReviews.find(r => r.user_id === user.id);
                    if (userReview) {
                        setUserReview(userReview);
                        setRating(userReview.rating);
                        setComment(userReview.comment);
                    }
                }

                // Calculate and update average rating if callback provided
                if (onRatingUpdate && processedReviews.length > 0) {
                    const totalRating = processedReviews.reduce((sum, review) => sum + review.rating, 0);
                    const avgRating = totalRating / processedReviews.length;
                    onRatingUpdate(parseFloat(avgRating.toFixed(1)), processedReviews.length);
                }
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Không thể tải đánh giá. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá sản phẩm');
            return;
        }

        if (!equipmentId) {
            toast.error('Không tìm thấy thông tin sản phẩm');
            return;
        }

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        try {
            setSubmitting(true);

            if (userReview) {
                // Update existing review
                const { error } = await supabase
                    .from('reviews')
                    .update({
                        rating,
                        comment,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userReview.id);

                if (error) throw error;
                toast.success('Cập nhật đánh giá thành công');
                setEditMode(false);
            } else {
                // Create new review
                const { error } = await supabase
                    .from('reviews')
                    .insert({
                        equipment_id: equipmentId,
                        user_id: user.id,
                        rating,
                        comment,
                        helpful_count: 0
                    });

                if (error) throw error;
                toast.success('Đã gửi đánh giá thành công');
            }

            // Refresh reviews
            fetchReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkHelpful = async (reviewId: string) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh dấu đánh giá hữu ích');
            return;
        }

        if (helpfulMarked[reviewId]) {
            return; // Already marked as helpful
        }

        try {
            // Update helpful count in the review
            const { error } = await supabase.rpc('increment_helpful_count', {
                review_id: reviewId
            });

            if (error) throw error;

            // Update local state
            setHelpfulMarked(prev => ({ ...prev, [reviewId]: true }));

            // Update the reviews list
            setReviews(prev =>
                prev.map(review =>
                    review.id === reviewId
                        ? { ...review, helpful_count: (review.helpful_count || 0) + 1 }
                        : review
                )
            );

            toast.success('Cảm ơn bạn đã đánh giá');
        } catch (error) {
            console.error('Error marking review as helpful:', error);
            toast.error('Không thể đánh dấu đánh giá. Vui lòng thử lại sau.');
        }
    };

    // Function to get initials from user name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleEditReview = () => {
        if (userReview) {
            setEditMode(true);
            setRating(userReview.rating);
            setComment(userReview.comment);
        }
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        if (userReview) {
            setRating(userReview.rating);
            setComment(userReview.comment);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Đánh giá sản phẩm</h2>

            {/* User review form */}
            {user && !userReview && (
                <div className="mb-8 border-b pb-6">
                    <h3 className="font-medium mb-4">Đánh giá của bạn</h3>

                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer ${(hoverRating || rating) >= star
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                            <span className="ml-2 text-gray-600">
                                {rating > 0 ? `${rating}/5` : 'Chọn đánh giá'}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                        />
                    </div>

                    <button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            )}

            {/* Edit review form */}
            {user && userReview && editMode && (
                <div className="mb-8 border-b pb-6">
                    <h3 className="font-medium mb-4">Chỉnh sửa đánh giá</h3>

                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer ${(hoverRating || rating) >= star
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                            <span className="ml-2 text-gray-600">
                                {rating > 0 ? `${rating}/5` : 'Chọn đánh giá'}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmitReview}
                            disabled={submitting}
                            className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Đang cập nhật...' : 'Cập nhật đánh giá'}
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Reviews list */}
            <div>
                <h3 className="font-medium mb-4">Tất cả đánh giá ({reviews.length})</h3>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="flex gap-3">
                            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-16 bg-gray-200 rounded w-full"></div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-16 bg-gray-200 rounded w-full"></div>
                            </div>
                        </div>
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b pb-4">
                                <div className="flex gap-3">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {review.avatar_url ? (
                                            <img
                                                src={review.avatar_url}
                                                alt={review.user_name}
                                                className="h-12 w-12 rounded-full object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-medium border border-orange-200">
                                                {getInitials(review.user_name || '')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Review content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{review.user_name}</p>
                                                <div className="flex items-center mt-1">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Edit button (only for user's own review) */}
                                            {user && review.user_id === user.id && !editMode && (
                                                <button
                                                    onClick={handleEditReview}
                                                    className="text-gray-500 hover:text-orange-500 p-1"
                                                    title="Chỉnh sửa đánh giá"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <p className="mt-2 text-gray-700">{review.comment}</p>

                                        <div className="mt-3 flex items-center">
                                            <button
                                                onClick={() => handleMarkHelpful(review.id)}
                                                disabled={helpfulMarked[review.id] || review.user_id === user?.id}
                                                className={`flex items-center text-sm ${helpfulMarked[review.id] || review.user_id === user?.id
                                                    ? 'text-gray-400 cursor-default'
                                                    : 'text-gray-600 hover:text-orange-500'
                                                    }`}
                                            >
                                                <ThumbsUp className="h-4 w-4 mr-1" />
                                                Hữu ích ({review.helpful_count})
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!user && (
                    <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-center text-orange-700">
                            Vui lòng <a href="/signin" className="font-medium underline">đăng nhập</a> để đánh giá sản phẩm
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 