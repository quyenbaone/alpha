export const CATEGORIES = [
  {
    id: 'photography',
    name: 'Thiết bị chụp ảnh',
    value: 'Photography',
  },
  {
    id: 'audio',
    name: 'Thiết bị âm thanh',
    value: 'Audio Equipment',
  },
  {
    id: 'camping',
    name: 'Đồ cắm trại',
    value: 'Camping Gear',
  },
  {
    id: 'sup',
    name: 'Thiết bị SUP',
    value: 'SUP Equipment',
  },
] as const;

export const LOCATIONS = [
  'Hà Nội',
  'TP HCM',
  'Đà Nẵng',
  'Hải Phòng',
  'Nha Trang',
  'Cần Thơ',
  'Đà Lạt',
  'Vũng Tàu',
  'Huế',
  'Quy Nhơn',
] as const;

export const RENTAL_STATUS = {
  'pending': {
    label: 'Chờ xác nhận',
    description: 'Đơn thuê mới, chờ chủ cho thuê duyệt.'
  },
  'approved': {
    label: 'Đã xác nhận',
    description: 'Chủ cho thuê đã đồng ý cho thuê.'
  },
  'delivering': {
    label: 'Đang giao hàng',
    description: 'Thiết bị/dụng cụ đang được giao.'
  },
  'in_use': {
    label: 'Đang sử dụng',
    description: 'Người thuê đang sử dụng sản phẩm.'
  },
  'completed': {
    label: 'Hoàn tất',
    description: 'Đã trả thiết bị, đơn thuê hoàn thành.'
  },
  'cancelled': {
    label: 'Đã hủy',
    description: 'Đơn thuê bị hủy do một trong hai bên.'
  },
  'returning': {
    label: 'Đang đổi/trả',
    description: 'Xử lý yêu cầu đổi hoặc trả sớm.'
  },
  'refunded': {
    label: 'Hoàn tiền thành công',
    description: 'Đơn bị hủy và hoàn tiền.'
  },
  'rejected': {
    label: 'Từ chối',
    description: 'Chủ cho thuê từ chối đơn thuê.'
  }
};

export const PRICE_RANGES = [
  {
    label: 'Dưới 500K/ngày',
    min: 0,
    max: 500000,
  },
  {
    label: '500K - 2M/ngày',
    min: 500000,
    max: 2000000,
  },
  {
    label: 'Trên 2M/ngày',
    min: 2000000,
    max: null,
  },
] as const;