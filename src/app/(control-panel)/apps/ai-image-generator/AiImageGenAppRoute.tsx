import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const AiImageGenApp = lazy(() => import('./AiImageGenApp'));

/**
 * The AI Image Generator app routes.
 */
const AiImageGenAppRoute: FuseRouteItemType = {
	path: 'apps/ai-image-generator',
	element: <AiImageGenApp />
};

export default AiImageGenAppRoute;
