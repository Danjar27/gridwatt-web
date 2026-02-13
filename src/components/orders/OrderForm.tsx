import Form from '@components/Form/Form';
import Field from '@components/Form/blocks/Field';
import TextInput from '@components/Form/blocks/TextInput';
import EmailInput from '@components/Form/blocks/EmailInput';
import NumberInput from '@components/Form/blocks/NumberInput';
import DateInput from '@components/Form/blocks/DateInput';
import PhoneInput from '@components/Form/blocks/PhoneInput';

export function OrderForm({ onSubmit }: { onSubmit: (data: any) => void }) {
    const handleFormSubmit = (data: any) => {
        // Convert numeric fields
        ['coordinateX', 'coordinateY', 'latitude', 'longitude', 'technicianId'].forEach((key) => {
            if (data[key] === '' || data[key] === undefined || data[key] === null) {
                data[key] = undefined;
            } else {
                data[key] = Number(data[key]);
            }
        });
        onSubmit(data);
    };

    return (
        <Form onSubmit={handleFormSubmit}>
            {/* Required fields */}
            <Field name="serviceType" label="Service Type" required>
                <TextInput name="serviceType" rules={{ required: 'Service type is required' }} />
            </Field>
            <Field name="meterNumber" label="Meter Number" required>
                <TextInput name="meterNumber" rules={{ required: 'Meter number is required' }} />
            </Field>
            <Field name="orderStatus" label="Order Status" required>
                <TextInput name="orderStatus" rules={{ required: 'Order status is required' }} />
            </Field>
            <Field name="issueDate" label="Issue Date" required>
                <DateInput name="issueDate" rules={{ required: 'Issue date is required' }} />
            </Field>
            <Field name="issueTime" label="Issue Time" required>
                <TextInput name="issueTime" rules={{ required: 'Issue time is required' }} />
            </Field>
            <Field name="accountNumber" label="Account Number" required>
                <TextInput name="accountNumber" rules={{ required: 'Account number is required' }} />
            </Field>
            <Field name="lastName" label="Last Name" required>
                <TextInput name="lastName" rules={{ required: 'Last name is required' }} />
            </Field>
            <Field name="firstName" label="First Name" required>
                <TextInput name="firstName" rules={{ required: 'First name is required' }} />
            </Field>
            <Field name="idNumber" label="ID Number" required>
                <TextInput name="idNumber" rules={{ required: 'ID number is required' }} />
            </Field>
            <Field name="email" label="Email" required>
                <EmailInput name="email" rules={{ required: 'Email is required' }} />
            </Field>
            <Field name="phone" label="Phone" required>
                <PhoneInput name="phone" rules={{ required: 'Phone is required' }} />
            </Field>
            <Field name="orderLocation" label="Order Location" required>
                <TextInput name="orderLocation" rules={{ required: 'Order location is required' }} />
            </Field>

            {/* Optional fields */}
            <Field name="panelTowerBlock" label="Panel/Tower/Block">
                <TextInput name="panelTowerBlock" />
            </Field>
            <Field name="coordinateX" label="Coordinate X">
                <NumberInput name="coordinateX" />
            </Field>
            <Field name="coordinateY" label="Coordinate Y">
                <NumberInput name="coordinateY" />
            </Field>
            <Field name="latitude" label="Latitude">
                <NumberInput name="latitude" step="any" />
            </Field>
            <Field name="longitude" label="Longitude">
                <NumberInput name="longitude" step="any" />
            </Field>
            <Field name="appliedTariff" label="Applied Tariff">
                <TextInput name="appliedTariff" />
            </Field>
            <Field name="transformerNumber" label="Transformer Number">
                <TextInput name="transformerNumber" />
            </Field>
            <Field name="distributionNetwork" label="Distribution Network">
                <TextInput name="distributionNetwork" />
            </Field>
            <Field name="transformerOwnership" label="Transformer Ownership">
                <TextInput name="transformerOwnership" />
            </Field>
            <Field name="sharedSubstation" label="Shared Substation">
                <TextInput name="sharedSubstation" />
            </Field>
            <Field name="normalLoad" label="Normal Load">
                <TextInput name="normalLoad" />
            </Field>
            <Field name="fluctuatingLoad" label="Fluctuating Load">
                <TextInput name="fluctuatingLoad" />
            </Field>
            <Field name="plannerGroup" label="Planner Group">
                <TextInput name="plannerGroup" />
            </Field>
            <Field name="workPosition" label="Work Position">
                <TextInput name="workPosition" />
            </Field>
            <Field name="lockerSequence" label="Locker Sequence">
                <TextInput name="lockerSequence" />
            </Field>
            <Field name="observations" label="Observations">
                <TextInput name="observations" />
            </Field>
            <Field name="technicianId" label="Technician ID">
                <NumberInput name="technicianId" />
            </Field>

            <button type="submit" className="bg-primary text-white rounded px-4 py-2">
                Create Order
            </button>
        </Form>
    );
}
