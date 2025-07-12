'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useUser } from '@repo/auth/client';

interface FollowButtonProps {
  userId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function FollowButton({ userId, className, size = 'sm' }: FollowButtonProps): React.JSX.Element | null {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/users/${userId}/follow`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.data?.isFollowing || false);
        }
      } catch (error) {
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [userId, user?.id]);

  const handleFollowToggle = async () => {
    if (!user?.id || isLoading) return;

    setIsLoading(true);
    
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsFollowing(!isFollowing);
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for self
  if (user?.id === userId) {
    return null;
  }

  if (isCheckingStatus) {
    return (
      <Button size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={className}
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'default'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}