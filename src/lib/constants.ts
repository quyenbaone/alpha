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
  pending: {
    label: 'Chờ duyệt',
    color: 'yellow',
  },
  approved: {
    label: 'Đã duyệt',
    color: 'green',
  },
  rejected: {
    label: 'Từ chối',
    color: 'red',
  },
  completed: {
    label: 'Hoàn thành',
    color: 'blue',
  },
} as const;

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