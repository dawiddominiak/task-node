import { IsBoolean, IsInt, Min, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ProductDto } from './product/product.dto';

export class CartDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    name: 'Cart identity',
    minimum: 1,
    uniqueItems: true,
    readOnly: true,
  })
  public readonly id: number;

  @IsBoolean()
  @ApiProperty({
    name: 'The paid flag',
    description: 'Flag indicating whether cart was already checked.',
    readOnly: true,
  })
  public readonly paid: boolean;

  @ValidateNested({ each: true })
  @ApiProperty({
    name: 'Products',
    description: 'All the products in the cart',
    readOnly: true,
  })
  public readonly products: ProductDto[];
}
