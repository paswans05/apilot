import FusePageSimple from '@fuse/core/FusePageSimple';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import TasksSidebarContent from './components/TasksSidebarContent';
import TasksHeader from './components/TasksHeader';
import TasksList from './components/TasksList';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .container': {
		maxWidth: '100%!important'
	},
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		boxShadow: `inset 0 -1px 0 0px ${theme.palette.divider}`
	}
}));

/**
 * The tasks app.
 */
function TasksApp() {
	const routeParams = useParams();
	const { taskId } = routeParams;
	const { newTaskType } = routeParams;
	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	useEffect(() => {
		setRightSidebarOpen(Boolean(taskId || newTaskType));
	}, [taskId, newTaskType]);

	return (
		<Root
			header={<TasksHeader />}
			content={<TasksList />}
			rightSidebarContent={
				<TasksSidebarContent>
					<Outlet />
				</TasksSidebarContent>
			}
			rightSidebarOpen={rightSidebarOpen}
			rightSidebarOnClose={() => setRightSidebarOpen(false)}
			rightSidebarWidth={640}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default TasksApp;
