/**
 * Utility functions for formatting numbers, currency, dates, etc.
 */

// Number formatting
export function formatNumber(num: number, decimals = 0): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  return num.toLocaleString();
}

// Currency formatting
export function formatCurrency(
  amount: number, 
  currency = 'USD', 
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100); // Assuming amounts are in cents
}

// Percentage formatting
export function formatPercentage(
  value: number, 
  decimals = 1,
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Date formatting
export function formatDate(
  date: Date | string, 
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium',
  locale = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    return formatRelativeTime(dateObj);
  }
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'long', day: 'numeric', year: 'numeric' },
    long: { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

// Relative time formatting
export function formatRelativeTime(date: Date | string, locale = 'en-US'): string {
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = new Date(); // fallback
  }
  const now = new Date();
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'invalid date';
  }
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        -count,
        interval.label as Intl.RelativeTimeFormatUnit
      );
    }
  }
  return 'just now';
}

// Time formatting
export function formatTime(date: Date | string, locale = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(dateObj);
}

// Duration formatting
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// File size formatting
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Truncate text
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

// Format status
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Format phone number
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  
  return phoneNumber;
}

// Format email (mask for privacy)
export function formatEmailForDisplay(email: string, maskLength = 3): string {
  const [local, domain] = email.split('@');
  if (local.length <= maskLength) return email;
  
  const visibleStart = Math.floor(maskLength / 2);
  const visibleEnd = maskLength - visibleStart;
  const masked = local.substring(0, visibleStart) + 
                '*'.repeat(local.length - maskLength) + 
                local.substring(local.length - visibleEnd);
  
  return `${masked}@${domain}`;
}

// Format address
export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string {
  const parts = [
    address.street,
    address.city,
    address.state && address.postalCode ? `${address.state} ${address.postalCode}` : address.state || address.postalCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
}

// Format rating
export function formatRating(rating: number, maxRating = 5): string {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(maxRating - Math.floor(rating));
  return `${stars} (${rating.toFixed(1)})`;
}

// Format change/trend
export function formatChange(current: number, previous: number, format: 'number' | 'percentage' = 'percentage'): {
  value: string;
  direction: 'up' | 'down' | 'neutral';
  isPositive: boolean;
} {
  const change = current - previous;
  const percentChange = previous === 0 ? 0 : (change / previous) * 100;
  
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const isPositive = change >= 0;
  
  const value = format === 'percentage' 
    ? formatPercentage(Math.abs(percentChange))
    : formatNumber(Math.abs(change));
  
  return { value, direction, isPositive };
}

// Format lists
export function formatList(items: string[], maxItems = 3, separator = ', '): string {
  if (items.length === 0) return '';
  if (items.length <= maxItems) return items.join(separator);
  
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  
  return `${visible.join(separator)} and ${remaining} more`;
}

// Format JSON for display
export function formatJSON(obj: any, indent = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
}

// Clean and format user input
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove basic HTML characters
}

// Format search query
export function formatSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, ' '); // Replace multiple spaces
}

// Export formatters as a group
export const formatters = {
  number: formatNumber,
  currency: formatCurrency,
  percentage: formatPercentage,
  date: formatDate,
  relativeTime: formatRelativeTime,
  time: formatTime,
  duration: formatDuration,
  fileSize: formatFileSize,
  truncateText,
  status: formatStatus,
  phoneNumber: formatPhoneNumber,
  emailForDisplay: formatEmailForDisplay,
  address: formatAddress,
  rating: formatRating,
  change: formatChange,
  list: formatList,
  json: formatJSON,
  sanitizeText,
  searchQuery: formatSearchQuery,
};