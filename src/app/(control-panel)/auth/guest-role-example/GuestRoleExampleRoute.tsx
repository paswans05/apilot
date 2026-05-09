import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import GuestRoleExample from './GuestRoleExample';

/**
 * GuestRoleExampleRoute
 */
const GuestRoleExampleRoute: FuseRouteItemType = {
	path: 'auth/guest-role-example',
	element: <GuestRoleExample />,
	auth: authRoles.onlyGuest // ['guest']
};

export default GuestRoleExampleRoute;
