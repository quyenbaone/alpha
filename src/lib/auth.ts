import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const signUpSchema = signInSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const getAuthError = (error: Error) => {
  if (error.message.includes('Invalid login credentials')) {
    return 'Email hoặc mật khẩu không chính xác';
  }
  if (error.message.includes('Email not confirmed')) {
    return 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.';
  }
  if (error.message.includes('User already registered')) {
    return 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.';
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
};