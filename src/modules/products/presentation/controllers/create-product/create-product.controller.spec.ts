// src/modules/Products/presentation/controllers/Create-Product.controller.spec.ts
import { CreateProductController } from './create-product.controller';
import { CreateProductUseCase } from '../../../application/usecases/create-product/create-product.usecase';
import { ProductTestFactory } from '../../../testing/factories/product.factory';
import { CreateProductDtoFactory } from '../../../testing/factories/create-product-dto.factory';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { ControllerError } from '../../../../../core/errors/controller.error';
import { Result } from '../../../../../core/domain/result';
import { ResultAssertionHelper } from '../../../../../testing';

describe('CreateProductController', () => {
  let controller: CreateProductController;
  let mockCreateProductUseCase: jest.Mocked<CreateProductUseCase>;

  beforeEach(() => {
    mockCreateProductUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateProductUseCase>;

    controller = new CreateProductController(mockCreateProductUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should return success if product is created', async () => {
      const createDto = CreateProductDtoFactory.createMockDto();
      const product = ProductTestFactory.createMockProduct();

      mockCreateProductUseCase.execute.mockResolvedValue(
        Result.success(product),
      );

      const result = await controller.handle(createDto);

      ResultAssertionHelper.assertResultSuccess(result);
      expect(result.value).toBe(product);
      expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(mockCreateProductUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return Failure(ControllerError) if product is not created', async () => {
      const createDto = CreateProductDtoFactory.createMockDto();

      mockCreateProductUseCase.execute.mockResolvedValue(
        Result.failure(
          ErrorFactory.UseCaseError('Failed to save product').error,
        ),
      );

      const result = await controller.handle(createDto);

      ResultAssertionHelper.assertResultFailure(
        result,
        'Controller failed to create product',
        ControllerError,
      );
    });

    it('should return Failure(ControllerError) if usecase throws unexpected error', async () => {
      const createDto = CreateProductDtoFactory.createMockDto();
      const error = new Error('Database connection failed');

      mockCreateProductUseCase.execute.mockRejectedValue(error);

      const result = await controller.handle(createDto);

      ResultAssertionHelper.assertResultFailure(
        result,
        'Unexpected controller error',
        ControllerError,
        error,
      );
    });

    it('should create expensive product', async () => {
      const expensiveDto = CreateProductDtoFactory.createExpensiveProductDto();
      const expensiveProduct = ProductTestFactory.createExpensiveProduct();

      mockCreateProductUseCase.execute.mockResolvedValue(
        Result.success(expensiveProduct),
      );

      const result = await controller.handle(expensiveDto);

      ResultAssertionHelper.assertResultSuccess(result);
      expect(result.value.price).toBe(35000);
    });
  });
});
