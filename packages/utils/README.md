# @repo/utils

Essential utility functions and React hooks for Threadly's C2C fashion marketplace. This package provides reusable utilities for price formatting, currency handling, decimal operations, and common React patterns.

## Overview

The utils package provides fundamental utilities used throughout Threadly:

- **Price Utilities**: Consistent price formatting and conversion between dollars/cents
- **Currency Functions**: International currency formatting and parsing
- **Decimal Operations**: Safe Prisma Decimal handling and arithmetic
- **React Hooks**: Common hooks like debouncing for better UX
- **Type Safety**: Full TypeScript support with proper error handling
- **Performance**: Optimized functions for frequent operations

## Installation

```bash
pnpm add @repo/utils
```

## Dependencies

This package depends on:
- `react` - React framework for hooks
- Prisma Decimal types (implicitly via `@prisma/client/runtime/library`)

## API Reference

### Price Utilities

```typescript
import { 
  formatPrice, 
  dollarsToStorageCents, 
  centsToDisplayDollars, 
  parseUserPriceToCents, 
  isPriceValid 
} from '@repo/utils/price';

// Format cents as currency display
formatPrice(1999);                    // "$19.99"
formatPrice(1999, 'EUR');            // "€19.99"

// Convert dollars to cents for storage
dollarsToStorageCents(19.99);        // 1999

// Convert cents to dollars for display
centsToDisplayDollars(1999);         // 19.99

// Parse user input to cents
parseUserPriceToCents("$19.99");     // 1999
parseUserPriceToCents("19.99");      // 1999
parseUserPriceToCents(19.99);        // 1999

// Validate price range
isPriceValid(1999);                  // true
isPriceValid(0);                     // false (too low)
isPriceValid(999999999);             // false (too high)
```

### Currency Utilities

```typescript
import { 
  formatCurrency, 
  formatCentsAsCurrency, 
  parseCurrency, 
  formatNumber 
} from '@repo/utils/currency';

// Format any number as currency
formatCurrency(99.99);                           // "$99.99"
formatCurrency(99.99, 'EUR', 'de-DE');         // "99,99 €"

// Format cents as currency
formatCentsAsCurrency(9999);                    // "$99.99"

// Parse currency string to number
parseCurrency("$1,234.56");                    // 1234.56
parseCurrency("€1.234,56");                    // 1234.56

// Format numbers with thousand separators
formatNumber(1234567);                          // "1,234,567"
formatNumber(1234567, 'de-DE');                // "1.234.567"
```

### Decimal Operations

```typescript
import { 
  decimalToNumber, 
  numberToDecimal, 
  formatDecimalAsCurrency, 
  addDecimals, 
  multiplyDecimals, 
  calculatePercentage, 
  roundDecimal 
} from '@repo/utils/decimal';

// Convert Prisma Decimal to JavaScript number
const decimal = new Decimal('19.99');
const number = decimalToNumber(decimal);        // 19.99

// Convert number to Prisma Decimal
const newDecimal = numberToDecimal(19.99);      // Decimal('19.99')

// Format Decimal as currency
formatDecimalAsCurrency(decimal);               // "$19.99"

// Safe decimal arithmetic
const sum = addDecimals(decimal1, decimal2);
const product = multiplyDecimals(price, quantity);
const tax = calculatePercentage(price, 8.5);   // 8.5% tax
const rounded = roundDecimal(decimal, 2);      // Round to 2 decimal places
```

### React Hooks

```typescript
import { 
  useDebounce, 
  useDebouncedCallback, 
  useDebounceWithLoading 
} from '@repo/utils/hooks';

// Debounce a value
function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      // Perform search
      searchProducts(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input 
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search products..."
    />
  );
}

// Debounce a callback function
function AutoSave({ data }: { data: any }) {
  const debouncedSave = useDebouncedCallback(
    (data) => saveToServer(data),
    1000
  );

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  return <div>Auto-saving...</div>;
}

// Debounce with loading state
function SearchWithLoading() {
  const [query, setQuery] = useState('');
  const { debouncedValue, isDebouncing } = useDebounceWithLoading(query, 300);

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isDebouncing && <span>Searching...</span>}
      <SearchResults query={debouncedValue} />
    </div>
  );
}
```

