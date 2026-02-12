import type { FC } from 'react';

const Form: FC = () => (
        <form className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium">First Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Last Name</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
                </div>
            </div>
        </form>
    );

export default Form;
