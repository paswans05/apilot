import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ProjectDashboardApp = lazy(() => import('./ProjectDashboardApp'));

/**
 * Project Dashboard App  Route
 */
const ProjectDashboardAppRoute: FuseRouteItemType = {
	path: 'dashboards/system-stats',
	element: <ProjectDashboardApp />
};

export default ProjectDashboardAppRoute;
