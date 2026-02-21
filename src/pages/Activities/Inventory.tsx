import { ClipboardIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useInventoryActions, useInventoryContext } from '@context/Inventory/context.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@context/auth/context.ts';
import { apiClient } from '@lib/api-client.ts';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';

import Update from '@pages/Activities/forms/Update.tsx';
import Summary from '@components/Summary/Summary.tsx';
import Button from '@components/Button/Button.tsx';
import Create from '@pages/Activities/forms/Create.tsx';
import Page from '@layouts/Page.tsx';
import ViewTable from '@pages/Activities/tables/View.tsx';

const Inventory = () => {
    const i18n = useTranslations();

    const { isUpdateOpen, isCreateOpen } = useInventoryContext();
    const { openCreate, openUpdate, closeCreate, closeUpdate } = useInventoryActions();
    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const [error, setError] = useState<string | null>(null);

    if (user?.role?.name === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const closeSession = () => {
        setError(null);
    };

    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => apiClient.toggleActivityActive(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
        onError: (err: any) => setError(err.message || 'Failed to toggle activity status'),
    });

    return (
        <Page id="activities" title={i18n('pages.activities.title')} subtitle={i18n('pages.activities.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button icon={PlusCircleIcon} onClick={openCreate}>
                        {i18n('pages.activities.action')}
                    </Button>
                </div>

                <Summary
                    icon={ClipboardIcon}
                    title={i18n('pages.activities.summary.title')}
                    subtitle={i18n('pages.activities.summary.subtitle')}
                >
                    <ViewTable />
                </Summary>
                <Create
                    isOpen={isCreateOpen}
                    open={openCreate}
                    close={closeCreate}
                    onCancel={closeSession}
                    onSubmit={closeSession}
                />
                <Update
                    isOpen={isUpdateOpen}
                    open={openUpdate}
                    close={closeUpdate}
                    onCancel={closeSession}
                    onSubmit={closeSession}
                />
            </div>
        </Page>
    );
};

export default Inventory;
