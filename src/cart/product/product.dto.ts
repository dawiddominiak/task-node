import { IsInt, IsOptional, IsString, Max, MaxLength, Min, Validate } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MoneyValidator } from '../../common/validator/money.validator';
import { Money } from '../../common/value-object/money.value-object';

const MAX_PRICE = 1e10;

export class ProductDto {
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the product',
  })
  public readonly name: string;

  @Validate(MoneyValidator, [0, MAX_PRICE])
  @ApiProperty({
    example: {
      amount: '10.00',
      currency: 'EUR',
    },
  })
  public readonly price: Money;

  @IsInt()
  @Min(0)
  @Max(1000)
  @ApiProperty({
    description: 'Number of products in the cart.',
  })
  public readonly quantity: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Description of the product on the list',
  })
  public readonly description: string;
}

export class IdentifiedProductDto extends ProductDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    minimum: 1,
    uniqueItems: true,
    readOnly: true,
  })
  public readonly id: number;
}
