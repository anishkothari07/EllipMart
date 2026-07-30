import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';
import { CreateReviewInput, UpdateReviewInput } from './review.dto';

export class ReviewService {
  private async updateProductRating(productId: string) {
    const agg = await prisma.review.aggregate({
      where: { productId, isActive: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAverage: agg._avg.rating || 0,
        reviewCount: agg._count.id || 0,
      }
    });
  }

  async getReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [total, reviews] = await prisma.$transaction([
      prisma.review.count({ where: { productId, isActive: true } }),
      prisma.review.findMany({
        where: { productId, isActive: true },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
        skip,
        take: limit,
        orderBy: [{ helpfulVotes: 'desc' }, { createdAt: 'desc' }],
      })
    ]);

    // Calculate breakdown
    const breakdown = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId, isActive: true },
      _count: { id: true }
    });

    return {
      reviews,
      breakdown,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async createReview(userId: string, data: CreateReviewInput) {
    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: { productId: data.productId, userId }
      }
    });

    if (existing) {
      throw new AppError('You have already reviewed this product', 400);
    }

    // Check if user purchased the product (simplified check via Orders - assume OrderItem has productId)
    // For now, we just mock the verified status, or check orders if Order schema was complete for Sprint 4.
    // In Sprint 4, Orders are Sprint 6, so we default to false or true.
    const isVerified = false; 

    const review = await prisma.review.create({
      data: {
        ...data,
        userId,
        isVerified,
      }
    });

    await this.updateProductRating(data.productId);
    return review;
  }

  async updateReview(userId: string, id: string, data: UpdateReviewInput) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== userId) throw new AppError('Forbidden', 403);

    const updated = await prisma.review.update({
      where: { id },
      data,
    });

    await this.updateProductRating(review.productId);
    return updated;
  }

  async deleteReview(userId: string, id: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== userId) throw new AppError('Forbidden', 403);

    await prisma.review.delete({ where: { id } });
    await this.updateProductRating(review.productId);
  }

  async markHelpful(id: string) {
    const review = await prisma.review.update({
      where: { id },
      data: { helpfulVotes: { increment: 1 } }
    });
    return review;
  }
}

export const reviewService = new ReviewService();
