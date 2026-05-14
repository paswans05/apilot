import { ipcRenderer } from 'electron';

export type WingetPackage = {
	name: string;
	id: string;
	version: string;
	available: string;
	source: string;
};

const wingetService = {
	list: async (): Promise<WingetPackage[]> => {
		return ipcRenderer.invoke('winget:list');
	},
	upgrade: async (id: string): Promise<{ success: boolean; output?: string; error?: string }> => {
		return ipcRenderer.invoke('winget:upgrade', id);
	}
};

export default wingetService;
