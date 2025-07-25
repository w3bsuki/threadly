'use client';

import { useState } from 'react';
import { Save, Bell, BellOff } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Switch,
  toast,
} from '@repo/design-system/components';

interface SearchFilters {
  query?: string;
  categories?: string[];
  brands?: string[];
  conditions?: ('NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR')[];
  sizes?: string[];
  colors?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed' | 'most_favorited';
  [key: string]: string | number | boolean | string[] | undefined;
}

interface SavedSearchDialogProps {
  query: string;
  filters?: SearchFilters;
  onSave?: () => void;
}

export function SavedSearchDialog({ query, filters, onSave }: SavedSearchDialogProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(query);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for your saved search');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          query,
          filters,
          alertEnabled,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save search');
      }

      toast.success('Search saved successfully');
      setOpen(false);
      onSave?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save search');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Save this search to quickly access it later and get alerts for new matches
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Search Name</Label>
            <Input
              id="name"
              placeholder="e.g., Vintage Denim Jackets"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts" className="text-base">
                Enable Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new items match this search
              </p>
            </div>
            <Switch
              id="alerts"
              checked={alertEnabled}
              onCheckedChange={setAlertEnabled}
            />
          </div>

          <div className="rounded-[var(--radius-lg)] bg-muted p-3 space-y-1">
            <p className="text-sm font-medium">Search Details</p>
            <p className="text-xs text-muted-foreground">Query: "{query}"</p>
            {filters && Object.keys(filters).length > 0 && (
              <p className="text-xs text-muted-foreground">
                Filters: {Object.entries(filters)
                  .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
                  .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (
              <>
                {alertEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                Save Search
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}