import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGES } from './product-image';
import { Prisma } from '@prisma/client';
import { ProductsGateway } from './products.gateway';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productGateway: ProductsGateway,
  ) {}
  async createProduct(data: CreateProductRequest, id: number) {
    const product = await this.prismaService.product.create({
      data: {
        ...data,
        userId: id,
      },
    });
    this.productGateway.handleProductUpdated();
    return product;
  }

  async getProduct(productId: number) {
    try {
      return {
        ...(await this.prismaService.product.findUniqueOrThrow({
          where: {
            id: productId,
          },
        })),
        imageExits: await this.imageExits(productId),
      };
    } catch (err) {
      throw new NotFoundException(`Product not found with id ${productId}`);
    }
  }

  async getProducts(status: string) {
    const args: Prisma.ProductFindManyArgs = {};
    if (status === 'available') {
      args.where = {
        sold: false,
      };
    }
    const products = await this.prismaService.product.findMany(args);
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
        join(`${PRODUCT_IMAGES}/${productId}.png`),
        fs.constants.F_OK,
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  async update(productId: number, data: Prisma.ProductUpdateInput) {
    try {
      await this.prismaService.product.update({
        where: {
          id: productId,
        },
        data,
      });
      this.productGateway.handleProductUpdated();
    } catch (err) {
      throw new NotFoundException(`Product not found with id ${productId}`);
    }
  }
}
