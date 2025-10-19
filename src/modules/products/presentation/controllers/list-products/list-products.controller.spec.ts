// src/modules/Products/presentation/controllers/list-products.controller.spec.ts
import { ListProductsController } from './list-products.controller';
import { ListProductsUseCase } from '../../../application/usecases/list-products/list-products.usecase';
import { ProductTestFactory } from '../../../testing/factories/product.factory';
import { ErrorFactory } from '../../../../../core/errors/error.factory';
import { ControllerError } from '../../../../../core/errors/controller.error';
import { Result } from '../../../../../core/domain/result';
import { ResultAssertionHelper } from '../../../../../testing';

describe('ListProductsController', () => {
  let controller: ListProductsController;
  let mockListProductsUseCase: jest.Mocked<ListProductsUseCase>;

  beforeEach(() => {
    mockListProductsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListProductsUseCase>;

    controller = new ListProductsController(mockListProductsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should return success if any Product is found', async () => {
      const products = ProductTestFactory.createProductList(3);

      mockListProductsUseCase.execute.mockResolvedValue(
        Result.success(products),
      );

      const result = await controller.handle();

      ResultAssertionHelper.assertResultSuccess(result);
      expect(result.value).toHaveLength(3);
      expect(mockListProductsUseCase.execute).toHaveBeenCalledWith();
      expect(mockListProductsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return Failure(ControllerError) if no product is found', async () => {
      mockListProductsUseCase.execute.mockResolvedValue(
        Result.failure(ErrorFactory.UseCaseError('Products not found').error),
      );

      const result = await controller.handle();

      ResultAssertionHelper.assertResultFailure(
        result,
        'Controller failed to get products',
        ControllerError,
      );
    });

    it('should return Failure(ControllerError) if usecase throws unexpected error', async () => {
      const error = new Error('Database connection failed');

      mockListProductsUseCase.execute.mockRejectedValue(error);

      const result = await controller.handle();

      ResultAssertionHelper.assertResultFailure(
        result,
        'Unexpected controller error',
        ControllerError,
        error,
      );
    });

    it('should return list with different product types', async () => {
      const products = [
        ProductTestFactory.createElectronicsProduct(),
        ProductTestFactory.createClothingProduct(),
        ProductTestFactory.createFoodProduct(),
      ];

      mockListProductsUseCase.execute.mockResolvedValue(
        Result.success(products),
      );

      const result = await controller.handle();

      ResultAssertionHelper.assertResultSuccess(result);
      expect(result.value).toHaveLength(3);
    });
  });
});
