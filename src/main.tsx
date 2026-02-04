import './styles/globals.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@lib/query-client';
import { router } from './router';
import { IntlProvider } from 'use-intl';

import AuthProvider from '@context/auth/provider';
import spanish from '@i18n/es.json';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((error) => {
            console.error('SW registration failed:', error);
        });
    });
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <IntlProvider messages={spanish} locale="es">
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </IntlProvider>
    </StrictMode>
);
