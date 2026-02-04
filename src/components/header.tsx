import { Link } from 'react-router-dom';
import { User, LogOut, RefreshCw, Menu } from 'lucide-react';
import { useAuthActions, useAuthContext } from '@context/auth/context.ts';
import { classnames } from '@utils/classnames.ts';
import { useOfflineActions, useOfflineContext } from '@context/offline/context.ts';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const { logout } = useAuthActions();
    const { user } = useAuthContext();
    const { online, pendingCount, isSyncing } = useOfflineContext();
    const { syncNow } = useOfflineActions();

    return (
        <header className="flex h-16 items-center justify-between border-b border-main-400 px-6 bg-main-500 text-white">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-main-400 lg:hidden">
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            <div className="flex items-center gap-4">
                {pendingCount > 0 && (
                    <button
                        onClick={syncNow}
                        disabled={!online || isSyncing}
                        className="flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-1.5 text-sm text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                    >
                        <RefreshCw className={classnames('h-4 w-4', isSyncing && 'animate-spin')} />
                        {pendingCount} pending
                    </button>
                )}
                <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <User className="h-4 w-4" />
                    {user?.name} {user?.lastName}
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
