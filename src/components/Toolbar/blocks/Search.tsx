import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'use-intl';

const Search = () => {
    const i18n = useTranslations();

    return (
        <div className="flex gap-5 p-2 rounded-lg bg-neutral-600">
            <SearchIcon />
            <input type="text" placeholder={i18n('toolbar.search')} className="w-60" />
        </div>
    );
};

export default Search;
