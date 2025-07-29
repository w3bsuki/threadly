'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/ui/avatar';
import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Camera, User } from 'lucide-react';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

interface SellerProfileData {
  displayName: string;
  bio: string;
  profilePhoto: string;
}

interface SellerProfileFormProps {
  data: SellerProfileData;
  onUpdate: (data: SellerProfileData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SellerProfileForm({
  data,
  onUpdate,
  onNext,
  onBack,
}: SellerProfileFormProps) {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onNext();
  };

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Create Your Seller Profile</CardTitle>
          <CardDescription>
            Help buyers get to know you. A complete profile builds trust and
            increases sales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.profilePhoto} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  className="absolute right-0 bottom-0 rounded-[var(--radius-full)]"
                  onClick={() => {
                    // TODO: Implement photo upload
                  }}
                  size="icon"
                  type="button"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Your shop name"
                required
                value={formData.displayName}
              />
              <p className="text-muted-foreground text-sm">
                This is how buyers will see you on Threadly
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                maxLength={500}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell buyers about yourself, your style, what you sell..."
                rows={4}
                value={formData.bio}
              />
              <p className="text-muted-foreground text-sm">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div className="flex justify-between">
              <Button onClick={onBack} type="button" variant="outline">
                Back
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
