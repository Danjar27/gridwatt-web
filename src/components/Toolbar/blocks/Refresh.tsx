import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useOfflineContext } from '@context/offline/context.ts';
import { clearCache } from '@lib/offline-store';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

const Refresh = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();
    const { online } = useOfflineContext();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!online || isRefreshing) {
            return;
        }

        setIsRefreshing(true);
        try {
            await clearCache();
            await queryClient.invalidateQueries();
            await queryClient.refetchQueries({ type: 'active' });
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <button
            className="cursor-pointer p-2 flex justify-center items-center rounded-lg text-neutral-900 hover:bg-neutral-500 hover:text-black dark:hover:text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleRefresh}
            disabled={!online || isRefreshing}
            title={i18n('literal.refresh')}
        >
            <ArrowsClockwiseIcon
                width={24}
                height={24}
                weight="duotone"
                className={isRefreshing ? 'animate-spin' : ''}
            />
        </button>
    );
};

export default Refresh;
