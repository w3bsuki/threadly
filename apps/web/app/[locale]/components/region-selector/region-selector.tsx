'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { setCookie, getCookie } from 'cookies-next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { ScrollArea } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { 
  regions, 
  type Region, 
  type Currency, 
  type Language,
  getCurrencySymbol 
} from '@repo/internationalization/client';
import { Globe } from 'lucide-react';
import { useGeoDetection } from './use-geo-detection';
import { useTranslation } from '../providers/i18n-provider';

interface RegionSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export function RegionSelector({ 
  isOpen: controlledIsOpen, 
  onClose,
  showTrigger = false 
}: RegionSelectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;
  const geoData = useGeoDetection();
  const dictionary = useTranslation();

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    // Check if user has already selected a region
    const savedRegion = getCookie('preferredRegion');
    const savedCurrency = getCookie('preferredCurrency');
    const savedLanguage = getCookie('preferredLanguage');

    if (!savedRegion && !controlledIsOpen) {
      // Show selector on first visit
      setInternalIsOpen(true);
      
      // If we detected a region, pre-select it
      if (geoData.isDetected && geoData.region) {
        setSelectedRegion(geoData.region);
        setSelectedCurrency(geoData.region.defaultCurrency);
        setSelectedLanguage(geoData.region.defaultLanguage);
      }
    } else if (savedRegion) {
      const region = regions[savedRegion as string];
      if (region) {
        setSelectedRegion(region);
        setSelectedCurrency(savedCurrency as Currency || region.defaultCurrency);
        setSelectedLanguage(savedLanguage as Language || region.defaultLanguage);
      }
    }
  }, [controlledIsOpen, geoData]);

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setSelectedCurrency(region.defaultCurrency);
    setSelectedLanguage(region.defaultLanguage);
  };

  const handleSave = () => {
    if (!selectedRegion || !selectedCurrency || !selectedLanguage) return;

    // Save preferences to cookies
    setCookie('preferredRegion', selectedRegion.code, { maxAge: 60 * 60 * 24 * 365 });
    setCookie('preferredCurrency', selectedCurrency, { maxAge: 60 * 60 * 24 * 365 });
    setCookie('preferredLanguage', selectedLanguage, { maxAge: 60 * 60 * 24 * 365 });

    // Navigate to the selected language if different
    if (selectedLanguage !== currentLocale) {
      const pathname = window.location.pathname;
      const newPathname = pathname.replace(`/${currentLocale}`, `/${selectedLanguage}`);
      router.push(newPathname);
    }

    handleClose();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const trigger = showTrigger ? (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setInternalIsOpen(true)}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{selectedRegion?.flag || '🌍'} {selectedRegion?.name || 'Select Region'}</span>
    </Button>
  ) : null;

  return (
    <>
      {trigger}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select your region</DialogTitle>
            <DialogDescription>
              Choose your location to see relevant content, pricing, and language options
              {geoData.isDetected && geoData.region && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  We detected you might be in {geoData.region.flag} {geoData.region.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Region Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Choose your country/region</h3>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(regions).map((region) => (
                    <Button
                      key={region.code}
                      variant={selectedRegion?.code === region.code ? 'default' : 'outline'}
                      className="justify-start h-auto py-3"
                      onClick={() => handleRegionSelect(region)}
                    >
                      <span className="text-2xl mr-3">{region.flag}</span>
                      <span className="text-left">{region.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Language Selection */}
            {selectedRegion && (
              <div>
                <h3 className="text-sm font-medium mb-3">Language</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.languages.map((lang) => {
                    const languageNames: Record<Language, string> = {
                      en: 'English',
                      es: 'Español',
                      fr: 'Français',
                      de: 'Deutsch',
                      pt: 'Português',
                      zh: '中文',
                      bg: 'Български',
                      uk: 'Українська',
                    };
                    
                    return (
                      <Button
                        key={lang}
                        variant={selectedLanguage === lang ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        {languageNames[lang]}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Currency Selection */}
            {selectedRegion && (
              <div>
                <h3 className="text-sm font-medium mb-3">Currency</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.currencies.map((currency) => (
                    <Button
                      key={currency}
                      variant={selectedCurrency === currency ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCurrency(currency)}
                    >
                      {currency} ({getCurrencySymbol(currency)})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedRegion && selectedCurrency && selectedLanguage && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">Your selection:</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Region:</span> {selectedRegion.flag} {selectedRegion.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Language:</span> {
                      {
                        en: 'English',
                        es: 'Español',
                        fr: 'Français',
                        de: 'Deutsch',
                        pt: 'Português',
                        zh: '中文',
                        bg: 'Български',
                        uk: 'Українська',
                      }[selectedLanguage]
                    }
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Currency:</span> {selectedCurrency} ({getCurrencySymbol(selectedCurrency)})
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!selectedRegion || !selectedCurrency || !selectedLanguage}
              >
                Save preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}