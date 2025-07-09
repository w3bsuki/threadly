import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { MapPin, Info } from 'lucide-react';

interface LocationSelectionProps {
  location: string;
  onSelect: (location: string) => void;
}

export function LocationSelection({ location, onSelect }: LocationSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Where are you based?</h2>
        <p className="text-muted-foreground">
          This helps us show you local deals and calculate shipping
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Your location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => onSelect(e.target.value)}
            placeholder="Enter your city or postal code..."
            className="text-center"
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p>
                Your location is used to:
              </p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Show items available near you</li>
                <li>Calculate accurate shipping costs</li>
                <li>Connect you with local sellers</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can update this anytime in your profile settings
        </p>
      </div>
    </div>
  );
}