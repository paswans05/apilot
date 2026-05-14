export type WingetPackage = {
	name: string;
	id: string;
	version: string;
	available: string;
	source: string;
};

const wingetService = {
	list: async (): Promise<WingetPackage[]> => {
		if (!window.ipcRenderer) {
			console.error('ipcRenderer is not available. Are you running in Electron?');
			return [];
		}
		return window.ipcRenderer.invoke('winget:list');
	},
	upgrade: async (id: string): Promise<{ success: boolean; output?: string; error?: string }> => {
		if (!window.ipcRenderer) {
			return { success: false, error: 'ipcRenderer is not available' };
		}
		return window.ipcRenderer.invoke('winget:upgrade', id);
	}
};

export default wingetService;
