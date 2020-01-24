import { Routes } from 'nest-router';

import { CartModule } from './cart/cart.module';
import { ProductModule } from './cart/product/product.module';

export const routes: Routes = [
  {
    path: '/cart',
    module: CartModule,
    children: [
      {
        path: ':cartId/products',
        module: ProductModule,
      },
    ],
  },
];
