import { IsBoolean, IsIn } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Currency } from '../common/value-object/currency.enum';

export class CheckoutDto {
  @IsIn(Object.values(Currency))
  @ApiProperty({
    writeOnly: true,
    examples: Object.values(Currency),
    enum: Object.values(Currency),
  })
  public readonly currency: Currency;
}
