import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import electron from 'vite-plugin-electron/simple';
import renderer from 'vite-plugin-electron-renderer';

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	plugins: [
		react({
			jsxImportSource: '@emotion/react'
		}),
		svgrPlugin(),
		electron({
			main: {
				// Shortcut of `build.lib.entry`.
				entry: 'electron/main.ts',
				vite: {
					build: {
						outDir: 'dist',
					},
				},
			},
			preload: {
				// Preload scripts may contain Web assets, so use `build.rollupOptions.input` instead `build.lib.entry`.
				input: path.join(__dirname, 'electron/preload.ts'),
				vite: {
					build: {
						outDir: 'dist',
					},
				},
			},
		}),
		process.env.NODE_ENV !== 'test' && renderer(),
		{
			name: 'custom-hmr-control',
			handleHotUpdate({ file, server }) {
				if (file.includes('src/app/configs/')) {
					server.ws.send({
						type: 'full-reload'
					});
					return [];
				}
			}
		},
		tailwindcss(),
	],
	build: {
		outDir: 'build'
	},
	server: {
		host: '0.0.0.0',
		open: true,
		strictPort: false,
		port: 5000
	},
	define: {
		'import.meta.env.VITE_PORT': JSON.stringify(process.env.PORT || 8000),
		global: 'window'
	},
	resolve: {
		// Native tsconfig paths resolution (replaces vite-tsconfig-paths plugin)
		tsconfigPaths: true,
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@fuse': path.resolve(__dirname, './src/@fuse'),
			'@history': path.resolve(__dirname, './src/@history'),
			'@lodash': path.resolve(__dirname, './src/@lodash'),
			'@mock-api': path.resolve(__dirname, './src/@mock-api'),
			'@schema': path.resolve(__dirname, './src/@schema'),
			'app/store': path.resolve(__dirname, './src/app/store'),
			'app/shared-components': path.resolve(__dirname, './src/app/shared-components'),
			'app/configs': path.resolve(__dirname, './src/app/configs'),
			'app/theme-layouts': path.resolve(__dirname, './src/app/theme-layouts'),
			'app/AppContext': path.resolve(__dirname, './src/app/AppContext')
		}
	},
	optimizeDeps: {
		include: [
			'@mui/icons-material',
			'@mui/material',
			'@mui/base',
			'@mui/styles',
			'@mui/system',
			'@mui/utils',
			'@emotion/cache',
			'@emotion/react',
			'@emotion/styled',
			'date-fns',
			'lodash'
		],
		exclude: [],
	}
});
