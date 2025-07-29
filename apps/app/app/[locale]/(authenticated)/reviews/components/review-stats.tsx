import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from '@repo/ui/components';
import { Award, Star, TrendingUp, Users } from 'lucide-react';

interface ReviewStatsProps {
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    recentReviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      reviewer: {
        firstName: string | null;
        lastName: string | null;
      };
    }>;
  };
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(stats.ratingDistribution));

  return (
    <div className="grid gap-4 md:gap-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="mt-1 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  className={`h-3 w-3 ${
                    i < Math.round(stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                  key={i}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalReviews}</div>
            <p className="text-muted-foreground text-xs">
              From verified purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              5-Star Reviews
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {stats.totalReviews > 0
                ? Math.round(
                    (stats.ratingDistribution[5] / stats.totalReviews) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.ratingDistribution[5]} excellent ratings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              stats.ratingDistribution[
                rating as keyof typeof stats.ratingDistribution
              ];
            const percentage =
              stats.totalReviews > 0
                ? Math.round((count / stats.totalReviews) * 100)
                : 0;

            return (
              <div className="flex items-center gap-3" key={rating}>
                <div className="flex w-20 items-center gap-1">
                  <span className="font-medium text-sm">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <Progress
                    className="h-2"
                    value={maxCount > 0 ? (count / maxCount) * 100 : 0}
                  />
                </div>
                <div className="w-20 text-right text-muted-foreground text-sm">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Reviews Preview */}
      {stats.recentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div className="space-y-1" key={review.id}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {[review.reviewer.firstName, review.reviewer.lastName]
                      .filter(Boolean)
                      .join(' ') || 'Anonymous'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                        key={i}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
