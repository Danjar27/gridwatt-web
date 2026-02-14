import { WifiOff, RefreshCw, RotateCcw, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { useOfflineContext, useOfflineActions } from '@context/offline/context.ts';
import Visible from '@components/atoms/Visible.tsx';
import { useTranslations } from 'use-intl';
import { useEffect, useState } from 'react';

const OfflineIndicator = () => {
    const i18n = useTranslations();
    const { online, pendingCount, isSyncing, lastSyncResult, failedMutations } = useOfflineContext();
    const { syncNow, retryMutation, dismissMutation } = useOfflineActions();
    const [showSyncResult, setShowSyncResult] = useState(false);

    useEffect(() => {
        if (lastSyncResult && lastSyncResult.synced > 0) {
            setShowSyncResult(true);
            const timer = setTimeout(() => setShowSyncResult(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [lastSyncResult]);

    const hasContent = !online || pendingCount > 0 || showSyncResult || failedMutations.length > 0;

    if (!hasContent) {
        return null;
    }

    return (
        <div className="border-b border-secondary-700 bg-secondary-100 px-6 py-2 space-y-2">
            {/* Offline banner */}
            <Visible when={!online}>
                <div className="flex items-center justify-center gap-2 text-sm text-secondary-800">
                    <WifiOff className="h-4 w-4 shrink-0" />
                    <span>{i18n('connection.offline')}</span>
                </div>
            </Visible>

            {/* Pending sync count + sync button */}
            <Visible when={pendingCount > 0}>
                <div className="flex items-center justify-center gap-3 text-sm text-secondary-800">
                    {isSyncing ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4 shrink-0" />
                    )}
                    <span>{i18n('connection.pending', { count: pendingCount })}</span>
                    <Visible when={online && !isSyncing}>
                        <button
                            onClick={syncNow}
                            className="rounded bg-primary-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-primary-600"
                        >
                            {i18n('connection.syncNow')}
                        </button>
                    </Visible>
                </div>
            </Visible>

            {/* Last sync result */}
            <Visible when={showSyncResult && !!lastSyncResult}>
                <div className="flex items-center justify-center gap-2 text-sm text-success-700">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{i18n('connection.synced', { count: lastSyncResult?.synced ?? 0 })}</span>
                </div>
            </Visible>

            {/* Failed mutations */}
            {failedMutations.map((mutation) => (
                <div
                    key={mutation.id}
                    className="flex items-center justify-center gap-3 text-sm text-error-700"
                >
                    <span>
                        {i18n('connection.failedMutation', {
                            action: mutation.action,
                            type: mutation.type,
                        })}
                    </span>
                    <button
                        onClick={() => retryMutation(mutation.id)}
                        className="flex items-center gap-1 rounded bg-secondary-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-secondary-600"
                    >
                        <RotateCcw className="h-3 w-3" />
                        {i18n('connection.retry')}
                    </button>
                    <button
                        onClick={() => dismissMutation(mutation.id)}
                        className="flex items-center gap-1 rounded bg-error-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-error-600"
                    >
                        <Trash2 className="h-3 w-3" />
                        {i18n('connection.dismiss')}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default OfflineIndicator;
