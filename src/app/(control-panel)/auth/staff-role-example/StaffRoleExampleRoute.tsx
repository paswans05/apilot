import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import StaffRoleExample from './StaffRoleExample';

/**
 * StaffRoleExampleConfig
 */
const StaffRoleExampleRoute: FuseRouteItemType = {
	path: 'auth/staff-role-example',
	element: <StaffRoleExample />,
	auth: authRoles.staff // ['admin','staff']
};

export default StaffRoleExampleRoute;
