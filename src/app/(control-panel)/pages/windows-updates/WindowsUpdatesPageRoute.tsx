import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WindowsUpdatesPage = lazy(() => import('./WindowsUpdatesPage'));

const WindowsUpdatesPageRoute: FuseRouteItemType = {
	path: 'apps/windows-updates',
	element: <WindowsUpdatesPage />
};

export default WindowsUpdatesPageRoute;
