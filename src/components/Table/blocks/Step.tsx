import { classnames } from '@utils/classnames.ts';
import type { FC } from 'react';

interface StepProps {
    value: string | number;
    onClick: (value: number) => void;
    selected?: boolean;
}

const Step: FC<StepProps> = ({ value, onClick, selected: isSelected }) => {
    const handleSelect = () => {
        if (typeof value === 'number') {
            return onClick(value);
        }
    };

    if (typeof value === 'string') {
        return <span className="px-1 text-xs font-bold select-none opacity-40">...</span>;
    }

    return (
        <button
            onClick={handleSelect}
            className={classnames('px-2 text-xs font-bold cursor-pointer select-none', {
                'opacity-40': !isSelected,
            })}
        >
            {value + 1}
        </button>
    );
};

export default Step;
