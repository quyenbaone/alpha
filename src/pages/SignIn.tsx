import { ArrowRight, Eye, EyeOff, HelpCircle, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const signInSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

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

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 200px;
  background-color: hsl(var(--foreground));
  color: hsl(var(--background));
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: hsl(var(--foreground)) transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
`;

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validateForm = () => {
    try {
      signInSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') newErrors.email = err.message;
          if (err.path[0] === 'password') newErrors.password = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      toast.info('Đang đăng nhập...', { id: 'login', duration: 2000 });

      const { error } = await signIn(email, password);

      if (error) {
        toast.dismiss('login');
        console.error('SignIn error:', error);

        // Handle specific error cases
        if (error.status === 429) {
          setErrors({ general: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.' });
          toast.error('Quá nhiều yêu cầu');
          return;
        }

        if (error.message?.includes('Invalid login credentials')) {
          setErrors({ general: 'Email hoặc mật khẩu không chính xác.' });
          toast.error('Email hoặc mật khẩu không chính xác');
          return;
        }

        if (error.message?.includes('Email not confirmed')) {
          setErrors({ general: 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.' });
          toast.error('Email chưa được xác nhận');
          return;
        }

        // Default error case
        setErrors({ general: error.message || 'Đăng nhập thất bại. Vui lòng thử lại sau.' });
        toast.error('Đăng nhập thất bại');
        return;
      }

      toast.dismiss('login');
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.dismiss('login');

      if (error.message === 'network_error' || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        // Try one more time with network errors
        setTimeout(async () => {
          try {
            toast.info('Đang thử lại...', { id: 'retry-login' });
            const { error } = await signIn(email, password);

            if (error) {
              toast.dismiss('retry-login');
              setErrors({ general: 'Đăng nhập thất bại. Vui lòng thử lại sau.' });
              toast.error('Đăng nhập thất bại');
            } else {
              toast.dismiss('retry-login');
              toast.success('Đăng nhập thành công!');
              navigate('/');
            }
          } catch {
            toast.dismiss('retry-login');
            setErrors({ general: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.' });
            toast.error('Lỗi kết nối');
          } finally {
            setLoading(false);
          }
        }, 1000); // Wait 1 second before retry
        return;
      }

      setErrors({ general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
      toast.error('Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});

    try {
      toast.info('Đang chuyển hướng đến trang đăng nhập Google...', { id: 'google-login' });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.dismiss('google-login');

      if (error.message === 'network_error' || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        setErrors({ general: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.' });
        toast.error('Lỗi kết nối');
      } else {
        toast.error('Không thể đăng nhập bằng Google. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Vui lòng nhập email để đặt lại mật khẩu' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      toast.info('Đang gửi email đặt lại mật khẩu...', { id: 'reset-password' });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.dismiss('reset-password');
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu.');
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.dismiss('reset-password');

      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setErrors({ general: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.' });
        toast.error('Lỗi kết nối');
      } else {
        toast.error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: blobAnimation }} />

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-primary/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-[30%] w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-card rounded-xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
          <div className="px-8 pt-8 pb-6 border-b border-border">
            <h2 className="text-center text-3xl font-extrabold text-foreground">
              {showForgotPassword ? 'Quên mật khẩu' : 'Đăng nhập'}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {showForgotPassword ? (
                'Nhập email của bạn để nhận liên kết đặt lại mật khẩu'
              ) : (
                <>
                  Hoặc{' '}
                  <Link
                    to="/signup"
                    className="inline-flex items-center font-medium text-primary hover:text-primary/90 transition-colors duration-200"
                  >
                    đăng ký tài khoản mới
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="px-8 py-6">
            {!showForgotPassword && (
              <>


                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:translate-y-[-2px]"
                >
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  Đăng nhập bằng Google
                </button>
              </>
            )}

            {!showForgotPassword && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {showForgotPassword ? 'Hoặc' : 'Hoặc đăng nhập bằng email'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form
              className="mt-6 space-y-6"
              onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit}
            >
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.general}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                    {errors.email && (
                      <div className="tooltip ml-1">
                        <HelpCircle className="h-4 w-4 text-red-500" />
                        <span className="tooltiptext">{errors.email}</span>
                      </div>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:z-10 sm:text-sm transition-all duration-200`}
                      placeholder="Email của bạn"
                    />
                  </div>
                </div>

                {!showForgotPassword && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Mật khẩu
                        {errors.password && (
                          <div className="tooltip ml-1">
                            <HelpCircle className="h-4 w-4 text-red-500" />
                            <span className="tooltiptext">{errors.password}</span>
                          </div>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        Quên mật khẩu?
                        <HelpCircle className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
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
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                {showForgotPassword && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:translate-y-[-2px]"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Quay lại
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:translate-y-[-2px]"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      {showForgotPassword ? 'Gửi email' : (
                        <>
                          <LogIn className="h-4 w-4 mr-2" />
                          Đăng nhập
                        </>
                      )}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}