import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment } from '../lib/types';

interface CartItem {
  equipment: Equipment;
  quantity: number;
  startDate: string;
  endDate: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (equipmentId: string) => void;
  updateQuantity: (equipmentId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.equipment.id === item.equipment.id
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.equipment.id === item.equipment.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),
      removeItem: (equipmentId) =>
        set((state) => ({
          items: state.items.filter((i) => i.equipment.id !== equipmentId),
        })),
      updateQuantity: (equipmentId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.equipment.id === equipmentId ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);