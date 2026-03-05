import type { FC } from 'react';

import { useFormContext, useWatch } from 'react-hook-form';
import { useRef } from 'react';

interface SliderRangeProps {
    fromName: string;
    toName: string;
    min?: number;
    max?: number;
    step?: number;
    rules?: Record<string, unknown>;
}

/**
 * Dual-thumb range slider that registers two form values (fromName / toName)
 * with react-hook-form. Styled to match the rest of the application.
 */
const SliderRange: FC<SliderRangeProps> = ({
    fromName,
    toName,
    min = 1,
    max = 10000,
    step = 1,
    rules,
}) => {
    const { register, setValue, control } = useFormContext();
    const fromValue = (useWatch({ control, name: fromName }) as number) ?? min;
    const toValue = (useWatch({ control, name: toName }) as number) ?? max;

    // Register both fields so react-hook-form tracks them
    // Discard onChange from register since we handle value updates with setValue
    const { ref: fromRef, onChange: _fromOnChange, ...fromRest } = register(fromName, {
        valueAsNumber: true,
        ...rules,
    });
    const { ref: toRef, onChange: _toOnChange, ...toRest } = register(toName, {
        valueAsNumber: true,
        ...rules,
    });

    const internalFromRef = useRef<HTMLInputElement | null>(null);
    const internalToRef = useRef<HTMLInputElement | null>(null);

    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Math.min(Number(e.target.value), toValue - step);
        setValue(fromName, v, { shouldValidate: true });
    };

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Math.max(Number(e.target.value), fromValue + step);
        setValue(toName, v, { shouldValidate: true });
    };

    // percentage helpers for the fill track
    const pct = (v: number) => ((v - min) / (max - min)) * 100;

    return (
        <div className="space-y-3">
            {/* Track + thumbs */}
            <div className="relative h-5 flex items-center">
                {/* Base track */}
                <div className="absolute w-full h-1.5 rounded-full bg-neutral-700" />
                {/* Active fill */}
                <div
                    className="absolute h-1.5 rounded-full bg-primary-500"
                    style={{
                        left: `${pct(fromValue)}%`,
                        width: `${pct(toValue) - pct(fromValue)}%`,
                    }}
                />

                {/* FROM thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={fromValue}
                    onChange={handleFromChange}
                    ref={(el) => {
                        internalFromRef.current = el;
                        fromRef(el);
                    }}
                    {...fromRest}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none
                               [&::-webkit-slider-thumb]:pointer-events-auto
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:h-4
                               [&::-webkit-slider-thumb]:w-4
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-primary-500
                               [&::-webkit-slider-thumb]:border-2
                               [&::-webkit-slider-thumb]:border-primary-300
                               [&::-webkit-slider-thumb]:cursor-pointer
                               [&::-webkit-slider-thumb]:shadow
                               [&::-moz-range-thumb]:pointer-events-auto
                               [&::-moz-range-thumb]:appearance-none
                               [&::-moz-range-thumb]:h-4
                               [&::-moz-range-thumb]:w-4
                               [&::-moz-range-thumb]:rounded-full
                               [&::-moz-range-thumb]:bg-primary-500
                               [&::-moz-range-thumb]:border-2
                               [&::-moz-range-thumb]:border-primary-300
                               [&::-moz-range-thumb]:cursor-pointer"
                    style={{ zIndex: fromValue > max - step ? 5 : 3 }}
                />

                {/* TO thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={toValue}
                    onChange={handleToChange}
                    ref={(el) => {
                        internalToRef.current = el;
                        toRef(el);
                    }}
                    {...toRest}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none
                               [&::-webkit-slider-thumb]:pointer-events-auto
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:h-4
                               [&::-webkit-slider-thumb]:w-4
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-primary-500
                               [&::-webkit-slider-thumb]:border-2
                               [&::-webkit-slider-thumb]:border-primary-300
                               [&::-webkit-slider-thumb]:cursor-pointer
                               [&::-webkit-slider-thumb]:shadow
                               [&::-moz-range-thumb]:pointer-events-auto
                               [&::-moz-range-thumb]:appearance-none
                               [&::-moz-range-thumb]:h-4
                               [&::-moz-range-thumb]:w-4
                               [&::-moz-range-thumb]:rounded-full
                               [&::-moz-range-thumb]:bg-primary-500
                               [&::-moz-range-thumb]:border-2
                               [&::-moz-range-thumb]:border-primary-300
                               [&::-moz-range-thumb]:cursor-pointer"
                    style={{ zIndex: 4 }}
                />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-neutral-400">
                <span>{min}</span>
                <span>{max}</span>
            </div>

            {/* Value badges */}
            <div className="flex items-center justify-center gap-3 text-sm">
                <div className="rounded border border-neutral-600 bg-neutral-700 px-3 py-1 font-mono text-neutral-200">
                    {fromValue}
                </div>
                <span className="text-neutral-800">—</span>
                <div className="rounded border border-neutral-600 bg-neutral-700 px-3 py-1 font-mono text-neutral-200">
                    {toValue}
                </div>
            </div>
        </div>
    );
};

export default SliderRange;
