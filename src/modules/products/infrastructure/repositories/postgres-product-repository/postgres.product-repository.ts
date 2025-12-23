// src\modules\products\infrastructure\repositories\PostgresProductRepository\postgres.product-repository.ts
import { Repository } from 'typeorm';
import { Result } from '../../../../../core/domain/result';
import { RepositoryError } from '../../../../../core/errors/repository.error';
import { ProductRepository } from '../../../domain/repositories/product-repository';
import { ProductEntity } from '../../orm/product.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { CreateProductDto } from '../../../presentation/dto/create-product.dto';
import { UpdateProductDto } from '../../../presentation/dto/update-product.dto';
import { IProduct } from '../../../domain/interfaces/product.interface';

export class PostgresProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly ormRepo: Repository<ProductEntity>,
  ) {}
  async save(
    createProductDto: CreateProductDto,
  ): Promise<Result<IProduct, RepositoryError>> {
    try {
      const entity = this.ormRepo.create({
        ...createProductDto,
        createdAt: new Date(),
      });
      const savedEntity = await this.ormRepo.save(entity);

      // Map back to IProduct (domain interface)
      // Note: savedEntity.id is number, IProduct.id is string.
      // We need to ensure compatibility.
      return Result.success<IProduct>({
        ...savedEntity,
        id: savedEntity.id.toString(),
      });
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to save the product`, error);
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Result<IProduct, RepositoryError>> {
    try {
      // Ensure the product exists first
      const existing = await this.ormRepo.findOne({
        where: { id: parseInt(id, 10) },
      });
      if (!existing) {
        return ErrorFactory.RepositoryError(`Product with ID ${id} not found`);
      }

      // Merge new values into the existing entity
      const updatedProduct = this.ormRepo.merge(existing, {
        ...updateProductDto,
        updatedAt: new Date(),
      });

      await this.ormRepo.save(updatedProduct);
      return Result.success<IProduct>({
        ...updatedProduct,
        id: updatedProduct.id.toString(),
      });
    } catch (error) {
      return ErrorFactory.RepositoryError(
        `Failed to update the product`,
        error,
      );
    }
  }
  async findById(id: string): Promise<Result<IProduct, RepositoryError>> {
    try {
      const product = await this.ormRepo.findOne({
        where: { id: parseInt(id, 10) },
      });
      if (!product) return ErrorFactory.RepositoryError('Product not found');

      return Result.success<IProduct>({
        ...product,
        id: product.id.toString(),
      });
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to find the product`, error);
    }
  }
  async findAll(): Promise<Result<IProduct[], RepositoryError>> {
    try {
      const productsList = await this.ormRepo.find();

      if (productsList.length <= 0) {
        return ErrorFactory.RepositoryError('Did not find any products');
      }
      const products = productsList.map((p) => ({
        ...p,
        id: p.id.toString(),
      }));
      return Result.success<IProduct[]>(products);
    } catch (error) {
      return ErrorFactory.RepositoryError(`Failed to find products`, error);
    }
  }
  async deleteById(id: string): Promise<Result<void, RepositoryError>> {
    try {
      await this.ormRepo.delete(parseInt(id, 10));
      return Result.success<void>(undefined);
    } catch (error) {
      return ErrorFactory.RepositoryError(
        `Failed to delete the product`,
        error,
      );
    }
  }
}
