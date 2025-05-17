import { toast } from 'sonner';
import { supabase } from './supabase';

/**
 * Update a rental's status and handle related equipment status changes
 * @param rentalId - The ID of the rental to update
 * @param status - The new status (pending, confirmed, in_progress, completed, cancelled)
 * @returns Promise<boolean> - Success or failure
 */
export async function updateRentalStatus(rentalId: string, status: string): Promise<boolean> {
    try {
        // Map frontend status values to database enum values
        const statusMap = {
            'pending': 'pending',
            'approved': 'confirmed', // Map 'approved' to 'confirmed' which is the correct enum value
            'rejected': 'cancelled', // Map 'rejected' to 'cancelled'
            'completed': 'completed',
            'cancelled': 'cancelled',
            'confirmed': 'confirmed',
            'delivering': 'delivering',
            'in_progress': 'in_progress'
        };

        const dbStatus = statusMap[status] || status;

        // First get the rental to check current status and get equipment_id
        const { data: rentalData, error: fetchError } = await supabase
            .from('rentals')
            .select('equipment_id, status')
            .eq('id', rentalId)
            .single();

        if (fetchError) {
            console.error('Error fetching rental:', fetchError);
            throw fetchError;
        }

        // Update the rental status
        const { error: updateError } = await supabase
            .from('rentals')
            .update({
                status: dbStatus,
                updated_at: new Date().toISOString()
            } as any)
            .eq('id', rentalId as any);

        if (updateError) {
            console.error('Error updating rental status:', updateError);
            throw updateError;
        }

        // Handle equipment status based on rental status
        switch (dbStatus) {
            case 'confirmed':
            case 'delivering':
            case 'in_progress':
                // These statuses all indicate the equipment is not available for others
                await updateEquipmentStatus(rentalData.equipment_id, 'rented');
                break;

            case 'completed':
            case 'cancelled':
                // These statuses indicate the equipment is available again
                await updateEquipmentStatus(rentalData.equipment_id, 'available');
                break;

            // For pending status, don't change equipment status
        }

        return true;
    } catch (error) {
        console.error('Error in updateRentalStatus:', error);
        return false;
    }
}

/**
 * Update an equipment's status
 * @param equipmentId - The equipment ID to update
 * @param status - The new status (available, rented, maintenance, unavailable)
 */
async function updateEquipmentStatus(equipmentId: string, status: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('equipment')
            .update({ status } as any)
            .eq('id', equipmentId as any);

        if (error) {
            console.error('Error updating equipment status:', error);
        }
    } catch (error) {
        console.error('Error in updateEquipmentStatus:', error);
    }
}

/**
 * Example of using the updateRentalStatus function in an admin page
 */
export async function adminUpdateRentalStatus(rentalId: string, status: string): Promise<void> {
    try {
        // Map status values to human-readable names
        const statusDisplayNames = {
            'pending': 'Đang chờ',
            'approved': 'Đã duyệt',
            'rejected': 'Từ chối',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy',
            'confirmed': 'Đã xác nhận',
            'delivering': 'Đang giao hàng',
            'in_progress': 'Đang thuê'
        };

        const success = await updateRentalStatus(rentalId, status);

        if (success) {
            const displayName = statusDisplayNames[status] || status;
            toast.success(`Trạng thái đơn thuê đã được cập nhật thành ${displayName}`, {
                id: `status-update-${rentalId}-${Date.now()}`,
                duration: 3000
            });
            return Promise.resolve();
        } else {
            toast.error('Không thể cập nhật trạng thái đơn thuê', {
                id: `status-update-error-${rentalId}-${Date.now()}`,
                duration: 3000
            });
            return Promise.reject(new Error('Failed to update rental status'));
        }
    } catch (error) {
        console.error('Error in adminUpdateRentalStatus:', error);
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái đơn thuê', {
            id: `status-update-error-${rentalId}-${Date.now()}`,
            duration: 3000
        });
        return Promise.reject(error);
    }
} 