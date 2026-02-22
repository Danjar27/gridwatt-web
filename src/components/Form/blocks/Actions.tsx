import type { ActionsProps } from '../Form.interface';
import type { FC } from 'react';

import { Loader2 } from 'lucide-react';
import Button from '@components/Button/Button';
import { useTranslations } from 'use-intl';

const Actions: FC<ActionsProps> = ({ submitLabel, onCancel, isLoading }) => {
    const i18n = useTranslations();

    return (
        <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                    {i18n('literal.cancel')}
                </Button>
            )}
            <Button type="submit" disabled={isLoading}>
                {submitLabel}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
        </div>
    );
};

export default Actions;
