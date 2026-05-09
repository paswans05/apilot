import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import TaskForm from './components/task-form/TaskForm';

const TasksApp = lazy(() => import('./TasksApp'));

/**
 * The Tasks App Route
 */
const TasksAppRoute: FuseRouteItemType = {
	path: 'apps/tasks',
	element: <TasksApp />,
	children: [
		{
			path: ':taskId',
			element: <TaskForm />
		},
		{
			path: ':taskId/:newTaskType',
			element: <TaskForm />
		}
	]
};

export default TasksAppRoute;
