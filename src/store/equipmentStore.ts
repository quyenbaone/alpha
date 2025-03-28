import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Equipment = Database['public']['Tables']['equipment']['Row'];

interface EquipmentState {
  items: Equipment[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    priceRange: [number, number] | null;
    location: string | null;
    search: string | null;
  };
  fetchEquipment: () => Promise<void>;
  setFilters: (filters: Partial<EquipmentState['filters']>) => Promise<void>;
  clearError: () => void;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    priceRange: null,
    location: null,
    search: null,
  },

  fetchEquipment: async () => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { category, priceRange, location, search } = get().filters;
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (priceRange) {
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      }
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ 
        items: data || [], 
        loading: false,
        error: data?.length === 0 ? 'Không tìm thấy thiết bị nào. Hãy thử điều chỉnh bộ lọc của bạn.' : null
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu',
        loading: false,
        items: []
      });
    }
  },

  setFilters: async (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    await get().fetchEquipment();
  },

  clearError: () => set({ error: null }),
}));