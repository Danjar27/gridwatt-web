import { PackageIcon, PlusCircleIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useInventoryActions } from './utils/context.ts';
import { importMaterials } from '@lib/api/materials.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import SimpleImportModal from '@components/Import/SimpleImportModal';
import ViewTable from '@pages/Materials/tables/View';
import Create from '@pages/Materials/forms/Create';
import Update from '@pages/Materials/forms/Update';
import Delete from '@pages/Materials/forms/Delete';
import Assign from '@pages/Materials/forms/Assign';
import Summary from '@components/Summary/Summary';
import Button from '@components/Button/Button';

const Inventory = () => {
    const i18n = useTranslations();
    const { openCreate } = useInventoryActions();
    const [isImportOpen, setImportOpen] = useState(false);
    const [isAssignOpen, setAssignOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button icon={UploadSimpleIcon} variant="outline" onClick={() => setImportOpen(true)}>
                        {i18n('pages.materials.import')}
                    </Button>
                    <Button icon={PlusCircleIcon} onClick={openCreate}>
                        {i18n('pages.materials.action')}
                    </Button>
                </div>
            </div>

            <Summary
                icon={PackageIcon}
                title={i18n('pages.materials.summary.title')}
                subtitle={i18n('pages.materials.summary.subtitle')}
            >
                <ViewTable onAssign={() => setAssignOpen(true)} />
            </Summary>

            <Create />
            <Update />
            <Delete />
            <Assign isOpen={isAssignOpen} onClose={() => setAssignOpen(false)} />
            <SimpleImportModal
                isOpen={isImportOpen}
                onClose={() => setImportOpen(false)}
                title={i18n('pages.materials.import')}
                queryKey="materials"
                mutationFn={importMaterials}
            />
        </div>
    );
};

export default Inventory;

