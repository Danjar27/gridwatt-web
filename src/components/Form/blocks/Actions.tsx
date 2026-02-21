import type { ActionsProps } from '../Form.interface';
import type { FC } from 'react';

import { Loader2 } from 'lucide-react';
import Button from '@components/Button/Button.tsx';

const Actions: FC<ActionsProps> = ({ submitLabel, onCancel, isLoading }) => (
    <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
            <Button variant="outline" onClick={onCancel}>
                Cancel
            </Button>
        )}
        <Button type="submit" disabled={isLoading}>
            {submitLabel}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </Button>
    </div>
);

export default Actions;
