import { memo } from 'react';

export const LoadingComponent = memo(() => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <h2 className="text-xl font-semibold text-gray-700">Đang tải...</h2>
        </div>
    </div>
)); 