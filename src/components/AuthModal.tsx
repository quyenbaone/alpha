import { X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { signIn, signUp, signInWithGoogle } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email hoặc mật khẩu không đúng');
          } else if (error.message.includes('connection')) {
            setError('Lỗi kết nối. Vui lòng kiểm tra mạng của bạn');
          } else {
            setError(error.message || 'Đăng nhập thất bại');
          }
          return;
        }
        toast.success('Đăng nhập thành công');
        onClose();
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Email này đã được đăng ký');
          } else if (error.message.includes('connection')) {
            setError('Lỗi kết nối. Vui lòng kiểm tra mạng của bạn');
          } else {
            setError(error.message || 'Đăng ký thất bại');
          }
          return;
        }
        toast.success('Đăng ký thành công, vui lòng kiểm tra email để xác nhận tài khoản');
        onClose();
      }
    } catch (error: any) {
      setError(error.message || (mode === 'signin' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message || 'Đăng nhập với Google thất bại');
      }
    } catch (error: any) {
      setError(error.message || 'Đăng nhập với Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Họ tên
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading
              ? 'Đang xử lý...'
              : mode === 'signin'
                ? 'Đăng nhập'
                : 'Đăng ký'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <img
                className="h-5 w-5"
                src="/google.svg"
                alt="Google"
              />
              <span className="ml-2">Google</span>
            </button>

            <button
              type="button"
              disabled
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 opacity-50 cursor-not-allowed"
            >
              <img
                className="h-5 w-5"
                src="/facebook.svg"
                alt="Facebook"
              />
              <span className="ml-2">Facebook</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => onClose()}
                className="font-medium text-orange-500 hover:text-orange-600"
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                onClick={() => onClose()}
                className="font-medium text-orange-500 hover:text-orange-600"
              >
                Đăng nhập
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}