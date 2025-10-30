// src/modules/order/presentation/controllers/process-order/process-order.controller.spec.ts
import { ProcessOrderUseCase } from '../../../application/usecases/process-order/process-order.usecase';
import { ResultAssertionHelper } from '../../../../../testing/helpers/result-assertion.helper';
import { ControllerError } from '../../../../../core/errors/controller.error';
import { UseCaseError } from '../../../../../core/errors/usecase.error';
import { Result } from '../../../../../core/domain/result';
import { OrderStatus } from '../../../domain/value-objects/order-status';
import { ProcessOrderController } from '../../../presentation/controllers/process-order/process-order.controller';
import { OrderTestFactory } from '../../../testing/factories/order.factory';

describe('ProcessOrderController', () => {
  let controller: ProcessOrderController;
  let mockUseCase: jest.Mocked<ProcessOrderUseCase>;

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new ProcessOrderController(mockUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    describe('Success Cases', () => {
      it('should successfully process order and return processed order data', async () => {
        // Arrange
        const processedOrder = OrderTestFactory.createProcessingOrder({
          id: 'OR001',
        });
        mockUseCase.execute.mockResolvedValue(Result.success(processedOrder));

        // Act
        const result = await controller.handle('OR001');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value).toEqual(processedOrder);
        expect(result.value.status).toBe(OrderStatus.PROCESSING);
        expect(mockUseCase.execute).toHaveBeenCalledWith('OR001');
        expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
      });

      it('should handle COD order processing', async () => {
        // Arrange
        const codOrder = OrderTestFactory.createProcessingOrder({
          id: 'OR002',
          paymentInfo: {
            ...OrderTestFactory.createCashOnDeliveryOrder().paymentInfo,
          },
        });
        mockUseCase.execute.mockResolvedValue(Result.success(codOrder));

        // Act
        const result = await controller.handle('OR002');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.id).toBe('OR002');
        expect(result.value.status).toBe(OrderStatus.PROCESSING);
      });

      it('should handle multi-item order processing', async () => {
        // Arrange
        const multiItemOrder = OrderTestFactory.createMultiItemOrder(5);
        const processedMultiItem = {
          ...multiItemOrder,
          status: OrderStatus.PROCESSING,
        };
        mockUseCase.execute.mockResolvedValue(
          Result.success(processedMultiItem),
        );

        // Act
        const result = await controller.handle(multiItemOrder.id);

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.items.length).toBe(5);
        expect(result.value.status).toBe(OrderStatus.PROCESSING);
      });
    });

    describe('Failure Cases - Use Case Errors', () => {
      it('should propagate use case error when order not found', async () => {
        // Arrange
        const useCaseError = new UseCaseError('Order with id OR999 not found');
        mockUseCase.execute.mockResolvedValue(Result.failure(useCaseError));

        // Act
        const result = await controller.handle('OR999');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order with id OR999 not found',
          UseCaseError,
        );
        expect(mockUseCase.execute).toHaveBeenCalledWith('OR999');
      });

      it('should propagate use case error when order is not processable', async () => {
        // Arrange
        const useCaseError = new UseCaseError(
          'Order is not in a shippable state',
        );
        mockUseCase.execute.mockResolvedValue(Result.failure(useCaseError));

        // Act
        const result = await controller.handle('OR003');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order is not in a shippable state',
          UseCaseError,
        );
        expect(mockUseCase.execute).toHaveBeenCalledWith('OR003');
      });

      it('should handle use case validation failures', async () => {
        // Arrange
        const useCaseError = new UseCaseError('Cannot process cancelled order');
        mockUseCase.execute.mockResolvedValue(Result.failure(useCaseError));

        // Act
        const result = await controller.handle('OR004');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Cannot process cancelled order',
          UseCaseError,
        );
      });

      it('should handle use case repository errors', async () => {
        // Arrange
        const repositoryError = new UseCaseError(
          'Database connection failed',
          new Error('Connection timeout'),
        );
        mockUseCase.execute.mockResolvedValue(Result.failure(repositoryError));

        // Act
        const result = await controller.handle('OR005');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Database connection failed',
          UseCaseError,
        );
      });
    });

    describe('Failure Cases - Unexpected Errors', () => {
      it('should handle unexpected exceptions from use case', async () => {
        // Arrange
        mockUseCase.execute.mockRejectedValue(
          new Error('Unexpected runtime error'),
        );

        // Act
        const result = await controller.handle('OR006');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Unexpected Controller Error',
          ControllerError,
        );
      });

      it('should handle null or undefined errors gracefully', async () => {
        // Arrange
        mockUseCase.execute.mockRejectedValue(null);

        // Act
        const result = await controller.handle('OR007');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Unexpected Controller Error',
          ControllerError,
        );
      });

      it('should handle use case throwing non-Error objects', async () => {
        // Arrange
        mockUseCase.execute.mockRejectedValue('String error');

        // Act
        const result = await controller.handle('OR008');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Unexpected Controller Error',
          ControllerError,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty order ID', async () => {
        // Arrange
        const useCaseError = new UseCaseError('Invalid order ID');
        mockUseCase.execute.mockResolvedValue(Result.failure(useCaseError));

        // Act
        const result = await controller.handle('');

        // Assert
        ResultAssertionHelper.assertResultFailure(result);
        expect(mockUseCase.execute).toHaveBeenCalledWith('');
      });

      it('should handle order ID with special characters', async () => {
        // Arrange
        const orderId = 'OR-2025-001#SPECIAL';
        const processedOrder = OrderTestFactory.createProcessingOrder({
          id: orderId,
        });
        mockUseCase.execute.mockResolvedValue(Result.success(processedOrder));

        // Act
        const result = await controller.handle(orderId);

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.id).toBe(orderId);
        expect(mockUseCase.execute).toHaveBeenCalledWith(orderId);
      });

      it('should handle very long order IDs', async () => {
        // Arrange
        const longOrderId = 'OR' + '0'.repeat(100);
        const useCaseError = new UseCaseError('Order ID too long');
        mockUseCase.execute.mockResolvedValue(Result.failure(useCaseError));

        // Act
        const result = await controller.handle(longOrderId);

        // Assert
        ResultAssertionHelper.assertResultFailure(result);
        expect(mockUseCase.execute).toHaveBeenCalledWith(longOrderId);
      });

      it('should not modify use case result on success', async () => {
        // Arrange
        const originalOrder = OrderTestFactory.createProcessingOrder({
          id: 'OR009',
        });
        const useCaseResult = Result.success(originalOrder);
        mockUseCase.execute.mockResolvedValue(useCaseResult);

        // Act
        const result = await controller.handle('OR009');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value).toEqual(originalOrder);
      });
    });

    describe('Integration Scenarios', () => {
      it('should maintain error chain from use case to controller', async () => {
        // Arrange
        const rootCause = new Error('Database timeout');
        const useCaseError = new UseCaseError(
          'Failed to process order',
          rootCause,
        );
        mockUseCase.execute.mockResolvedValue(Result.failure(useCaseError));

        // Act
        const result = await controller.handle('OR010');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Failed to process order',
          UseCaseError,
        );
      });

      it('should handle rapid successive calls correctly', async () => {
        // Arrange
        const order1 = OrderTestFactory.createProcessingOrder({ id: 'OR011' });
        const order2 = OrderTestFactory.createProcessingOrder({ id: 'OR012' });
        mockUseCase.execute
          .mockResolvedValueOnce(Result.success(order1))
          .mockResolvedValueOnce(Result.success(order2));

        // Act
        const result1 = await controller.handle('OR011');
        const result2 = await controller.handle('OR012');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result1);
        ResultAssertionHelper.assertResultSuccess(result2);
        expect(result1.value.id).toBe('OR011');
        expect(result2.value.id).toBe('OR012');
        expect(mockUseCase.execute).toHaveBeenCalledTimes(2);
      });
    });
  });
});
