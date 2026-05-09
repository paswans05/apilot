import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Navigate } from 'react-router';

const NotesApp = lazy(() => import('./NotesApp'));

/**
 * The Notes App Route
 */
const NotesAppRoute: FuseRouteItemType = {
	path: 'apps/notes',
	children: [
		{
			path: '',
			element: <Navigate to="all" />
		},
		{
			path: ':filter',
			element: <NotesApp />,
			children: [
				{
					path: ':id'
				}
			]
		}
	]
};

export default NotesAppRoute;
