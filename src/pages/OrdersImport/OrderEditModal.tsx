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

const toOptionalNumber = (v: number | undefined): number | undefined =>
    v === undefined || isNaN(v) ? undefined : v;

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
            latitude: toOptionalNumber(formData.latitude),
            longitude: toOptionalNumber(formData.longitude),
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
                                    : 'border-transparent text-neutral-900 hover:text-neutral-500'
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
                                <Field name="firstName" label={i18n('form.firstName')} required>
                                    <TextInput name="firstName" rules={{ required: true }} />
                                </Field>
                                <Field name="lastName" label={i18n('form.lastName')} required>
                                    <TextInput name="lastName" rules={{ required: true }} />
                                </Field>
                                <Field name="idNumber" label={i18n('form.idNumber')} required>
                                    <TextInput name="idNumber" rules={{ required: true }} />
                                </Field>
                                <Field name="email" label={i18n('form.email')} required>
                                    <TextInput name="email" rules={{ required: true }} />
                                </Field>
                                <Field name="phone" label={i18n('form.phone')} required>
                                    <TextInput name="phone" rules={{ required: true }} />
                                </Field>
                            </div>
                        )}

                        {activeTab === 'service' && (
                            <div className="grid grid-cols-1 gap-4 s768:grid-cols-2">
                                <Field name="serviceType" label={i18n('form.serviceType')} required>
                                    <TextInput name="serviceType" rules={{ required: true }} />
                                </Field>
                                <Field name="orderStatus" label={i18n('form.orderStatus')} required>
                                    <TextInput name="orderStatus" rules={{ required: true }} />
                                </Field>
                                <Field name="meterNumber" label={i18n('form.meterNumber')} required>
                                    <TextInput name="meterNumber" rules={{ required: true }} />
                                </Field>
                                <Field name="accountNumber" label={i18n('form.accountNumber')} required>
                                    <TextInput name="accountNumber" rules={{ required: true }} />
                                </Field>
                                <Field name="issueDate" label={i18n('form.issueDate')} required>
                                    <TextInput name="issueDate" rules={{ required: true }} />
                                </Field>
                            </div>
                        )}

                        {activeTab === 'location' && (
                            <div className="grid grid-cols-1 gap-4 s768:grid-cols-2">
                                <div className="s768:col-span-2">
                                    <Field name="orderLocation" label={i18n('form.orderLocation')} required>
                                        <TextInput name="orderLocation" rules={{ required: true }} />
                                    </Field>
                                </div>
                                <Field name="panelTowerBlock" label={i18n('form.panelTowerBlock')}>
                                    <TextInput name="panelTowerBlock" />
                                </Field>
                                <Field name="latitude" label={i18n('form.latitude')}>
                                    <NumberInput name="latitude" step="any" />
                                </Field>
                                <Field name="longitude" label={i18n('form.longitude')}>
                                    <NumberInput name="longitude" step="any" />
                                </Field>
                            </div>
                        )}

                        {activeTab === 'optional' && (
                            <div className="grid grid-cols-1 gap-4 s768:grid-cols-2">
                                <Field name="appliedTariff" label={i18n('form.appliedTariff')}>
                                    <TextInput name="appliedTariff" />
                                </Field>
                                <Field name="transformerNumber" label={i18n('form.transformerNumber')}>
                                    <TextInput name="transformerNumber" />
                                </Field>
                                <Field name="distributionNetwork" label={i18n('form.distributionNetwork')}>
                                    <TextInput name="distributionNetwork" />
                                </Field>
                                <Field name="transformerOwnership" label={i18n('form.transformerOwnership')}>
                                    <TextInput name="transformerOwnership" />
                                </Field>
                                <Field name="sharedSubstation" label={i18n('form.sharedSubstation')}>
                                    <TextInput name="sharedSubstation" />
                                </Field>
                                <Field name="normalLoad" label={i18n('form.normalLoad')}>
                                    <TextInput name="normalLoad" />
                                </Field>
                                <Field name="fluctuatingLoad" label={i18n('form.fluctuatingLoad')}>
                                    <TextInput name="fluctuatingLoad" />
                                </Field>
                                <Field name="plannerGroup" label={i18n('form.plannerGroup')}>
                                    <TextInput name="plannerGroup" />
                                </Field>
                                <Field name="workPosition" label={i18n('form.workPosition')}>
                                    <TextInput name="workPosition" />
                                </Field>
                                <Field name="lockerSequence" label={i18n('form.lockerSequence')}>
                                    <TextInput name="lockerSequence" />
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
