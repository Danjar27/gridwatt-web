import { SealIcon, PlusCircleIcon, ListPlusIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useInventoryActions } from './utils/context.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import ToolbarButton from '@components/PageToolbar/ToolbarButton';
import PageToolbar from '@components/PageToolbar/PageToolbar';
import ViewTable from '@pages/Seals/tables/View';
import Create from '@pages/Seals/forms/Create';
import Update from '@pages/Seals/forms/Update';
import Delete from '@pages/Seals/forms/Delete';
import CreateRange from '@pages/Seals/forms/CreateRange';
import Assign from '@pages/Seals/forms/Assign';
import AssignMultiple from '@pages/Seals/forms/AssignMultiple';
import Summary from '@components/Summary/Summary';

const Inventory = () => {
    const i18n = useTranslations();
    const { openCreate } = useInventoryActions();
    const [isRangeOpen, setRangeOpen] = useState(false);
    const [isAssignOpen, setAssignOpen] = useState(false);
    const [isAssignMultipleOpen, setAssignMultipleOpen] = useState(false);

    return (
        <div className="space-y-6">
            <PageToolbar>
                <ToolbarButton icon={PlusCircleIcon} variant="primary" onClick={openCreate}>
                    {i18n('pages.seals.action')}
                </ToolbarButton>
                <ToolbarButton icon={ListPlusIcon} onClick={() => setRangeOpen(true)}>
                    {i18n('pages.seals.range')}
                </ToolbarButton>
                <ToolbarButton icon={UsersThreeIcon} onClick={() => setAssignMultipleOpen(true)}>
                    {i18n('pages.seals.assignMultiple')}
                </ToolbarButton>
            </PageToolbar>

            <Summary
                icon={SealIcon}
                title={i18n('pages.seals.summary.title')}
                subtitle={i18n('pages.seals.summary.subtitle')}
            >
                <ViewTable onAssign={() => setAssignOpen(true)} />
            </Summary>

            <Create />
            <Update />
            <Delete />
            <CreateRange isOpen={isRangeOpen} onClose={() => setRangeOpen(false)} />
            <Assign isOpen={isAssignOpen} onClose={() => setAssignOpen(false)} />
            <AssignMultiple isOpen={isAssignMultipleOpen} onClose={() => setAssignMultipleOpen(false)} />
        </div>
    );
};

export default Inventory;
