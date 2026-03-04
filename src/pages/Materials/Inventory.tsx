import { PackageIcon, PlusCircleIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { previewMaterialsImport, commitMaterialsImport } from '@lib/api/materials.ts';
import { useInventoryActions } from './utils/context.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import FullImportModal from '@components/Import/FullImportModal';
import ToolbarButton from '@components/PageToolbar/ToolbarButton';
import ToolbarDivider from '@components/PageToolbar/ToolbarDivider';
import PageToolbar from '@components/PageToolbar/PageToolbar';
import ViewTable from '@pages/Materials/tables/View';
import Create from '@pages/Materials/forms/Create';
import Update from '@pages/Materials/forms/Update';
import Delete from '@pages/Materials/forms/Delete';
import Assign from '@pages/Materials/forms/Assign';
import Summary from '@components/Summary/Summary';
import Ingress from './forms/Ingress';

const MATERIAL_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'unit', label: 'Unidad' },
];

const Inventory = () => {
    const i18n = useTranslations();
    const { openCreate } = useInventoryActions();
    const [isImportOpen, setImportOpen] = useState(false);
    const [isAssignOpen, setAssignOpen] = useState(false);
    const [isIngressOpen, setIngressOpen] = useState(false);

    return (
        <div className="space-y-6">
            <PageToolbar>
                <ToolbarButton icon={PlusCircleIcon} variant="primary" onClick={openCreate}>
                    {i18n('pages.materials.action')}
                </ToolbarButton>
                <ToolbarDivider />
                <ToolbarButton icon={UploadSimpleIcon} onClick={() => setImportOpen(true)}>
                    {i18n('pages.materials.import')}
                </ToolbarButton>
            </PageToolbar>

            <Summary
                icon={PackageIcon}
                title={i18n('pages.materials.summary.title')}
                subtitle={i18n('pages.materials.summary.subtitle')}
            >
                <ViewTable onAssign={() => setAssignOpen(true)} onIngress={() => setIngressOpen(true)} />
            </Summary>

            <Create />
            <Update />
            <Delete />
            <Assign isOpen={isAssignOpen} onClose={() => setAssignOpen(false)} />
            <Ingress isOpen={isIngressOpen} onClose={() => setIngressOpen(false)} />
            <FullImportModal
                isOpen={isImportOpen}
                onClose={() => setImportOpen(false)}
                title={i18n('pages.materials.import')}
                queryKey="materials"
                columns={MATERIAL_COLUMNS}
                previewFn={previewMaterialsImport}
                commitFn={(rows) => commitMaterialsImport(rows as Array<{ id: string; name: string; unit: string }>)}
            />
        </div>
    );
};

export default Inventory;
