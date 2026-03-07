import { useState } from 'react';
import { DownloadSimple, SpinnerGap } from '@phosphor-icons/react';
import { useTranslations } from 'use-intl';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import DateRangeSelector from '@components/DateRangeSelector/DateRangeSelector';
import Button from '@components/Button/Button';
import { downloadCompletedJobsReport } from '@lib/api/jobs';

const ExportToolbar = () => {
    const i18n = useTranslations();

    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canDownload = dateRange?.from && dateRange?.to && !isDownloading;

    const handleDownload = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            return;
        }

        setError(null);
        setIsDownloading(true);

        try {
            const fromDate = format(dateRange.from, 'yyyy-MM-dd');
            const toDate = format(dateRange.to, 'yyyy-MM-dd');
            await downloadCompletedJobsReport(fromDate, toDate);
        } catch (downloadError) {
            setError(i18n('pages.dashboard.export.error'));
            console.error('Export failed:', downloadError);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-neutral-800">
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.dashboard.export.title')}
                </span>
            </div>

            <div className="p-4">
                <div className="flex flex-col s768:flex-row s768:items-end gap-4">
                    <div className="flex-1 max-w-sm">
                        <DateRangeSelector
                            value={dateRange}
                            onChange={setDateRange}
                            label={i18n('pages.dashboard.export.dateRange')}
                            placeholder={i18n('pages.dashboard.export.selectRange')}
                        />
                    </div>

                    <Button
                        onClick={handleDownload}
                        disabled={!canDownload}
                        variant="solid"
                        icon={isDownloading ? SpinnerGap : DownloadSimple}
                    >
                        {isDownloading
                            ? i18n('pages.dashboard.export.downloading')
                            : i18n('pages.dashboard.export.download')}
                    </Button>
                </div>

                {error && <p className="mt-3 text-sm text-error-500">{error}</p>}
            </div>
        </div>
    );
};

export default ExportToolbar;
