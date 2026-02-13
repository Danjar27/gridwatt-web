import type { FC } from 'react';
import { Loader2 } from 'lucide-react';
import type { ActionsProps } from '../Form.interface';

const Actions: FC<ActionsProps> = ({ submitLabel, onCancel, isLoading }) => (
    <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Cancel
            </button>
        )}
        <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
        </button>
    </div>
);

export default Actions;
