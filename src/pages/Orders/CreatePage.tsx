import type { Order } from '@lib/api-client';

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
                                            <Field name="id" label="Identificador" required>
                                                <TextInput name="id" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                            <Field name="serviceType" label="Tipo de servicio" required>
                                                <TextInput name="serviceType" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                            <Field name="accountNumber" label="Número de cuenta" required>
                                                <TextInput
                                                    name="accountNumber"
                                                    rules={{ required: 'Campo requerido' }}
                                                />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="meterNumber" label="Número de medidor" required>
                                                <TextInput name="meterNumber" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                            <Field name="issueDate" label="Fecha de emisión" required>
                                                <DateInput name="issueDate" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                        </div>

                                        <hr className="my-8 text-neutral-700" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="firstName" label="Nombre" required>
                                                <TextInput name="firstName" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                            <Field name="lastName" label="Apellido" required>
                                                <TextInput name="lastName" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="idNumber" label="Número de cédula" required>
                                                <TextInput name="idNumber" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                            <Field name="phone" label="Teléfono" required>
                                                <PhoneInput name="phone" rules={{ required: 'Campo requerido' }} />
                                            </Field>
                                        </div>

                                        <Field name="email" label="Correo electrónico" required>
                                            <EmailInput name="email" rules={{ required: 'Campo requerido' }} />
                                        </Field>

                                        <Field name="orderLocation" label="Dirección / Ubicación" required>
                                            <TextInput name="orderLocation" rules={{ required: 'Campo requerido' }} />
                                        </Field>

                                        <hr className="my-8 text-neutral-700" />

                                        <Field name="panelTowerBlock" label="Panel / Torre / Bloque">
                                            <TextInput name="panelTowerBlock" />
                                        </Field>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="appliedTariff" label="Tarifa aplicada">
                                                <TextInput name="appliedTariff" />
                                            </Field>
                                            <Field name="transformerNumber" label="Número de transformador">
                                                <TextInput name="transformerNumber" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="distributionNetwork" label="Red de distribución">
                                                <TextInput name="distributionNetwork" />
                                            </Field>
                                            <Field name="transformerOwnership" label="Propiedad del transformador">
                                                <TextInput name="transformerOwnership" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="sharedSubstation" label="Subestación compartida">
                                                <TextInput name="sharedSubstation" />
                                            </Field>
                                            <Field name="normalLoad" label="Carga normal">
                                                <TextInput name="normalLoad" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="fluctuatingLoad" label="Carga fluctuante">
                                                <TextInput name="fluctuatingLoad" />
                                            </Field>
                                            <Field name="plannerGroup" label="Grupo planificador">
                                                <TextInput name="plannerGroup" />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field name="workPosition" label="Posición de trabajo">
                                                <TextInput name="workPosition" />
                                            </Field>
                                            <Field name="lockerSequence" label="Secuencia del casillero">
                                                <TextInput name="lockerSequence" />
                                            </Field>
                                        </div>

                                        <Field name="observations" label="Observaciones">
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
                                                <Field name="latitude" label="Latitud">
                                                    <NumberInput name="latitude" step="any" placeholder="0.000000" />
                                                </Field>
                                                <Field name="longitude" label="Longitud">
                                                    <NumberInput name="longitude" step="any" placeholder="0.000000" />
                                                </Field>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Field name="coordinateX" label="Coordenada X">
                                                    <NumberInput name="coordinateX" />
                                                </Field>
                                                <Field name="coordinateY" label="Coordenada Y">
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
