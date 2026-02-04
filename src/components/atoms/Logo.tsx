import type { FC } from 'react';

interface LogoProps {
    className?: string;
}

const Logo: FC<LogoProps> = ({ className }) => (
    <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
        <path
            fill="currentColor"
            d="M256.04,440.02l-50.26-26.29,63.71-94.53,71.05-104.26-74.72-1.04,48.86-137.44c35.82,5.24,66.82,15.17,99.53,29.61l-.08,148.94c-.82,51.65-23.89,97.46-64.93,128.27-29.1,21.84-58.93,39.53-93.16,56.74h0Z"
        />
        <path
            fill="currentColor"
            d="M193.64,403.95l-18.71-11.91c-34.41-21.9-59.22-55.25-71.29-94.2-4.35-19.72-5.86-38.44-5.85-58.83l.08-132.28c61.29-28.78,129.11-40.36,197.11-32.19l-95.98,145.52-29.07,43.01,76.69.58-52.97,140.31h0Z"
        />
    </svg>
);

export default Logo;
