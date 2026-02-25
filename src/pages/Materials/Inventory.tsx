import { PackageIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useInventoryActions } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import ViewTable from '@pages/Materials/tables/View';
import Create from '@pages/Materials/forms/Create';
import Update from '@pages/Materials/forms/Update';
import Delete from '@pages/Materials/forms/Delete';
import Summary from '@components/Summary/Summary';
import Button from '@components/Button/Button';

const Inventory = () => {
    const i18n = useTranslations();
    const { openCreate } = useInventoryActions();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button icon={PlusCircleIcon} onClick={openCreate}>
                    {i18n('pages.materials.action')}
                </Button>
            </div>

            <Summary
                icon={PackageIcon}
                title={i18n('pages.materials.summary.title')}
                subtitle={i18n('pages.materials.summary.subtitle')}
            >
                <ViewTable />
            </Summary>

            <Create />
            <Update />
            <Delete />
        </div>
    );
};

export default Inventory;
