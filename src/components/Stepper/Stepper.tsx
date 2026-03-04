import type { StepperProps } from '@components/Stepper/Stepper.interface';
import type { FC } from 'react';

import { CheckCircleIcon } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames.ts';

import Visible from '@components/atoms/Visible';

const Stepper: FC<StepperProps> = ({ steps, currentStep }) => (
    <div className="flex flex-col items-center justify-center">
        <div className="flex items-center">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={classnames(
                                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-200',
                                {
                                    'border-primary-500 bg-primary-500 text-white': isActive,
                                    'border-primary-500 bg-primary-500/20 text-primary-500': isCompleted,
                                    'border-neutral-800 bg-neutral-600 text-neutral-900': !isActive && !isCompleted,
                                }
                            )}
                        >
                            <Visible when={isCompleted}>
                                <CheckCircleIcon size={16} weight="duotone" />
                            </Visible>
                            <Visible when={!isCompleted}>
                                <span>{index + 1}</span>
                            </Visible>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={classnames('mx-3 h-0.5 w-10 transition-colors duration-200 s768:w-20', {
                                    'bg-primary-500': index < currentStep,
                                    'bg-neutral-800': index >= currentStep,
                                })}
                            />
                        )}
                    </div>
                );
            })}
        </div>
        <div className="mt-1.5 flex items-start">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex w-8 justify-center">
                            <span
                                className={classnames('hidden text-center text-xs font-medium s425:block', {
                                    'text-primary-500': isActive || isCompleted,
                                    'text-neutral-900': !isActive && !isCompleted,
                                })}
                            >
                                {step.label}
                            </span>
                        </div>
                        <Visible when={index < steps.length - 1}>
                            <div className="mx-3 w-10 s768:w-20" />
                        </Visible>
                    </div>
                );
            })}
        </div>
    </div>
);

export default Stepper;
