'use client';

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
} from '@repo/ui/components';
import { Bell, BellOff, Save } from 'lucide-react';
import { useState } from 'react';

interface SearchFilters {
  query?: string;
  categories?: string[];
  brands?: string[];
  conditions?: ('NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR')[];
  sizes?: string[];
  colors?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?:
    | 'relevance'
    | 'price_asc'
    | 'price_desc'
    | 'newest'
    | 'most_viewed'
    | 'most_favorited';
  [key: string]: string | number | boolean | string[] | undefined;
}

interface SavedSearchDialogProps {
  query: string;
  filters?: SearchFilters;
  onSave?: () => void;
}

export function SavedSearchDialog({
  query,
  filters,
  onSave,
}: SavedSearchDialogProps): React.JSX.Element {
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
      toast.error(
        error instanceof Error ? error.message : 'Failed to save search'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Save this search to quickly access it later and get alerts for new
            matches
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Search Name</Label>
            <Input
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vintage Denim Jackets"
              value={name}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base" htmlFor="alerts">
                Enable Alerts
              </Label>
              <p className="text-muted-foreground text-sm">
                Get notified when new items match this search
              </p>
            </div>
            <Switch
              checked={alertEnabled}
              id="alerts"
              onCheckedChange={setAlertEnabled}
            />
          </div>

          <div className="space-y-1 rounded-[var(--radius-lg)] bg-muted p-3">
            <p className="font-medium text-sm">Search Details</p>
            <p className="text-muted-foreground text-xs">Query: "{query}"</p>
            {filters && Object.keys(filters).length > 0 && (
              <p className="text-muted-foreground text-xs">
                Filters:{' '}
                {Object.entries(filters)
                  .filter(
                    ([_, value]) =>
                      value && (Array.isArray(value) ? value.length > 0 : true)
                  )
                  .map(
                    ([key, value]) =>
                      `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
                  )
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                {alertEnabled ? (
                  <Bell className="mr-2 h-4 w-4" />
                ) : (
                  <BellOff className="mr-2 h-4 w-4" />
                )}
                Save Search
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
