import { ClipboardIcon, PlusCircleIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { previewActivitiesImport, commitActivitiesImport } from '@lib/api/activities.ts';
import { useInventoryActions } from './utils/context.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import FullImportModal from '@components/Import/FullImportModal';
import ToolbarButton from '@components/PageToolbar/ToolbarButton';
import PageToolbar from '@components/PageToolbar/PageToolbar';
import ViewTable from '@pages/Activities/tables/View';
import Create from '@pages/Activities/forms/Create';
import Update from '@pages/Activities/forms/Update';
import Delete from '@pages/Activities/forms/Delete';
import Summary from '@components/Summary/Summary';

const ACTIVITY_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'contractPrice', label: 'Precio contractual' },
    { key: 'technicianPrice', label: 'Precio técnico' },
];

const Inventory = () => {
    const i18n = useTranslations();

    const { openCreate } = useInventoryActions();
    const { user } = useAuthContext();
    const [isImportOpen, setImportOpen] = useState(false);

    if (user?.role?.name === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6">
            <PageToolbar>
                <ToolbarButton icon={PlusCircleIcon} variant="primary" onClick={openCreate}>
                    {i18n('pages.activities.action')}
                </ToolbarButton>
                <ToolbarButton icon={UploadSimpleIcon} onClick={() => setImportOpen(true)}>
                    {i18n('pages.activities.import')}
                </ToolbarButton>
            </PageToolbar>

            <Summary
                icon={ClipboardIcon}
                title={i18n('pages.activities.summary.title')}
                subtitle={i18n('pages.activities.summary.subtitle')}
            >
                <ViewTable />
            </Summary>

            <Create />
            <Update />
            <Delete />
            <FullImportModal
                isOpen={isImportOpen}
                onClose={() => setImportOpen(false)}
                title={i18n('pages.activities.import')}
                queryKey="activities"
                columns={ACTIVITY_COLUMNS}
                previewFn={previewActivitiesImport}
                commitFn={(rows) =>
                    commitActivitiesImport(
                        rows as Array<{ id: string; name: string; contractPrice?: number; technicianPrice?: number }>
                    )
                }
            />
        </div>
    );
};

export default Inventory;
