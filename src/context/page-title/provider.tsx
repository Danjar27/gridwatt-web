import type { FC, PropsWithChildren } from 'react';

import { PageTitleStateCtx, PageTitleActionsCtx } from './context.ts';
import { useState, useMemo } from 'react';

const PageTitleProvider: FC<PropsWithChildren> = ({ children }) => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');

    const state = useMemo(() => ({ title, subtitle }), [title, subtitle]);

    const actions = useMemo(() => ({ setTitle, setSubtitle }), []);

    return (
        <PageTitleStateCtx value={state}>
            <PageTitleActionsCtx value={actions}>{children}</PageTitleActionsCtx>
        </PageTitleStateCtx>
    );
};

export default PageTitleProvider;
