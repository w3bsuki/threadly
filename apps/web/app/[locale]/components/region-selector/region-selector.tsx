'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@repo/ui/components';
import {
  type Currency,
  getCurrencySymbol,
  type Language,
  type Region,
  regions,
} from '@repo/content/internationalization/client';
import { getCookie, setCookie } from 'cookies-next';
import { Globe } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '../providers/i18n-provider';
import { useGeoDetection } from './use-geo-detection';

interface RegionSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export function RegionSelector({
  isOpen: controlledIsOpen,
  onClose,
  showTrigger = false,
}: RegionSelectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );

  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;
  const geoData = useGeoDetection();
  const _dictionary = useTranslation();

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    // Check if user has already selected a region
    const savedRegion = getCookie('preferredRegion');
    const savedCurrency = getCookie('preferredCurrency');
    const savedLanguage = getCookie('preferredLanguage');

    if (!(savedRegion || controlledIsOpen)) {
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
        setSelectedCurrency(
          (savedCurrency as Currency) || region.defaultCurrency
        );
        setSelectedLanguage(
          (savedLanguage as Language) || region.defaultLanguage
        );
      }
    }
  }, [controlledIsOpen, geoData]);

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setSelectedCurrency(region.defaultCurrency);
    setSelectedLanguage(region.defaultLanguage);
  };

  const handleSave = () => {
    if (!(selectedRegion && selectedCurrency && selectedLanguage)) {
      return;
    }

    // Save preferences to cookies
    setCookie('preferredRegion', selectedRegion.code, {
      maxAge: 60 * 60 * 24 * 365,
    });
    setCookie('preferredCurrency', selectedCurrency, {
      maxAge: 60 * 60 * 24 * 365,
    });
    setCookie('preferredLanguage', selectedLanguage, {
      maxAge: 60 * 60 * 24 * 365,
    });

    // Navigate to the selected language if different
    if (selectedLanguage !== currentLocale) {
      const pathname = window.location.pathname;
      const newPathname = pathname.replace(
        `/${currentLocale}`,
        `/${selectedLanguage}`
      );
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
      className="flex items-center gap-2"
      onClick={() => setInternalIsOpen(true)}
      size="sm"
      variant="ghost"
    >
      <Globe className="h-4 w-4" />
      <span>
        {selectedRegion?.flag || '🌍'} {selectedRegion?.name || 'Select Region'}
      </span>
    </Button>
  ) : null;

  return (
    <>
      {trigger}
      <Dialog onOpenChange={handleClose} open={isOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select your region</DialogTitle>
            <DialogDescription>
              Choose your location to see relevant content, pricing, and
              language options
              {geoData.isDetected && geoData.region && (
                <span className="mt-2 block text-muted-foreground text-sm">
                  We detected you might be in {geoData.region.flag}{' '}
                  {geoData.region.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Region Selection */}
            <div>
              <h3 className="mb-3 font-medium text-sm">
                Choose your country/region
              </h3>
              <ScrollArea className="h-[200px] rounded-[var(--radius-md)] border p-2">
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(regions).map((region) => (
                    <Button
                      className="h-auto justify-start py-3"
                      key={region.code}
                      onClick={() => handleRegionSelect(region)}
                      variant={
                        selectedRegion?.code === region.code
                          ? 'default'
                          : 'outline'
                      }
                    >
                      <span className="mr-3 text-2xl">{region.flag}</span>
                      <span className="text-left">{region.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Language Selection */}
            {selectedRegion && (
              <div>
                <h3 className="mb-3 font-medium text-sm">Language</h3>
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
                        onClick={() => setSelectedLanguage(lang)}
                        size="sm"
                        variant={
                          selectedLanguage === lang ? 'default' : 'outline'
                        }
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
                <h3 className="mb-3 font-medium text-sm">Currency</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.currencies.map((currency) => (
                    <Button
                      key={currency}
                      onClick={() => setSelectedCurrency(currency)}
                      size="sm"
                      variant={
                        selectedCurrency === currency ? 'default' : 'outline'
                      }
                    >
                      {currency} ({getCurrencySymbol(currency)})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedRegion && selectedCurrency && selectedLanguage && (
              <div className="rounded-[var(--radius-lg)] border bg-muted/50 p-4">
                <p className="text-muted-foreground text-sm">Your selection:</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Region:</span>{' '}
                    {selectedRegion.flag} {selectedRegion.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Language:</span>{' '}
                    {
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
                    <span className="font-medium">Currency:</span>{' '}
                    {selectedCurrency} ({getCurrencySymbol(selectedCurrency)})
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
              <Button
                disabled={
                  !(selectedRegion && selectedCurrency && selectedLanguage)
                }
                onClick={handleSave}
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
