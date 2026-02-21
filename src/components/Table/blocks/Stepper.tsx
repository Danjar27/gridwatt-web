import type { StepperProps } from '@components/Table/Table.interface.ts';
import type { FC } from 'react';

import { calculateVisibleSteps } from '@components/Table/utils/pagination.ts';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import Step from '@components/Table/blocks/Step.tsx';

const Stepper: FC<StepperProps> = ({ selected, total, onSelect, onNext, onPrevious, hasNext, hasPrevious }) => {
    const steps = calculateVisibleSteps(selected, total);

    return (
        <div className="flex items-center gap-1 text-primary-500 dark:text-white">
            <button onClick={onPrevious} disabled={!hasPrevious} className="disabled:opacity-20 cursor-pointer">
                <CaretLeftIcon weight="fill" width={16} height={16} />
            </button>

            {steps.map((page, index) => (
                <Step key={index} value={page} onClick={onSelect} selected={page === selected} />
            ))}

            <button onClick={onNext} disabled={!hasNext} className="disabled:opacity-20 cursor-pointer">
                <CaretRightIcon weight="fill" width={16} height={16} />
            </button>
        </div>
    );
};

export default Stepper;
