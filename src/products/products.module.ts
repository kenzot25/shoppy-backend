import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsGateway } from './products.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsGateway],
  imports: [PrismaModule, AuthModule],
  exports: [ProductsModule, ProductsService],
})
export class ProductsModule {}