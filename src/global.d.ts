/**
 * The module for importing CSS files.
 */
declare module '*.css' {
	const content: Record<string, string>;
	export default content;
}

/**
 * The type definition for the Node.js process object with additional properties.
 */
type ProcessType = NodeJS.Process & {
	browser: boolean;
	env: Record<string, string | undefined>;
};

/**
 * The global process object.
 */
declare let process: ProcessType;

/**
 * The type definition for the Hot Module object.
 */
interface HotModule {
	hot?: {
		status: () => string;
	};
}

declare const module: HotModule;
declare module '*?raw' {
	const content: string;
	export default content;
}

interface Window {
	ipcRenderer: {
		on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
		off: (channel: string, ...args: any[]) => void;
		send: (channel: string, ...args: any[]) => void;
		invoke: (channel: string, ...args: any[]) => Promise<any>;
	};
}
