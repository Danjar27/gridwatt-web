import Form from '@components/Form/Form';
import Field from '@components/Form/blocks/Field';
import TextInput from '@components/Form/blocks/TextInput';
import EmailInput from '@components/Form/blocks/EmailInput';
import NumberInput from '@components/Form/blocks/NumberInput';
import DateInput from '@components/Form/blocks/DateInput';
import PhoneInput from '@components/Form/blocks/PhoneInput';
import Actions from '@components/Form/blocks/Actions';

interface OrderFormProps {
    onSubmit: (data: any) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function OrderForm({ onSubmit, onCancel, isLoading }: OrderFormProps) {
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
            {/* Service info */}
            <div className="grid grid-cols-2 gap-4">
                <Field name="serviceType" label="Service Type" required>
                    <TextInput name="serviceType" rules={{ required: 'Service type is required' }} />
                </Field>
                <Field name="orderStatus" label="Order Status" required>
                    <TextInput name="orderStatus" rules={{ required: 'Order status is required' }} />
                </Field>
            </div>

            {/* Meter / Account */}
            <div className="grid grid-cols-2 gap-4">
                <Field name="meterNumber" label="Meter Number" required>
                    <TextInput name="meterNumber" rules={{ required: 'Meter number is required' }} />
                </Field>
                <Field name="accountNumber" label="Account Number" required>
                    <TextInput name="accountNumber" rules={{ required: 'Account number is required' }} />
                </Field>
            </div>

            {/* Date / Time */}
            <div className="grid grid-cols-2 gap-4">
                <Field name="issueDate" label="Issue Date" required>
                    <DateInput name="issueDate" rules={{ required: 'Issue date is required' }} />
                </Field>
                <Field name="issueTime" label="Issue Time" required>
                    <TextInput name="issueTime" rules={{ required: 'Issue time is required' }} />
                </Field>
            </div>

            {/* Customer name */}
            <div className="grid grid-cols-2 gap-4">
                <Field name="firstName" label="First Name" required>
                    <TextInput name="firstName" rules={{ required: 'First name is required' }} />
                </Field>
                <Field name="lastName" label="Last Name" required>
                    <TextInput name="lastName" rules={{ required: 'Last name is required' }} />
                </Field>
            </div>

            {/* Customer contact */}
            <div className="grid grid-cols-2 gap-4">
                <Field name="idNumber" label="ID Number" required>
                    <TextInput name="idNumber" rules={{ required: 'ID number is required' }} />
                </Field>
                <Field name="phone" label="Phone" required>
                    <PhoneInput name="phone" rules={{ required: 'Phone is required' }} />
                </Field>
            </div>

            <Field name="email" label="Email" required>
                <EmailInput name="email" rules={{ required: 'Email is required' }} />
            </Field>

            <Field name="orderLocation" label="Order Location" required>
                <TextInput name="orderLocation" rules={{ required: 'Order location is required' }} />
            </Field>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-4">
                <Field name="panelTowerBlock" label="Panel/Tower/Block">
                    <TextInput name="panelTowerBlock" />
                </Field>
                <Field name="technicianId" label="Technician ID">
                    <NumberInput name="technicianId" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field name="coordinateX" label="Coordinate X">
                    <NumberInput name="coordinateX" />
                </Field>
                <Field name="coordinateY" label="Coordinate Y">
                    <NumberInput name="coordinateY" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field name="latitude" label="Latitude">
                    <NumberInput name="latitude" step="any" />
                </Field>
                <Field name="longitude" label="Longitude">
                    <NumberInput name="longitude" step="any" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field name="appliedTariff" label="Applied Tariff">
                    <TextInput name="appliedTariff" />
                </Field>
                <Field name="transformerNumber" label="Transformer Number">
                    <TextInput name="transformerNumber" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field name="distributionNetwork" label="Distribution Network">
                    <TextInput name="distributionNetwork" />
                </Field>
                <Field name="transformerOwnership" label="Transformer Ownership">
                    <TextInput name="transformerOwnership" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field name="sharedSubstation" label="Shared Substation">
                    <TextInput name="sharedSubstation" />
                </Field>
                <Field name="normalLoad" label="Normal Load">
                    <TextInput name="normalLoad" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field name="fluctuatingLoad" label="Fluctuating Load">
                    <TextInput name="fluctuatingLoad" />
                </Field>
                <Field name="plannerGroup" label="Planner Group">
                    <TextInput name="plannerGroup" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field name="workPosition" label="Work Position">
                    <TextInput name="workPosition" />
                </Field>
                <Field name="lockerSequence" label="Locker Sequence">
                    <TextInput name="lockerSequence" />
                </Field>
            </div>

            <Field name="observations" label="Observations">
                <TextInput name="observations" />
            </Field>

            <Actions submitLabel="Crear" onCancel={onCancel} isLoading={isLoading} />
        </Form>
    );
}
