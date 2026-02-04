import { WifiOff, AlertCircle } from 'lucide-react';
import { useOfflineContext } from '@context/offline/context.ts';
import Visible from '@components/atoms/Visible.tsx';
import { useTranslations } from 'use-intl';

const OfflineIndicator = () => {
    const i18n = useTranslations();
    const { online, pendingCount } = useOfflineContext();

    if (online && pendingCount === 0) {
        return null;
    }

    return (
        <div className="border-b border-secondary-700 bg-secondary-100 px-6 py-2">
            <div className="flex items-center justify-center gap-2 text-sm text-secondary-800">
                <Visible when={!online}>
                    <WifiOff className="h-4 w-4 shrink-0 mr-2" />
                    <span>{i18n('connection.offline')}</span>
                </Visible>
                <Visible when={online && pendingCount > 0}>
                    <AlertCircle className="h-4 w-4 shrink-0 mr-2" />
                    <span>{i18n('connection.pending')}</span>
                </Visible>
            </div>
        </div>
    );
};

export default OfflineIndicator;
