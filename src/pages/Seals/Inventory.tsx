import { SealIcon, PlusCircleIcon, ListPlusIcon } from '@phosphor-icons/react';
import { useInventoryActions } from './utils/context.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import ViewTable from '@pages/Seals/tables/View';
import Create from '@pages/Seals/forms/Create';
import Update from '@pages/Seals/forms/Update';
import Delete from '@pages/Seals/forms/Delete';
import CreateRange from '@pages/Seals/forms/CreateRange';
import Assign from '@pages/Seals/forms/Assign';
import Summary from '@components/Summary/Summary';
import Button from '@components/Button/Button';

const Inventory = () => {
    const i18n = useTranslations();
    const { openCreate } = useInventoryActions();
    const [isRangeOpen, setRangeOpen] = useState(false);
    const [isAssignOpen, setAssignOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button icon={ListPlusIcon} variant="outline" onClick={() => setRangeOpen(true)}>
                        {i18n('pages.seals.range')}
                    </Button>
                    <Button icon={PlusCircleIcon} onClick={openCreate}>
                        {i18n('pages.seals.action')}
                    </Button>
                </div>
            </div>

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
        </div>
    );
};

export default Inventory;

