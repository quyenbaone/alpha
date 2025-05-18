import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Eye, EyeOff, Loader2, Phone, User } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// CSS animation keyframes
const blobAnimation = `
@keyframes blob {
  0% {
    transform: scale(1) translate(0px, 0px);
  }
  33% {
    transform: scale(1.1) translate(30px, -50px);
  }
  66% {
    transform: scale(0.9) translate(-20px, 20px);
  }
  100% {
    transform: scale(1) translate(0px, 0px);
  }
}

.animate-blob {
  animation: blob 7s infinite alternate;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;

// Updated schema with additional fields
const signUpSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phoneNumber: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
  role: z.enum(['owner', 'renter'], {
    required_error: "Vui lòng chọn vai trò",
  }),
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "Bạn phải đồng ý với điều khoản để tiếp tục"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type SignUpSchema = z.infer<typeof signUpSchema>;

export function SignUp() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = React.useState('');
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'renter',
      termsAgreed: false
    }
  });

  const onSubmit = async (data: SignUpSchema) => {
    try {
      console.log("Form data:", data);
      // Show loading toast
      toast.loading('Đang đăng ký...', { id: 'signup' });

      // Save the email for potential resend
      setLastSubmittedEmail(data.email);

      const { error } = await signUp(data.email, data.password, data.fullName);

      // Dismiss loading toast
      toast.dismiss('signup');

      if (error) {
        console.error("SignUp error:", error);

        if (error.status === 429) {
          // Check for specific email rate limit error
          if (error.code === 'over_email_send_rate_limit') {
            toast.error(error.message || 'Quá nhiều yêu cầu email. Vui lòng thử lại sau.');
            setError('email', {
              message: error.message || 'Đã gửi quá nhiều email xác nhận. Vui lòng thử lại sau.'
            });
            return;
          }

          toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.');
          setError('root', { message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.' });
          return;
        }

        if (error.message?.includes('already registered')) {
          toast.error('Email này đã được đăng ký.');
          setError('email', { message: 'Email này đã được đăng ký trước đó' });
          return;
        }

        toast.error('Đăng ký thất bại');
        setError('root', { message: error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.' });
        return;
      }

      // Success
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      navigate('/signin');
    } catch (error) {
      toast.dismiss('signup');

      if (error instanceof Error) {
        console.error("Unhandled signup error:", error);
        toast.error('Đăng ký thất bại');

        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          setError('root', { message: 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối internet của bạn.' });
        } else {
          setError('root', { message: error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
        }
      }
    }
  };

  const handleResendVerification = async () => {
    if (!lastSubmittedEmail || isResending) return;

    setIsResending(true);
    toast.loading('Đang gửi lại email xác nhận...', { id: 'resend' });

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: lastSubmittedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      toast.dismiss('resend');

      if (error) {
        if (error.status === 429) {
          toast.error('Vui lòng đợi ít nhất 2 phút trước khi gửi lại email.');
        } else {
          toast.error(error.message || 'Không thể gửi lại email. Vui lòng thử lại sau.');
        }
      } else {
        toast.success('Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn.');
      }
    } catch (err) {
      toast.dismiss('resend');
      toast.error('Không thể gửi lại email. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 relative py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: blobAnimation }} />

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] right-[30%] w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Hoặc{' '}
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                đăng nhập với tài khoản hiện có
              </Link>
            </p>
          </div>

          <div className="px-8 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 mr-1" /> Họ tên
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    {...register('fullName')}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder="Họ và tên của bạn"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 mr-1" /> Số điện thoại
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    {...register('phoneNumber')}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.phoneNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder="Số điện thoại của bạn"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder="Email của bạn"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm transition-all duration-200`}
                      placeholder="Mật khẩu của bạn"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm transition-all duration-200`}
                      placeholder="Xác nhận mật khẩu của bạn"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò của bạn</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center p-3 border rounded-lg cursor-pointer transition-all ${watch('role') === 'owner'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}>
                      <input
                        type="radio"
                        value="owner"
                        {...register('role')}
                        className="sr-only"
                      />
                      <CheckSquare className={`h-5 w-5 mr-2 ${watch('role') === 'owner' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span>Người cho thuê</span>
                    </label>

                    <label className={`flex-1 flex items-center p-3 border rounded-lg cursor-pointer transition-all ${watch('role') === 'renter'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}>
                      <input
                        type="radio"
                        value="renter"
                        {...register('role')}
                        className="sr-only"
                      />
                      <CheckSquare className={`h-5 w-5 mr-2 ${watch('role') === 'renter' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span>Người thuê</span>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('termsAgreed')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Tôi đồng ý với <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">Chính sách bảo mật</a> của ứng dụng
                    </span>
                  </label>
                  {errors.termsAgreed && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.termsAgreed.message}
                    </p>
                  )}
                </div>
              </div>

              {errors.root && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.root.message}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:translate-y-[-2px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang đăng ký...
                  </span>
                ) : (
                  'Đăng ký'
                )}
              </button>

              {lastSubmittedEmail && (
                <div className="mt-4">
                  <p className="text-sm text-center text-gray-600 mb-2">
                    Không nhận được email xác nhận?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isResending ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang gửi lại...
                      </span>
                    ) : (
                      'Gửi lại email xác nhận'
                    )}
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    Kiểm tra cả thư mục spam/junk và đợi ít nhất 2 phút giữa các lần gửi.
                  </p>
                </div>
              )}

              <p className="text-center text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  Đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}