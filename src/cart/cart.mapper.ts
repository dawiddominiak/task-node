import { Injectable } from '@nestjs/common';

import { ClassMapper } from '../common/service/class.mapper';
import { CartDto } from './cart.dto';
import { Cart } from './cart.entity';
import { ProductMapper } from './product/product.mapper';

@Injectable()
export class CartMapper extends ClassMapper<Cart, CartDto> {
  constructor(
    private readonly productMapper: ProductMapper,
  ) {
    super(Cart, CartDto);
  }

  public toDto(cart: Cart): CartDto {
    return Object.assign(
      new CartDto(),
      {
        ...cart,
        products: this.productMapper.allToDto(cart.products),
      },
    );
  }

  public toEntity(cartDto: CartDto): Cart {
    return Object.assign(
      new Cart(),
      {
        ...cartDto,
        products: this.productMapper.allToEntity(cartDto.products),
      },
    );
  }
}
