import { Injectable } from '@nestjs/common';

import { ClassMapper } from '../../common/service/class.mapper';
import { IdentifiedProductDto, ProductDto } from './product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductMapper extends ClassMapper<Product, ProductDto> {
  constructor() {
    super(Product, ProductDto);
  }

  public toDto(entity: Product): IdentifiedProductDto {
    return Object.assign(
      new IdentifiedProductDto(),
      entity,
    );
  }
}
