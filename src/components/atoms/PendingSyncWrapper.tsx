import type { ReactNode } from 'react';
import { CloudOff } from 'lucide-react';

interface Props {
    children: ReactNode;
    pending: boolean;
}

export function PendingSyncWrapper({ children, pending }: Props) {
    if (!pending) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            <div className="border-2 border-dashed border-secondary-500 rounded-lg">{children}</div>
            <div className="absolute inset-1 flex items-start justify-end pointer-events-none">
                <div className="flex items-center gap-1 bg-secondary-500 text-white rounded-full px-2 py-0.5 text-xs">
                    <CloudOff className="h-3 w-3" />
                    Pending sync
                </div>
            </div>
        </div>
    );
}
