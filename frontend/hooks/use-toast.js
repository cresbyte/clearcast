import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

export const useToast = () => {
    const toast = useCallback(({ title, description, variant = 'default' }) => {
        if (variant === 'destructive') {
            sonnerToast.error(title, {
                description: description,
            });
        } else {
            sonnerToast.success(title, {
                description: description,
            });
        }
    }, []);

    return { toast };
};
