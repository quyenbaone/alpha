import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// Define types
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Equipment {
  id: string;
  title: string;
  description?: string;
  price_per_day: number;
  category_id?: string;
  images?: string[];
  location?: string;
  status: string;
  owner_id: string;
  slug?: string;
}

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentToEdit?: Equipment;
}

export function AddEquipmentModal({ isOpen, onClose, onSuccess, equipmentToEdit }: AddEquipmentModalProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_day: '',
    category_id: '',
    images: '',
    location: '',
    status: 'available'
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();

      // If editing, populate form with equipment data
      if (equipmentToEdit) {
        setFormData({
          title: equipmentToEdit.title || '',
          description: equipmentToEdit.description || '',
          price_per_day: equipmentToEdit.price_per_day ? equipmentToEdit.price_per_day.toString() : '',
          category_id: equipmentToEdit.category_id || '',
          images: equipmentToEdit.images && equipmentToEdit.images.length > 0 ? equipmentToEdit.images.join(', ') : '',
          location: equipmentToEdit.location || '',
          status: equipmentToEdit.status || 'available'
        });
      } else {
        // Reset form for new equipment
        setFormData({
          title: '',
          description: '',
          price_per_day: '',
          category_id: '',
          images: '',
          location: '',
          status: 'available'
        });
      }
    }
  }, [isOpen, equipmentToEdit]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Lỗi khi tải danh mục');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse images to array
      const imagesArray = formData.images
        ? formData.images.split(',').map(img => img.trim()).filter(img => img)
        : [];

      // Create data object for database
      const equipmentData = {
        ...formData,
        price_per_day: parseFloat(formData.price_per_day),
        images: imagesArray,
        owner_id: user?.id,
      };

      if (equipmentToEdit) {
        // Update existing equipment
        const { error } = await supabase
          .from('equipment')
          .update(equipmentData)
          .eq('id', equipmentToEdit.id)
          .eq('owner_id', user?.id); // Safety check

        if (error) throw error;
        toast.success('Đã cập nhật thiết bị thành công');
      } else {
        // Create slug from title for new equipment
        const slug = formData.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6);

        // Add new equipment
        const { error } = await supabase
          .from('equipment')
          .insert({
            ...equipmentData,
            slug
          });

        if (error) throw error;
        toast.success('Đã thêm thiết bị mới thành công');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error with equipment:', error);
      toast.error(equipmentToEdit
        ? 'Không thể cập nhật thiết bị: ' + error.message
        : 'Không thể thêm thiết bị: ' + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {equipmentToEdit ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên thiết bị
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Máy ảnh Canon EOS R5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Mô tả thiết bị của bạn..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá thuê mỗi ngày (VND)
              </label>
              <input
                type="number"
                name="price_per_day"
                value={formData.price_per_day}
                onChange={handleChange}
                required
                min="0"
                step="1000"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL hình ảnh (nhiều hình cách nhau bởi dấu phẩy)
            </label>
            <input
              type="text"
              name="images"
              value={formData.images}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Nhập URL hình ảnh, cách nhau bởi dấu phẩy để thêm nhiều hình</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="VD: Hà Nội"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="available">Có sẵn</option>
                <option value="unavailable">Không có sẵn</option>
                <option value="rented">Đang cho thuê</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {loading
                ? (equipmentToEdit ? 'Đang cập nhật...' : 'Đang thêm...')
                : (equipmentToEdit ? 'Cập nhật thiết bị' : 'Thêm thiết bị')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}