import type { OrderImportData } from '@interfaces/order.interface.ts';

const REQUIRED_FIELDS: ReadonlyArray<keyof OrderImportData> = [
    'serviceType',
    'meterNumber',
    'orderStatus',
    'issueDate',
    'accountNumber',
    'lastName',
    'firstName',
    'idNumber',
    'email',
    'phone',
    'orderLocation',
];

export const validateImportData = (data: OrderImportData): Array<string> =>
    REQUIRED_FIELDS.reduce<Array<string>>((errors, field) => {
        const value = data[field];
        const isEmpty = value === null || value === undefined || `${value}`.trim() === '';
        return isEmpty ? [...errors, `Missing ${field}.`] : errors;
    }, []);
