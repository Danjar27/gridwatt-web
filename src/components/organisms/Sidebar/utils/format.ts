export const buildUserInitials = (fullName: string): string => {
    if (!fullName) {
        return 'USER';
    }

    return fullName
        .split(' ')
        .map((word) => word[0])
        .join('')
};
