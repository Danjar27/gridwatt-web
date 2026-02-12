import React from 'react';

export function OrderForm({ onSubmit }: { onSubmit: (data: any) => void }) {
    const [form, setForm] = React.useState({
        serviceType: '',
        meterNumber: '',
        orderStatus: '',
        issueDate: '',
        issueTime: '',
        accountNumber: '',
        lastName: '',
        firstName: '',
        idNumber: '',
        email: '',
        phone: '',
        orderLocation: '',
        panelTowerBlock: '',
        coordinateX: '',
        coordinateY: '',
        latitude: '',
        longitude: '',
        appliedTariff: '',
        transformerNumber: '',
        distributionNetwork: '',
        transformerOwnership: '',
        sharedSubstation: '',
        normalLoad: '',
        fluctuatingLoad: '',
        plannerGroup: '',
        workPosition: '',
        lockerSequence: '',
        observations: '',
        technicianId: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                // Convert numeric fields
                const data = { ...form };
                ['coordinateX', 'coordinateY', 'latitude', 'longitude', 'technicianId'].forEach((key) => {
                    if (data[key]) data[key] = Number(data[key]);
                    else data[key] = undefined;
                });
                onSubmit(data);
            }}
        >
            {/* Required fields */}
            <div>
                <label className="block text-sm font-medium mb-1">Service Type</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Meter Number</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="meterNumber"
                    value={form.meterNumber}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Order Status</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="orderStatus"
                    value={form.orderStatus}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Issue Date</label>
                <input
                    type="date"
                    className="w-full rounded border px-3 py-2"
                    name="issueDate"
                    value={form.issueDate}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Issue Time</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="issueTime"
                    value={form.issueTime}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="accountNumber"
                    value={form.accountNumber}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">ID Number</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="idNumber"
                    value={form.idNumber}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    className="w-full rounded border px-3 py-2"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Order Location</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="orderLocation"
                    value={form.orderLocation}
                    onChange={handleChange}
                    required
                />
            </div>
            {/* Optional fields */}
            <div>
                <label className="block text-sm font-medium mb-1">Panel/Tower/Block</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="panelTowerBlock"
                    value={form.panelTowerBlock}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Coordinate X</label>
                <input
                    type="number"
                    className="w-full rounded border px-3 py-2"
                    name="coordinateX"
                    value={form.coordinateX}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Coordinate Y</label>
                <input
                    type="number"
                    className="w-full rounded border px-3 py-2"
                    name="coordinateY"
                    value={form.coordinateY}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                    type="number"
                    className="w-full rounded border px-3 py-2"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                    type="number"
                    className="w-full rounded border px-3 py-2"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Applied Tariff</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="appliedTariff"
                    value={form.appliedTariff}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Transformer Number</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="transformerNumber"
                    value={form.transformerNumber}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Distribution Network</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="distributionNetwork"
                    value={form.distributionNetwork}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Transformer Ownership</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="transformerOwnership"
                    value={form.transformerOwnership}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Shared Substation</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="sharedSubstation"
                    value={form.sharedSubstation}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Normal Load</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="normalLoad"
                    value={form.normalLoad}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Fluctuating Load</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="fluctuatingLoad"
                    value={form.fluctuatingLoad}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Planner Group</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="plannerGroup"
                    value={form.plannerGroup}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Work Position</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="workPosition"
                    value={form.workPosition}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Locker Sequence</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="lockerSequence"
                    value={form.lockerSequence}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    name="observations"
                    value={form.observations}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Technician ID</label>
                <input
                    type="number"
                    className="w-full rounded border px-3 py-2"
                    name="technicianId"
                    value={form.technicianId}
                    onChange={handleChange}
                />
            </div>
            <button type="submit" className="bg-primary text-white rounded px-4 py-2">
                Create Order
            </button>
        </form>
    );
}
