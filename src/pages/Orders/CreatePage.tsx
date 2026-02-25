import { ClipboardTextIcon, MapPinIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { useMutation } from '@tanstack/react-query';

import { LocationPickerMap } from '@/components/orders/LocationPickerMap';
import TextInput from '@components/Form/blocks/TextInput';
import EmailInput from '@components/Form/blocks/EmailInput';
import NumberInput from '@components/Form/blocks/NumberInput';
import DateInput from '@components/Form/blocks/DateInput';
import PhoneInput from '@components/Form/blocks/PhoneInput';
import Actions from '@components/Form/blocks/Actions';
import Summary from '@components/Summary/Summary';
import Field from '@components/Form/blocks/Field';
import Form from '@components/Form/Form';
import Page from '@layouts/Page';

import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import type {Order} from "@interfaces/order.interface.ts";

const CreateOrderPage = () => {
    const i18n = useTranslations();
    const navigate = useNavigate();

    const createMutation = useMutation({
        mutationFn: (data: Order) => apiClient.createOrder(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['orders'] });
            navigate('/orders');
        },
    });

    const handleSubmit = (data: Order) => {
        createMutation.mutate(data);
    };

    return (
        <Page
            id="create-order"
            title={i18n('pages.orders.form.create')}
            subtitle={i18n('pages.orders.form.createSubtitle')}
            backRoute="/orders"
        >
            <Form onSubmit={handleSubmit}>
                {({ setValue, watch }) => {
                    const lat = watch('latitude') as number | undefined;
                    const lng = watch('longitude') as number | undefined;

                    return (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-6 items-start">
                                {/* ── Left: form fields ── */}
                                <Summary
                                    icon={ClipboardTextIcon}
                                    title={i18n('pages.orders.form.section.details')}
                                    subtitle={i18n('pages.orders.form.section.detailsSubtitle')}
                                >
                                    <div className="p-4 s768:p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="id" label={i18n('pages.orders.form.fields.id')} required>
                                                <TextInput name="id" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                            <Field name="serviceType" label={i18n('pages.orders.form.fields.serviceType')} required>
                                                <TextInput name="serviceType" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                            <Field name="accountNumber" label={i18n('pages.orders.form.fields.accountNumber')} required>
                                                <TextInput
                                                    name="accountNumber"
                                                    rules={{ required: i18n('errors.required') }}
                                                />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="meterNumber" label={i18n('pages.orders.form.fields.meterNumber')} required>
                                                <TextInput name="meterNumber" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                            <Field name="issueDate" label={i18n('pages.orders.form.fields.issueDate')} required>
                                                <DateInput name="issueDate" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                        </div>

                                        <hr className="my-8 text-neutral-700" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="firstName" label={i18n('pages.orders.form.fields.firstName')} required>
                                                <TextInput name="firstName" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                            <Field name="lastName" label={i18n('pages.orders.form.fields.lastName')} required>
                                                <TextInput name="lastName" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="idNumber" label={i18n('pages.orders.form.fields.idNumber')} required>
                                                <TextInput name="idNumber" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                            <Field name="phone" label={i18n('pages.orders.form.fields.phone')} required>
                                                <PhoneInput name="phone" rules={{ required: i18n('errors.required') }} />
                                            </Field>
                                        </div>

                                        <Field name="email" label={i18n('pages.orders.form.fields.email')} required>
                                            <EmailInput name="email" rules={{ required: i18n('errors.required') }} />
                                        </Field>

                                        <Field name="orderLocation" label={i18n('pages.orders.form.fields.orderLocation')} required>
                                            <TextInput name="orderLocation" rules={{ required: i18n('errors.required') }} />
                                        </Field>

                                        <hr className="my-8 text-neutral-700" />

                                        <Field name="panelTowerBlock" label={i18n('pages.orders.form.fields.panelTowerBlock')}>
                                            <TextInput name="panelTowerBlock" />
                                        </Field>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="appliedTariff" label={i18n('pages.orders.form.fields.appliedTariff')}>
                                                <TextInput name="appliedTariff" />
                                            </Field>
                                            <Field name="transformerNumber" label={i18n('pages.orders.form.fields.transformerNumber')}>
                                                <TextInput name="transformerNumber" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="distributionNetwork" label={i18n('pages.orders.form.fields.distributionNetwork')}>
                                                <TextInput name="distributionNetwork" />
                                            </Field>
                                            <Field name="transformerOwnership" label={i18n('pages.orders.form.fields.transformerOwnership')}>
                                                <TextInput name="transformerOwnership" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="sharedSubstation" label={i18n('pages.orders.form.fields.sharedSubstation')}>
                                                <TextInput name="sharedSubstation" />
                                            </Field>
                                            <Field name="normalLoad" label={i18n('pages.orders.form.fields.normalLoad')}>
                                                <TextInput name="normalLoad" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="fluctuatingLoad" label={i18n('pages.orders.form.fields.fluctuatingLoad')}>
                                                <TextInput name="fluctuatingLoad" />
                                            </Field>
                                            <Field name="plannerGroup" label={i18n('pages.orders.form.fields.plannerGroup')}>
                                                <TextInput name="plannerGroup" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="workPosition" label={i18n('pages.orders.form.fields.workPosition')}>
                                                <TextInput name="workPosition" />
                                            </Field>
                                            <Field name="lockerSequence" label={i18n('pages.orders.form.fields.lockerSequence')}>
                                                <TextInput name="lockerSequence" />
                                            </Field>
                                        </div>

                                        <Field name="observations" label={i18n('pages.orders.form.fields.observations')}>
                                            <TextInput name="observations" />
                                        </Field>
                                    </div>
                                </Summary>

                                {/* ── Right: location picker ── */}
                                <div className="lg:sticky lg:top-6">
                                    <Summary
                                        icon={MapPinIcon}
                                        title={i18n('pages.orders.form.section.location')}
                                        subtitle={i18n('pages.orders.form.section.locationSubtitle')}
                                    >
                                        <div className="p-4 s768:p-6 space-y-4">
                                            <LocationPickerMap
                                                lat={lat}
                                                lng={lng}
                                                onChange={(newLat, newLng) => {
                                                    setValue('latitude', newLat, { shouldValidate: true });
                                                    setValue('longitude', newLng, { shouldValidate: true });
                                                }}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <Field name="latitude" label={i18n('pages.orders.form.fields.latitude')}>
                                                    <NumberInput name="latitude" step="any" placeholder="0.000000" />
                                                </Field>
                                                <Field name="longitude" label={i18n('pages.orders.form.fields.longitude')}>
                                                    <NumberInput name="longitude" step="any" placeholder="0.000000" />
                                                </Field>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Field name="coordinateX" label={i18n('pages.orders.form.fields.coordinateX')}>
                                                    <NumberInput name="coordinateX" />
                                                </Field>
                                                <Field name="coordinateY" label={i18n('pages.orders.form.fields.coordinateY')}>
                                                    <NumberInput name="coordinateY" />
                                                </Field>
                                            </div>
                                        </div>
                                    </Summary>
                                </div>
                            </div>

                            <Actions
                                submitLabel={i18n('pages.orders.action')}
                                onCancel={() => navigate('/orders')}
                                isLoading={createMutation.isPending}
                            />
                        </>
                    );
                }}
            </Form>
        </Page>
    );
};

export default CreateOrderPage;
