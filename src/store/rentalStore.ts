import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RentalWithDetails } from '../lib/types';

interface RentalState {
  rentals: RentalWithDetails[];
  loading: boolean;
  error: string | null;
  fetchRentals: () => Promise<void>;
  createRental: (equipmentId: string, startDate: string, endDate: string) => Promise<void>;
  updateRentalStatus: (rentalId: string, status: string) => Promise<void>;
}

export const useRentalStore = create<RentalState>((set) => ({
  rentals: [],
  loading: false,
  error: null,

  fetchRentals: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          equipment:equipment_id (
            title,
            price,
            image
          ),
          renter:renter_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ rentals: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching rentals:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load rentals',
        loading: false 
      });
    }
  },

  createRental: async (equipmentId: string, startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('rentals')
        .insert({
          equipment_id: equipmentId,
          renter_id: user.id,
          start_date: startDate,
          end_date: endDate,
          status: 'pending'
        });

      if (error) throw error;
      await useRentalStore.getState().fetchRentals();
    } catch (error) {
      console.error('Error creating rental:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create rental',
        loading: false 
      });
    }
  },

  updateRentalStatus: async (rentalId: string, status: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', rentalId);

      if (error) throw error;
      await useRentalStore.getState().fetchRentals();
    } catch (error) {
      console.error('Error updating rental status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update rental status',
        loading: false 
      });
    }
  },
}));