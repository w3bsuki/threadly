import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Info, MapPin } from 'lucide-react';

interface LocationSelectionProps {
  location: string;
  onSelect: (location: string) => void;
}

export function LocationSelection({
  location,
  onSelect,
}: LocationSelectionProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-semibold text-2xl">Where are you based?</h2>
        <p className="text-muted-foreground">
          This helps us show you local deals and calculate shipping
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2" htmlFor="location">
            <MapPin className="h-4 w-4" />
            Your location
          </Label>
          <Input
            className="text-center"
            id="location"
            onChange={(e) => onSelect(e.target.value)}
            placeholder="Enter your city or postal code..."
            value={location}
          />
        </div>

        <div className="rounded-[var(--radius-lg)] bg-muted/50 p-4 text-muted-foreground text-sm">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="space-y-1">
              <p>Your location is used to:</p>
              <ul className="ml-2 list-inside list-disc space-y-0.5">
                <li>Show items available near you</li>
                <li>Calculate accurate shipping costs</li>
                <li>Connect you with local sellers</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs">
          You can update this anytime in your profile settings
        </p>
      </div>
    </div>
  );
}
