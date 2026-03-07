import { useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { getMaterialStats } from '@lib/api/materials.ts';

const SKELETON_ROWS = 4;

const MaterialStatsWidget = () => {
    const i18n = useTranslations();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const { data = [], isLoading } = useQuery({
        queryKey: ['materials', 'stats'],
        queryFn: getMaterialStats,
    });

    const toggle = (id: string) =>
        setExpanded((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-neutral-800">
                <span className="flex-1 text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.stats')}
                </span>
                <span className="w-14 text-right text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.bodega')}
                </span>
                <span className="w-14 text-right text-xs font-medium text-primary-500 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.bodegaFisica')}
                </span>
                <span className="w-14 text-right text-xs font-medium text-secondary-500 uppercase tracking-wide">
                    {i18n('pages.materials.widgets.bodegaTecnicos')}
                </span>
                <span className="w-5" />
            </div>

            {isLoading && (
                <div className="divide-y divide-neutral-800">
                    {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 px-4 py-2.5">
                            <div className="flex-1 h-3.5 rounded animate-pulse bg-neutral-700" />
                            <div className="w-14 h-3.5 rounded animate-pulse bg-neutral-700" />
                            <div className="w-14 h-3.5 rounded animate-pulse bg-neutral-700" />
                            <div className="w-14 h-3.5 rounded animate-pulse bg-neutral-700" />
                            <div className="w-5 h-3.5 rounded animate-pulse bg-neutral-700" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && data.length === 0 && (
                <p className="px-4 py-4 text-sm text-neutral-900">{i18n('pages.materials.widgets.empty')}</p>
            )}

            {!isLoading && data.length > 0 && (
                <div className="divide-y divide-neutral-800">
                    {data.map((material) => {
                        const isOpen = expanded.has(material.id);

                        return (
                            <div key={material.id}>
                                <button
                                    onClick={() => toggle(material.id)}
                                    className="w-full flex items-center gap-4 px-4 py-2.5 text-left hover:bg-neutral-700/30 transition-colors"
                                >
                                    <span className="flex-1 text-sm truncate min-w-0">
                                        {material.name}
                                        <span className="text-neutral-900 text-xs ml-1">({material.unit})</span>
                                    </span>
                                    <span className="w-14 text-right text-sm tabular-nums shrink-0">
                                        {material.totalIngressed}
                                    </span>
                                    <span className="w-14 text-right text-sm tabular-nums text-primary-500 shrink-0">
                                        {material.available}
                                    </span>
                                    <span className="w-14 text-right text-sm tabular-nums text-secondary-500 shrink-0">
                                        {material.operational}
                                    </span>
                                    <CaretDownIcon
                                        size={14}
                                        weight="bold"
                                        className={`w-5 shrink-0 text-neutral-900 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="bg-neutral-700/20 border-t border-neutral-800 px-4 py-2 flex flex-col gap-0.5">
                                        {(material.technicians?.length ?? 0) === 0 ? (
                                            <p className="text-xs text-neutral-900 py-1">
                                                {i18n('pages.materials.widgets.noTechnicianBreakdown')}
                                            </p>
                                        ) : (
                                            (material.technicians ?? []).map((tech) => (
                                                <div
                                                    key={tech.id}
                                                    className="flex items-center justify-between py-1 text-xs"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-5 h-5 rounded-full bg-primary-500/15 flex items-center justify-center text-[8px] font-bold uppercase shrink-0 text-primary-500 select-none">
                                                            {tech.name[0]}
                                                            {tech.lastName[0]}
                                                        </div>
                                                        <span className="truncate text-neutral-900">
                                                            {tech.name} {tech.lastName}
                                                        </span>
                                                    </div>
                                                    <span className="tabular-nums font-medium shrink-0 ml-4">
                                                        {tech.quantity}
                                                        <span className="text-neutral-900 ml-0.5 font-normal">
                                                            {material.unit}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MaterialStatsWidget;
