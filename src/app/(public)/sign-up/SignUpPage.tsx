import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState } from 'react';
import _ from 'lodash';
import JwtSignUpTab from './tabs/JwSignUpTab';
import FirebaseSignUpTab from './tabs/FirebaseSignUpTab';
import AwsSignUpTab from './tabs/AwsSignUpTab';

const tabs = [
	{
		id: 'jwt',
		title: 'JWT',
		logo: '/assets/images/logo/jwt.svg',
		logoClass: 'h-9 p-1 bg-black rounded-lg'
	},
	{
		id: 'firebase',
		title: 'Firebase',
		logo: '/assets/images/logo/firebase.svg',
		logoClass: 'h-9'
	},
	{
		id: 'aws',
		title: 'AWS',
		logo: '/assets/images/logo/aws-amplify.svg',
		logoClass: 'h-9'
	}
];

/**
 * The sign up page.
 */
function SignUpPage() {
	const [selectedTabId, setSelectedTabId] = useState(tabs[0].id);

	function handleSelectTab(id: string) {
		setSelectedTabId(id);
	}

	return (
		<div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center">
			<Paper className="min-h-full w-full rounded-none px-4 py-8 sm:min-h-auto sm:w-auto sm:rounded-xl sm:p-12 sm:shadow-sm">
				<div className="mx-auto w-full max-w-80 sm:mx-0 sm:w-80">
					<img
						className="w-12"
						src="/assets/images/logo/logo.svg"
						alt="logo"
					/>

					<Typography className="mt-8 text-4xl font-extrabold leading-[1.25] tracking-tight">
						Sign up
					</Typography>
					<div className="mt-0.5 flex items-baseline font-medium">
						<Typography>Already have an account?</Typography>
						<Link
							className="ml-1"
							to="/sign-in"
						>
							Sign in
						</Link>
					</div>

					<Tabs
						value={_.findIndex(tabs, { id: selectedTabId })}
						variant="fullWidth"
						className="w-full mt-6 mb-8"
						slotProps={{
							indicator: {
								className: 'flex justify-center bg-transparent w-full h-full',
								children: (
									<Box
										sx={{ borderColor: (theme) => theme.palette.secondary.main }}
										className="border-1 border-solid w-full h-full rounded-lg"
									/>
								)
							}
						}}
					>
						{tabs.map((item) => (
							<Tab
								disableRipple
								onClick={() => handleSelectTab(item.id)}
								key={item.id}
								icon={
									<img
										className={item.logoClass}
										src={item.logo}
										alt={item.title}
									/>
								}
								className="min-w-0"
								label={item.title}
							/>
						))}
					</Tabs>

					{selectedTabId === 'jwt' && <JwtSignUpTab />}
					{selectedTabId === 'firebase' && <FirebaseSignUpTab />}
					{selectedTabId === 'aws' && <AwsSignUpTab />}
				</div>
			</Paper>

		</div>
	);
}

export default SignUpPage;
