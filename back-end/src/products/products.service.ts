import { Injectable } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createProduct(data: CreateProductRequest, id: number) {
    return this.prismaService.product.create({
      data: {
        ...data,
        userId: id,
      },
    });
  }

  async getProducts() {
    const products = await this.prismaService.product.findMany();
    return Promise.all(
      products.map(async (product) => {
        return {
          ...product,
          imageExits: await this.imageExits(product.id),
        };
      }),
    );
  }

  private async imageExits(productId: number) {
    try {
      await fs.access(
        join(__dirname, '../../', `public/products/${productId}.png`),
        fs.constants.F_OK,
      );
      return true;
    } catch (err) {
      return false;
    }
  }
}
