import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useAppSelector } from 'src/store/hooks';
import DetailSidebarContent from './DetailSidebarContent';
import FileManagerHeader from './FileManagerHeader';
import { selectSelectedItemId } from './fileManagerAppSlice';
import FileManagerList from '@/app/(control-panel)/apps/file-manager/FileManagerList';

/**
 * The file manager app.
 */
function FileManagerApp() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const selectedItemId = useAppSelector(selectSelectedItemId);

	return (
		<FusePageCarded
			header={<FileManagerHeader />}
			content={<FileManagerList />}
			rightSidebarOpen={!!selectedItemId}
			rightSidebarContent={<DetailSidebarContent />}
			rightSidebarWidth={400}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default FileManagerApp;
