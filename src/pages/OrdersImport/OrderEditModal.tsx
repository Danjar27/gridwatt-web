import type { OrderImportData, OrderImportPreviewItem } from '@interfaces/order.interface.ts';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useTranslations } from 'use-intl';

import Modal from '@components/Modal/Modal';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import TextInput from '@components/Form/blocks/TextInput';
import TextArea from '@components/Form/blocks/TextArea';
import NumberInput from '@components/Form/blocks/NumberInput';
import Actions from '@components/Form/blocks/Actions';
import { validateImportData } from '@lib/validation/import-order.ts';
import { classnames } from '@utils/classnames.ts';

type Tab = 'customer' | 'service' | 'location' | 'optional';

interface OrderEditModalProps {
    order: OrderImportPreviewItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: OrderImportPreviewItem) => void;
}

const toOptionalNumber = (value: number | undefined): number | undefined =>
    value === undefined || isNaN(value) ? undefined : value;

const OrderEditModal = ({ order, isOpen, onClose, onSave }: OrderEditModalProps) => {
    const i18n = useTranslations('pages.ordersImport');
    const [activeTab, setActiveTab] = useState<Tab>('customer');

    const methods = useForm<OrderImportData>({
        defaultValues: order?.data ?? {},
    });

    useEffect(() => {
        if (order) {
            methods.reset(order.data);
            setActiveTab('customer');
        }
    }, [order, methods]);

    const onSubmit = (formData: OrderImportData) => {
        if (!order) return;

        const cleaned: OrderImportData = {
            ...formData,
            coordinateX: toOptionalNumber(formData.coordinateX),
            coordinateY: toOptionalNumber(formData.coordinateY),
        };

        onSave({ ...order, data: cleaned, errors: validateImportData(cleaned) });
        onClose();
    };

    const tabs: Array<{ id: Tab; label: string }> = [
        { id: 'customer', label: i18n('tabs.customer') },
        { id: 'service', label: i18n('tabs.service') },
        { id: 'location', label: i18n('tabs.location') },
        { id: 'optional', label: i18n('tabs.optional') },
    ];

    return (
        <Modal id="order-edit-modal" isOpen={isOpen} onClose={onClose} onOpen={() => {}}>
            <Window
                title={i18n('editOrderTitle')}
                icon={PencilSimpleIcon}
                className="w-full s768:w-[640px]"
                scrollable
            >
                <div className="flex gap-1 border-b border-neutral-800 pb-0 mb-4 -mx-4 s768:-mx-6 px-4 s768:px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={classnames(
                                'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition cursor-pointer',
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-500'
                                    : 'border-transparent text-neutral-900 hover:text-neutral-800'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                        {activeTab === 'customer' && (
                            <div className="grid grid-cols-1 gap-4 s768:grid-cols-2">
                                <Field name="clientName" label={i18n('form.clientName')} required>
                                    <TextInput name="clientName" rules={{ required: true }} />
                                </Field>
                                <Field name="clientLastName" label={i18n('form.clientLastName')}>
                                    <TextInput name="clientLastName" />
                                </Field>
                                <Field name="clientId" label={i18n('form.clientId')} required>
                                    <TextInput name="clientId" rules={{ required: true }} />
                                </Field>
                                <Field name="clientEmail" label={i18n('form.clientEmail')}>
                                    <TextInput name="clientEmail" />
                                </Field>
                                <Field name="clientPhone" label={i18n('form.clientPhone')}>
                                    <TextInput name="clientPhone" />
                                </Field>
                                <Field name="clientAccount" label={i18n('form.clientAccount')} required>
                                    <TextInput name="clientAccount" rules={{ required: true }} />
                                </Field>
                            </div>
                        )}

                        {activeTab === 'service' && (
                            <div className="grid grid-cols-1 gap-4 s768:grid-cols-2">
                                <Field name="type" label={i18n('form.type')} required>
                                    <TextInput name="type" rules={{ required: true }} />
                                </Field>
                                <Field name="orderStatus" label={i18n('form.orderStatus')} required>
                                    <TextInput name="orderStatus" rules={{ required: true }} />
                                </Field>
                                <Field name="meterId" label={i18n('form.meterId')}>
                                    <TextInput name="meterId" />
                                </Field>
                                <Field name="meterType" label={i18n('form.meterType')}>
                                    <TextInput name="meterType" />
                                </Field>
                                <Field name="issueDate" label={i18n('form.issueDate')} required>
                                    <TextInput name="issueDate" rules={{ required: true }} />
                                </Field>
                            </div>
                        )}

                        {activeTab === 'location' && (
                            <div className="grid grid-cols-1 gap-4 s768:grid-cols-2">
                                <div className="s768:col-span-2">
                                    <Field name="address" label={i18n('form.address')} required>
                                        <TextInput name="address" rules={{ required: true }} />
                                    </Field>
                                </div>
                                <div className="s768:col-span-2">
                                    <Field name="addressReference" label={i18n('form.addressReference')}>
                                        <TextInput name="addressReference" />
                                    </Field>
                                </div>
                                <Field name="zone" label={i18n('form.zone')}>
                                    <TextInput name="zone" />
                                </Field>
                                <Field name="sector" label={i18n('form.sector')}>
                                    <TextInput name="sector" />
                                </Field>
                                <Field name="parish" label={i18n('form.parish')}>
                                    <TextInput name="parish" />
                                </Field>
                                <Field name="neighborhood" label={i18n('form.neighborhood')}>
                                    <TextInput name="neighborhood" />
                                </Field>
                                <Field name="building" label={i18n('form.building')}>
                                    <TextInput name="building" />
                                </Field>
                                <Field name="urbanization" label={i18n('form.urbanization')}>
                                    <TextInput name="urbanization" />
                                </Field>
                                <Field name="canton" label={i18n('form.canton')}>
                                    <TextInput name="canton" />
                                </Field>
                                <Field name="province" label={i18n('form.province')}>
                                    <TextInput name="province" />
                                </Field>
                                <Field name="coordinateX" label={i18n('form.coordinateX')}>
                                    <NumberInput name="coordinateX" step="any" />
                                </Field>
                                <Field name="coordinateY" label={i18n('form.coordinateY')}>
                                    <NumberInput name="coordinateY" step="any" />
                                </Field>
                            </div>
                        )}

                        {activeTab === 'optional' && (
                            <div className="grid grid-cols-1 gap-4 s768:grid-cols-2">
                                <Field name="appliedTariff" label={i18n('form.appliedTariff')}>
                                    <TextInput name="appliedTariff" />
                                </Field>
                                <Field name="verifiedTariff" label={i18n('form.verifiedTariff')}>
                                    <TextInput name="verifiedTariff" />
                                </Field>
                                <Field name="transformerNumber" label={i18n('form.transformerNumber')}>
                                    <TextInput name="transformerNumber" />
                                </Field>
                                <Field name="transformerProperty" label={i18n('form.transformerProperty')}>
                                    <TextInput name="transformerProperty" />
                                </Field>
                                <div className="s768:col-span-2">
                                    <Field name="observations" label={i18n('form.observations')}>
                                        <TextArea name="observations" rows={3} />
                                    </Field>
                                </div>
                            </div>
                        )}

                        <Actions submitLabel={i18n('saveOrder')} onCancel={onClose} />
                    </form>
                </FormProvider>
            </Window>
        </Modal>
    );
};

export default OrderEditModal;
