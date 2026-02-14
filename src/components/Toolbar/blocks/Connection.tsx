import { Cloud, CloudAlert, RefreshCw } from 'lucide-react';
import { useOfflineContext } from '@context/offline/context.ts';
import { useTranslations } from 'use-intl';
import { classnames } from '@utils/classnames.ts';

import Visible from '@components/atoms/Visible.tsx';

const Connection = () => {
    const i18n = useTranslations();
    const { online, pendingCount, isSyncing } = useOfflineContext();

    const needsToSync = pendingCount > 0;

    return (
        <div
            className={classnames('border p-2 flex justify-center items-center rounded-lg text-neutral-500', {
                'bg-success-500': online && !needsToSync,
                'bg-secondary-500': online && needsToSync,
                'bg-error-500': !online,
            })}
        >
            <div className="flex items-center justify-center gap-2 text-sm text-secondary-800 dark:text-white">
                <Visible when={online && !needsToSync}>
                    <Cloud />
                </Visible>
                <Visible when={!online}>
                    <CloudAlert />
                </Visible>
                <Visible when={online && needsToSync}>
                    <RefreshCw className={isSyncing ? 'animate-spin' : ''} />
                    <span>{i18n('toolbar.syncing')}</span>
                </Visible>
            </div>
        </div>
    );
};

export default Connection;
