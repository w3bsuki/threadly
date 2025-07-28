// Unified cart item interface that works for both apps
export interface CartItem {
  // Use productId consistently (apps/app pattern)
  productId: string;

  // Core product information
  title: string;
  price: number; // In dollars (database format)
  imageUrl: string; // Standardize on imageUrl

  // Seller information
  sellerId: string;
  sellerName?: string;

  // Product details
  condition: string;
  size?: string;
  color?: string;

  // Cart-specific
  quantity: number;
  availableQuantity?: number; // Optional for validation

  // Internal cart ID (auto-generated)
  id?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastSyncTimestamp: number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;

  // Sync methods for future API integration
  syncWithServer?: () => Promise<void>;
  enableAutoSync?: () => () => void;

  // Internal broadcast methods
  broadcastChange?: () => void;
  listenForChanges?: () => () => void;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItem: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
  getItemCount: (productId: string) => number;
}

export interface CartConfig {
  storageKey?: string;
  apiEndpoint?: string;
  autoSync?: boolean;
  enableBroadcast?: boolean;
}
