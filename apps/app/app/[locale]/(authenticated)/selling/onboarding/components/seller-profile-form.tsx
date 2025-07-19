'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Camera, User } from 'lucide-react';
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

export function SellerProfileForm({ data, onUpdate, onNext, onBack }: SellerProfileFormProps) {
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
          Help buyers get to know you. A complete profile builds trust and increases sales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.profilePhoto} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-[var(--radius-full)]"
                onClick={() => {
                  // TODO: Implement photo upload
                }}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your shop name"
              required
            />
            <p className="text-sm text-muted-foreground">
              This is how buyers will see you on Threadly
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About You</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell buyers about yourself, your style, what you sell..."
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
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