## Usage Examples

### Product Price Display

```typescript
import { formatPrice, isPriceValid } from '@repo/utils/price';

interface ProductPriceProps {
  priceInCents: number;
  originalPriceInCents?: number;
  currency?: string;
}

function ProductPrice({ 
  priceInCents, 
  originalPriceInCents, 
  currency = 'USD' 
}: ProductPriceProps) {
  if (!isPriceValid(priceInCents)) {
    return <span>Price unavailable</span>;
  }

  const hasDiscount = originalPriceInCents && originalPriceInCents > priceInCents;

  return (
    <div className="product-price">
      <span className="current-price">
        {formatPrice(priceInCents, currency)}
      </span>
      {hasDiscount && (
        <span className="original-price line-through text-gray-500">
          {formatPrice(originalPriceInCents, currency)}
        </span>
      )}
    </div>
  );
}
```

### Price Input Component

```typescript
import { 
  parseUserPriceToCents, 
  centsToDisplayDollars, 
  isPriceValid,
  formatCurrency 
} from '@repo/utils';

interface PriceInputProps {
  value: number; // In cents
  onChange: (cents: number) => void;
  currency?: string;
}

function PriceInput({ value, onChange, currency = 'USD' }: PriceInputProps) {
  const [inputValue, setInputValue] = useState(
    centsToDisplayDollars(value).toString()
  );
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (input: string) => {
    setInputValue(input);
    setError(null);

    try {
      const cents = parseUserPriceToCents(input);
      
      if (!isPriceValid(cents)) {
        setError('Price must be between $0.01 and $999,999.99');
        return;
      }

      onChange(cents);
    } catch (err) {
      setError('Invalid price format');
    }
  };

  return (
    <div className="price-input">
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-500">
          {currency === 'USD' ? '$' : currency}
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-8 pr-3 py-2 border rounded-lg"
          placeholder="0.00"
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {!error && value > 0 && (
        <p className="text-gray-600 text-sm mt-1">
          Price: {formatCurrency(centsToDisplayDollars(value), currency)}
        </p>
      )}
    </div>
  );
}
```

### Search with Debouncing

```typescript
import { useDebounce } from '@repo/utils/hooks';

interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
}

function DebouncedSearch({ 
  onSearch, 
  placeholder = "Search...", 
  delay = 300 
}: SearchProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {query !== debouncedQuery && (
        <div className="text-sm text-gray-500 mt-1">
          Searching...
        </div>
      )}
    </div>
  );
}
```

### Decimal Calculations for Orders

```typescript
import { 
  addDecimals, 
  multiplyDecimals, 
  calculatePercentage, 
  formatDecimalAsCurrency,
  numberToDecimal 
} from '@repo/utils/decimal';

interface OrderCalculatorProps {
  items: Array<{
    price: number;
    quantity: number;
  }>;
  taxRate: number;
  shippingCost: number;
}

function OrderCalculator({ items, taxRate, shippingCost }: OrderCalculatorProps) {
  // Calculate subtotal
  const subtotal = items.reduce((total, item) => {
    const itemPrice = numberToDecimal(item.price);
    const quantity = numberToDecimal(item.quantity);
    const itemTotal = multiplyDecimals(itemPrice, quantity);
    return addDecimals(total, itemTotal);
  }, numberToDecimal(0));

  // Calculate tax
  const tax = calculatePercentage(subtotal, taxRate);

  // Calculate total
  const shipping = numberToDecimal(shippingCost);
  const total = addDecimals(addDecimals(subtotal, tax), shipping);

  return (
    <div className="order-summary">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>{formatDecimalAsCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax ({taxRate}%):</span>
        <span>{formatDecimalAsCurrency(tax)}</span>
      </div>
      <div className="flex justify-between">
        <span>Shipping:</span>
        <span>{formatDecimalAsCurrency(shipping)}</span>
      </div>
      <div className="flex justify-between font-bold border-t pt-2">
        <span>Total:</span>
        <span>{formatDecimalAsCurrency(total)}</span>
      </div>
    </div>
  );
}
```

