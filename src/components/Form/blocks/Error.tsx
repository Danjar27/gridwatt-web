import type { FC } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
    message: string | null | undefined;
}

const FormError: FC<ErrorProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{message}</p>
        </div>
    );
};

export default FormError;
