import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const classnames = (...inputs: Array<ClassValue>) => twMerge(clsx(inputs));
