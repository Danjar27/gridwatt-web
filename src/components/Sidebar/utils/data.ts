import type { Section } from '@components/Sidebar/Sidebar.interface';
import type { Role } from '@interfaces/user.interface';

import { NAVIGATION_ITEMS } from '@components/Sidebar/utils/constants';

export const getAvailableRoutesByRole = (role: Role): Array<Section> => {
    const validSections: Array<Section> = [];

    for (const section of NAVIGATION_ITEMS) {
        const allowedRoutes = section.routes.filter((route) => !route.roles || route.roles.includes(role));

        if (allowedRoutes.length > 0) {
            validSections.push({ ...section, routes: allowedRoutes });
        }
    }

    return validSections;
};
