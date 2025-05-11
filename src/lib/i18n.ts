interface Translation {
    [key: string]: string | Translation;
}

interface I18nConfig {
    defaultLocale: string;
    fallbackLocale: string;
    translations: Record<string, Translation>;
}

class I18nService {
    private static instance: I18nService;
    private config: I18nConfig;
    private currentLocale: string;

    private constructor(config: I18nConfig) {
        this.config = config;
        this.currentLocale = config.defaultLocale;
    }

    static getInstance(config?: I18nConfig): I18nService {
        if (!I18nService.instance && config) {
            I18nService.instance = new I18nService(config);
        }
        return I18nService.instance;
    }

    setLocale(locale: string): void {
        if (this.config.translations[locale]) {
            this.currentLocale = locale;
            document.documentElement.lang = locale;
            localStorage.setItem('locale', locale);
        } else {
            console.warn(`Locale ${locale} not found, falling back to ${this.config.fallbackLocale}`);
            this.currentLocale = this.config.fallbackLocale;
        }
    }

    getLocale(): string {
        return this.currentLocale;
    }

    t(key: string, params?: Record<string, string | number>): string {
        const keys = key.split('.');
        let translation: any = this.config.translations[this.currentLocale];

        // Navigate through the translation object
        for (const k of keys) {
            if (translation && typeof translation === 'object') {
                translation = translation[k];
            } else {
                // Fallback to default locale if translation not found
                translation = this.config.translations[this.config.fallbackLocale];
                for (const fallbackKey of keys) {
                    if (translation && typeof translation === 'object') {
                        translation = translation[fallbackKey];
                    } else {
                        return key; // Return the key if translation not found
                    }
                }
                break;
            }
        }

        if (typeof translation !== 'string') {
            return key;
        }

        // Replace parameters in translation
        if (params) {
            return translation.replace(/\{(\w+)\}/g, (match, key) => {
                return params[key]?.toString() || match;
            });
        }

        return translation;
    }

    formatDate(date: Date | string | number): string {
        const d = new Date(date);
        return new Intl.DateTimeFormat(this.currentLocale).format(d);
    }

    formatNumber(number: number): string {
        return new Intl.NumberFormat(this.currentLocale).format(number);
    }

    formatCurrency(amount: number, currency: string = 'VND'): string {
        return new Intl.NumberFormat(this.currentLocale, {
            style: 'currency',
            currency,
        }).format(amount);
    }

    formatRelativeTime(date: Date | string | number): string {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return rtf.format(-days, 'day');
        if (hours > 0) return rtf.format(-hours, 'hour');
        if (minutes > 0) return rtf.format(-minutes, 'minute');
        return rtf.format(-seconds, 'second');
    }
}

// Example translations
const translations = {
    vi: {
        common: {
            loading: 'Đang tải...',
            error: 'Đã xảy ra lỗi',
            success: 'Thành công',
            save: 'Lưu',
            cancel: 'Hủy',
            delete: 'Xóa',
            edit: 'Sửa',
            search: 'Tìm kiếm',
        },
        auth: {
            login: 'Đăng nhập',
            register: 'Đăng ký',
            logout: 'Đăng xuất',
            email: 'Email',
            password: 'Mật khẩu',
            confirmPassword: 'Xác nhận mật khẩu',
        },
        equipment: {
            title: 'Thiết bị',
            add: 'Thêm thiết bị',
            edit: 'Sửa thiết bị',
            delete: 'Xóa thiết bị',
            price: 'Giá',
            category: 'Danh mục',
            status: 'Trạng thái',
        },
    },
    en: {
        common: {
            loading: 'Loading...',
            error: 'An error occurred',
            success: 'Success',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
        },
        auth: {
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
        },
        equipment: {
            title: 'Equipment',
            add: 'Add Equipment',
            edit: 'Edit Equipment',
            delete: 'Delete Equipment',
            price: 'Price',
            category: 'Category',
            status: 'Status',
        },
    },
};

export const i18n = I18nService.getInstance({
    defaultLocale: 'vi',
    fallbackLocale: 'en',
    translations,
}); 