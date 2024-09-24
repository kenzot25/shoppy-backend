import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [PrismaModule],
  exports: [ProductsModule, ProductsService],
})
export class ProductsModule {}
