import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { getMaterialStats } from '@lib/api/materials.ts';

const SKELETON_ROWS = 4;

const MaterialStatsWidget = () => {
    const i18n = useTranslations();

    const { data = [], isLoading } = useQuery({
        queryKey: ['materials', 'stats'],
        queryFn: getMaterialStats,
    });

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-neutral-800">
                <span className="flex-1 text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.stats')}
                </span>
                <span className="w-16 text-right text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.bodega')}
                </span>
                <span className="w-16 text-right text-xs font-medium text-primary-500 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.bodegaFisica')}
                </span>
                <span className="w-16 text-right text-xs font-medium text-secondary-500 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.bodegaTecnicos')}
                </span>
            </div>

            {isLoading && (
                <div className="divide-y divide-neutral-800">
                    {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 px-4 py-2.5">
                            <div className="flex-1 h-3.5 rounded animate-pulse bg-neutral-700" />
                            <div className="w-16 h-3.5 rounded animate-pulse bg-neutral-700" />
                            <div className="w-16 h-3.5 rounded animate-pulse bg-neutral-700" />
                            <div className="w-16 h-3.5 rounded animate-pulse bg-neutral-700" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && data.length === 0 && (
                <p className="px-4 py-4 text-sm text-neutral-900">{i18n('pages.materials.widgets.empty')}</p>
            )}

            {!isLoading && data.length > 0 && (
                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-800">
                    {data.map((material) => (
                        <div key={material.id} className="flex items-center gap-4 px-4 py-2.5">
                            <span className="flex-1 text-sm truncate min-w-0">
                                {material.name}
                                <span className="text-neutral-900 text-xs ml-1">({material.unit})</span>
                            </span>
                            <span className="w-16 text-right text-sm tabular-nums">
                                {material.totalIngressed}
                            </span>
                            <span className="w-16 text-right text-sm tabular-nums text-primary-500">
                                {material.available}
                            </span>
                            <span className="w-16 text-right text-sm tabular-nums text-secondary-500">
                                {material.operational}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MaterialStatsWidget;
