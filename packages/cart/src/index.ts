export { createCartStore } from './store';
export type { CartConfig, CartItem, CartState } from './types';

// Export default instance for immediate use
import { createCartStore } from './store';
export const useCartStore = createCartStore({
  storageKey: 'threadly-cart-unified',
  enableBroadcast: true,
  autoSync: false, // Can be enabled later when API is ready
});
