import './styles/globals.css';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { RouterProvider } from 'react-router-dom';
import { queryClient, persister } from '@lib/query-client';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'use-intl';
import { StrictMode } from 'react';

import AuthProvider from '@context/auth/provider';
import Router from '@components/Router/Router.tsx';
import spanish from '@i18n/es.json';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <IntlProvider messages={spanish} locale="es">
            <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}>
                <AuthProvider>
                    <RouterProvider router={Router} />
                </AuthProvider>
            </PersistQueryClientProvider>
        </IntlProvider>
    </StrictMode>
);
