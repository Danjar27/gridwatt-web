import './styles/globals.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@lib/query-client';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'use-intl';
import { StrictMode } from 'react';

import AuthProvider from '@context/auth/provider';
import Router from '@components/Router/Router.tsx';
import spanish from '@i18n/es.json';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <IntlProvider messages={spanish} locale="es">
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={Router} />
                </AuthProvider>
            </QueryClientProvider>
        </IntlProvider>
    </StrictMode>
);
