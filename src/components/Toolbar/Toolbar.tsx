import Theme from './blocks/Theme.tsx';
import Notifications from './blocks/Notifications.tsx';
import Connection from './blocks/Connection.tsx';
import Search from './blocks/Search.tsx';

const Toolbar = () => (
    <div className="flex gap-5">
        <div className="flex bg-neutral-500 rounded-lg justify-center items-center p-5 gap-5 border border-neutral-800">
            <Search />
        </div>

        <div className="flex bg-neutral-500 rounded-lg justify-center items-center p-5 gap-5 border border-neutral-800">
            <Theme />
            <Notifications />
            <Connection />
        </div>
    </div>
);

export default Toolbar;
