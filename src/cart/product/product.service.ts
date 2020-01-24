import { Injectable } from '@nestjs/common';

import { CRUDService } from '../../common/service/crud.service';
import { Product } from './product.entity';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService extends CRUDService<Product> {
  constructor(respository: ProductRepository) {
    super(respository);
  }
}
