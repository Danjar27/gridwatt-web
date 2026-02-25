import { WifiSlashIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useOfflineContext } from '@context/offline/context.ts';
import { useTranslations } from 'use-intl';
import { classnames } from '@utils/classnames.ts';

import Visible from '@components/atoms/Visible';

const Connection = () => {
    const i18n = useTranslations();
    const { online, pendingCount } = useOfflineContext();

    const needsToSync = pendingCount > 0;

    return (
        <div
            className={classnames(
                'border px-4 py-2 flex justify-center items-center rounded-lg select-none cursor-auto text-xs',
                {
                    hidden: online && !needsToSync,
                    'border-secondary-500 text-secondary-500': online && needsToSync,
                    'border-error-500 text-error-500': !online,
                }
            )}
        >
            <div className="flex items-center justify-center gap-2">
                <Visible when={!online}>
                    <WifiSlashIcon width={20} height={20} weight="duotone" />
                    <span>{i18n('connection.offline')}</span>
                </Visible>
                <Visible when={online && needsToSync}>
                    <ArrowsClockwiseIcon width={20} height={20} className="animate-spin" />
                    <span>{i18n('connection.syncing')}</span>
                </Visible>
            </div>
        </div>
    );
};

export default Connection;
