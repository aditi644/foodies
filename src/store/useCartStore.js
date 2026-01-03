import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (dish, variant = null, quantity = 1) => {
        const items = get().items;
        const restaurantId = get().restaurantId;

        // If adding from different restaurant, clear cart
        if (restaurantId && restaurantId !== dish.restaurant_id) {
          if (!confirm('Adding items from a different restaurant will clear your cart. Continue?')) {
            return;
          }
          set({ items: [], restaurantId: dish.restaurant_id });
        }

        const itemId = variant
          ? `${dish.id}-${variant.name}`
          : `${dish.id}-default`;

        const existingItem = items.find((item) => item.id === itemId);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const price = variant
            ? dish.price + (variant.price_modifier || 0)
            : dish.price;

          set({
            items: [
              ...items,
              {
                id: itemId,
                dishId: dish.id,
                dishName: dish.name,
                variant: variant?.name || null,
                price: price,
                quantity: quantity,
                image: dish.image_url,
              },
            ],
            restaurantId: dish.restaurant_id,
          });
        }
      },

      removeItem: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], restaurantId: null });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

