import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module';
import { CurrencyModule } from './currency/currency.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CartModule, CurrencyModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
