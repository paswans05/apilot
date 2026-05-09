import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ECommerceApp = lazy(() => import('./ECommerceApp'));
const Product = lazy(() => import('./products/product/Product'));
const Products = lazy(() => import('./products/Products'));
const Order = lazy(() => import('./orders/order/Order'));
const Orders = lazy(() => import('./orders/Orders'));

/**
 * The E-Commerce app Routes.
 */
const ECommerceAppRoute: FuseRouteItemType = {
	path: 'apps/e-commerce',
	element: <ECommerceApp />,
	children: [
		{
			path: '',
			element: <Navigate to="products" />
		},
		{
			path: 'products',
			children: [
				{
					path: '',
					element: <Products />
				},
				{
					path: ':productId/:handle?',
					element: <Product />
				}
			]
		},
		{
			path: 'orders',
			children: [
				{
					path: '',
					element: <Orders />
				},
				{
					path: ':orderId',
					element: <Order />
				}
			]
		}
	]
};

export default ECommerceAppRoute;
