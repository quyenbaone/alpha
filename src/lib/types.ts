import { Database } from './database.types';

export type Equipment = Database['public']['Tables']['equipment']['Row'];
export type Rental = Database['public']['Tables']['rentals']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

export type RentalWithDetails = Rental & {
  equipment: Pick<Equipment, 'title' | 'price' | 'image'>;
  renter: Pick<User, 'email'>;
};

export type MessageWithSender = Message & {
  sender: Pick<User, 'email'>;
};

export type EquipmentWithOwner = Equipment & {
  owner: Pick<User, 'email'>;
};

export type NotificationWithRelated = Notification & {
  related: {
    rental?: RentalWithDetails;
    message?: MessageWithSender;
  };
};

export interface ChatPartner {
  id: string;
  email: string;
  lastMessage?: string;
  unreadCount?: number;
}

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

export type RentalStatus = keyof typeof RENTAL_STATUS;

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

export type Category = typeof CATEGORIES[number]['value'];