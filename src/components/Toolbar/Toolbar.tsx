import Theme from './blocks/Theme.tsx';
import Notifications from './blocks/Notifications.tsx';
import Connection from './blocks/Connection.tsx';

const Toolbar = () => (
    <div className="flex h-25 bg-neutral-500 rounded-[20px] justify-center items-center p-5 gap-5">
        <Theme />
        <Notifications />
        <Connection />
    </div>
);

export default Toolbar;
