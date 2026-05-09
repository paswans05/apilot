import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import IconButton from '@mui/material/IconButton';
import { Outlet } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * The contacts sidebar content.
 */
function ContactsSidebarContent() {
	return (
		<div className="flex flex-col flex-auto max-w-full">
			<IconButton
				className="absolute top-0 right-0 my-4 mx-8 z-10"
				sx={{
					backgroundColor: 'primary.light',
					color: 'primary.contrastText',
					'&:hover': {
						backgroundColor: 'primary.main',
						color: 'primary.contrastText'
					}
				}}
				component={NavLinkAdapter}
				to="/apps/contacts"
			>
				<FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
			</IconButton>

			<Outlet />
		</div>
	);
}

export default ContactsSidebarContent;
