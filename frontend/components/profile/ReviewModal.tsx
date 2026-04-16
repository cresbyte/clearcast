"use client";

import { submitReview } from '@/api/reviewApi';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';



interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onReviewSubmitted: () => void;
}

const ReviewModal = ({ isOpen, onClose, product, onReviewSubmitted }: ReviewModalProps) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!product) return;

        try {
            setLoading(true);
            await submitReview({
                product: product.id,
                rating,
                comment
            });
            toast.success('Review submitted successfully!');
            onReviewSubmitted();
            onClose();
            // Reset form
            setRating(5);
            setComment('');
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            toast.error(error.response?.data?.detail || 'Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>
                        Share your thoughts about {product?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium">Your Rating</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="comment" className="text-sm font-medium">
                            Your Review
                        </label>
                        <Textarea
                            id="comment"
                            placeholder="What did you like or dislike? How was the quality?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;
