import type { ClassValue } from 'clsx';

import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export const classes = (...inputs: Array<ClassValue>) => twMerge(clsx(inputs));
