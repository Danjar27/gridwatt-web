import type { SummaryProps } from '@components/Summary/Summary.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';

const Summary: FC<PropsWithChildren<SummaryProps>> = ({ title, subtitle, icon: Icon, children, legend, className }) => (
    <div className={classnames('rounded-lg border border-neutral-800 overflow-hidden', className)}>
        <div className="flex flex-col s425:flex-row justify-between items-start s425:items-center gap-2 s425:gap-5 border-b border-neutral-800 bg-neutral-600/60 px-3 py-2 s768:px-6">
            <div className="flex justify-between items-center gap-3 s425:gap-5">
                {Icon && (
                    <Icon
                        width={32}
                        height={32}
                        className="rounded-lg border border-neutral-800 text-neutral-800 p-1"
                    />
                )}
                <div className="flex flex-col">
                    <h3 className="font-semibold">{title}</h3>
                    <span className="text-xs text-neutral-900">{subtitle}</span>
                </div>
            </div>
            {legend && <span className="text-xs text-neutral-900">{legend}</span>}
        </div>
        <div className="px-3 py-2 s768:px-6">{children}</div>
    </div>
);

export default Summary;
