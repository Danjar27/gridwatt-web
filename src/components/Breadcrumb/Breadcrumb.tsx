import type { BreadcrumbProps } from './Breadcrumb.interface';
import type { FC } from 'react';

import { CaretRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1 bg-neutral-600 rounded-md px-2.5 py-1">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={item.href} className="flex items-center gap-1">
                            {index > 0 && (
                                <CaretRightIcon size={9} weight="bold" className="text-neutral-800 shrink-0" />
                            )}
                            {isLast ? (
                                <span className="text-xs font-medium text-primary-500 dark:text-white">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="text-xs text-neutral-800 hover:text-neutral-900 transition-colors duration-150"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
