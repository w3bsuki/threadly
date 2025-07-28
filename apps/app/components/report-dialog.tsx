'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  toast,
} from '@repo/design-system/components';
import { Flag } from 'lucide-react';
import { useState } from 'react';

interface ReportDialogProps {
  type: 'PRODUCT' | 'USER';
  targetId: string;
  targetName: string;
  children?: React.ReactNode;
}

const REPORT_REASONS = {
  PRODUCT: [
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'counterfeit', label: 'Counterfeit or fake item' },
    { value: 'misleading', label: 'Misleading description or photos' },
    { value: 'prohibited', label: 'Prohibited item' },
    { value: 'pricing', label: 'Suspicious pricing or scam' },
    { value: 'other', label: 'Other' },
  ],
  USER: [
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'spam', label: 'Spam or advertising' },
    { value: 'impersonation', label: 'Impersonation' },
    { value: 'fraud', label: 'Fraudulent activity' },
    { value: 'inappropriate', label: 'Inappropriate behavior' },
    { value: 'other', label: 'Other' },
  ],
};

export function ReportDialog({
  type,
  targetId,
  targetName,
  children,
}: ReportDialogProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId,
          reason,
          description,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit report');

      toast.success('Report submitted successfully');
      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons = REPORT_REASONS[type];

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {children || (
          <Button className="text-destructive" size="sm" variant="ghost">
            <Flag className="mr-2 h-4 w-4" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Report {type === 'PRODUCT' ? 'Product' : 'User'}
          </DialogTitle>
          <DialogDescription>
            Help us understand why you're reporting {targetName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Select a reason</Label>
            <RadioGroup onValueChange={setReason} value={reason}>
              {reasons.map((r) => (
                <div className="flex items-center space-x-2" key={r.value}>
                  <RadioGroupItem id={r.value} value={r.value} />
                  <Label
                    className="cursor-pointer font-normal"
                    htmlFor={r.value}
                  >
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more information about your report..."
              rows={4}
              value={description}
            />
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
          <Button disabled={!reason || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
