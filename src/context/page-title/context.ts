import { createContext, useContext } from 'react';

interface PageTitleState {
    title: string;
    subtitle: string;
}

interface PageTitleActions {
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
}

export const PageTitleStateCtx = createContext<PageTitleState>({
    title: '',
    subtitle: '',
});

export const PageTitleActionsCtx = createContext<PageTitleActions>({
    setTitle: () => {},
    setSubtitle: () => {},
});

export const usePageTitle = () => useContext(PageTitleStateCtx);

export const usePageTitleActions = () => useContext(PageTitleActionsCtx);
