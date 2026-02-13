import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';
import { useTranslations } from 'use-intl';

import Logo from '@components/atoms/Logo.tsx';

interface MobileHeaderProps {
    className?: string;
}

const MobileHeader: FC<MobileHeaderProps> = ({ className }) => {
    const i18n = useTranslations();

    return (
        <header
            className={classnames(
                'items-center justify-center gap-3 bg-neutral-500 border-b border-neutral-800 p-4 sticky top-0',
                className
            )}
        >
            <Logo className="h-8 w-8 text-black dark:text-white" />
            <span className="text-xl font-semibold">{i18n('brand')}</span>
        </header>
    );
};

export default MobileHeader;