### Auto-save with Debounced Callback

```typescript
import { useDebouncedCallback } from '@repo/utils/hooks';

interface AutoSaveFormProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
}

function AutoSaveForm({ initialData, onSave }: AutoSaveFormProps) {
  const [data, setData] = useState(initialData);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const debouncedSave = useDebouncedCallback(
    async (dataToSave) => {
      setSaveStatus('saving');
      try {
        await onSave(dataToSave);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    },
    1000
  );

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    debouncedSave(newData);
  };

  return (
    <form className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Product Details</h2>
        <div className="text-sm">
          {saveStatus === 'saving' && <span className="text-blue-600">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-green-600">Saved</span>}
          {saveStatus === 'error' && <span className="text-red-600">Save failed</span>}
        </div>
      </div>

      <input
        type="text"
        value={data.title || ''}
        onChange={(e) => handleInputChange('title', e.target.value)}
        placeholder="Product title"
        className="w-full px-3 py-2 border rounded"
      />

      <textarea
        value={data.description || ''}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Product description"
        className="w-full px-3 py-2 border rounded"
        rows={4}
      />
    </form>
  );
}
```

## Exported Modules

### Price Module (`/price`)

Core price handling functions for e-commerce operations:
- `formatPrice()` - Display formatting
- `dollarsToStorageCents()` - Storage conversion
- `centsToDisplayDollars()` - Display conversion
- `parseUserPriceToCents()` - User input parsing
- `isPriceValid()` - Validation

### Currency Module (`/currency`)

General currency utilities:
- `formatCurrency()` - International formatting
- `parseCurrency()` - String parsing
- `formatNumber()` - Number formatting

### Decimal Module (`/decimal`)

Prisma Decimal operations:
- `decimalToNumber()` - Safe conversion
- `addDecimals()` - Addition
- `multiplyDecimals()` - Multiplication
- `calculatePercentage()` - Percentage calculations

### Hooks Module (`/hooks`)

React utility hooks:
- `useDebounce()` - Value debouncing
- `useDebouncedCallback()` - Function debouncing
- `useDebounceWithLoading()` - Debounce with loading state

## Configuration

### Price Validation Limits

```typescript
// Current price validation range
const MIN_PRICE_CENTS = 1;        // $0.01
const MAX_PRICE_CENTS = 99999999; // $999,999.99

// You can extend validation for different categories
const isPremiumItemValid = (cents: number) => {
  return cents >= 100 && cents <= 10000000; // $1.00 to $100,000
};
```

### Currency Defaults

```typescript
// Default currency settings
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = 'en-US';

// Supported currencies (extend as needed)
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'JPY'];
```

## Error Handling

All utility functions include proper error handling:

```typescript
// Price parsing with error handling
try {
  const cents = parseUserPriceToCents(userInput);
  // Use cents
} catch (error) {
  console.error('Invalid price format:', error.message);
  // Handle error
}

// Decimal operations with fallbacks
const result = addDecimals(decimal1, decimal2); // Always returns valid Decimal
const number = decimalToNumber(decimal);        // Returns 0 if conversion fails
```

## Performance Considerations

- Functions are optimized for frequent use
- Debounce hooks prevent excessive API calls
- Decimal operations use Prisma's optimized Decimal class
- Currency formatting uses native `Intl.NumberFormat`

## Testing

```bash
# Run utils package tests
pnpm test packages/utils

# Test specific modules
pnpm test packages/utils/price
pnpm test packages/utils/hooks
```

## Integration Notes

This package is used throughout Threadly:
- Product price display and input
- Order calculations and summaries
- Search functionality with debouncing
- Form auto-save features
- Currency handling in payments

## Best Practices

1. **Always store prices in cents** to avoid floating-point errors
2. **Use debouncing** for search and auto-save to improve performance
3. **Validate prices** before processing or storage
4. **Handle errors gracefully** with fallback values
5. **Use TypeScript** for type safety with all utilities

## Version History

- `0.0.0` - Initial release with core utilities
- Price and currency handling
- Decimal operations for Prisma
- React hooks for common patterns
- TypeScript support with error handling