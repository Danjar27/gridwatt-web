import { Link, useLocation } from 'react-router-dom';
import { CaretRightIcon } from '@phosphor-icons/react';
import { useTranslations } from 'use-intl';

const ROUTE_LABEL_KEYS: Record<string, string> = {
    dashboard: 'routes.dashboard',
    orders: 'routes.orders',
    jobs: 'routes.jobs',
    materials: 'routes.materials',
    activities: 'routes.activities',
    seals: 'routes.seals',
    users: 'routes.users',
    tenants: 'routes.tenants',
    profile: 'routes.profile',
};

function isId(segment: string): boolean {
    return /^\d+$/.test(segment) || /^[a-f0-9-]{8,}$/.test(segment);
}

const Breadcrumb = () => {
    const location = useLocation();
    const i18n = useTranslations();

    const segments = location.pathname.split('/').filter(Boolean);

    if (segments.length <= 1) {
        return null;
    }

    const crumbs = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;

        let label: string;
        if (ROUTE_LABEL_KEYS[segment]) {
            label = i18n(ROUTE_LABEL_KEYS[segment] as Parameters<typeof i18n>[0]);
        } else if (isId(segment)) {
            label = `#${segment}`;
        } else {
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }

        return { path, label, isLast };
    });

    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 flex-wrap">
                {crumbs.map((crumb, index) => (
                    <li key={crumb.path} className="flex items-center gap-1">
                        {index > 0 && <CaretRightIcon size={11} className="text-neutral-800 shrink-0" />}
                        {crumb.isLast ? (
                            <span className="text-xs font-medium text-black dark:text-white">{crumb.label}</span>
                        ) : (
                            <Link
                                to={crumb.path}
                                className="text-xs text-neutral-900 hover:text-primary-500 transition-colors duration-200"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
