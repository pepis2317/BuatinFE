export type ReviewResponse = {
  processId: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  authorPfp: string;
  review: string;
  likes: number;
  liked: boolean;
  createdAt: string; // ISO date string (from DateTimeOffset)
  updatedAt: string | null;
  comments: number;
  rating: number ;
};