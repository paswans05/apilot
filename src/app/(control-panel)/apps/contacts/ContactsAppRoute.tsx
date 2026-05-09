import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import ContactView from './contact/ContactView';
import ContactForm from './contact-form/ContactForm';

const ContactsApp = lazy(() => import('./ContactsApp'));

/**
 * The ContactsApp Route.
 */
const ContactsAppRoute: FuseRouteItemType = {
	path: 'apps/contacts',
	element: <ContactsApp />,
	children: [
		{
			path: ':contactId',
			element: <ContactView />
		},
		{
			path: ':contactId/edit',
			element: <ContactForm />
		}
	]
};

export default ContactsAppRoute;
