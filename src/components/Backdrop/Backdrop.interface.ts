type Type = 'blur' | 'dark';

export interface BackdropProps {
    isEnabled: boolean;
    className?: string;
    onClick?: () => void;
    type?: Type;
    boundTo?: 'screen' | 'parent';
}
