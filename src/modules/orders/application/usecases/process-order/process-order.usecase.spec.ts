// src/modules/order/application/usecases/process-order/process-order.usecase.spec.ts
import { ProcessOrderUseCase } from './process-order.usecase';
import { MockOrderRepository } from '../../../testing/mocks/order-repository.mock';
import { ResultAssertionHelper } from '../../../../../testing/helpers/result-assertion.helper';
import { UseCaseError } from '../../../../../core/errors/usecase.error';
import { RepositoryError } from '../../../../../core/errors/repository.error';
import { OrderStatus } from '../../../domain/value-objects/order-status';
import { PaymentStatus } from '../../../domain/value-objects/payment-status';
import { OrderBuilder } from '../../../testing';
import { OrderTestFactory } from '../../../testing/factories/order.factory';

describe('ProcessOrderUseCase', () => {
  let useCase: ProcessOrderUseCase;
  let mockRepository: MockOrderRepository;

  beforeEach(() => {
    mockRepository = new MockOrderRepository();
    useCase = new ProcessOrderUseCase(mockRepository);
  });

  afterEach(() => {
    mockRepository.reset();
  });

  describe('execute', () => {
    describe('Success Cases', () => {
      it('should successfully process a confirmed order', async () => {
        // Arrange
        const confirmedOrder = OrderTestFactory.createConfirmedOrder({
          id: 'OR001',
        });
        mockRepository.mockSuccessfulFind(confirmedOrder);
        mockRepository.mockSuccessfulUpdateStatus();

        // Act
        const result = await useCase.execute('OR001');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.status).toBe(OrderStatus.PROCESSING);
        expect(mockRepository.findById).toHaveBeenCalledWith('OR001');
        expect(mockRepository.updateStatus).toHaveBeenCalledWith(
          'OR001',
          OrderStatus.PROCESSING,
        );
      });

      it('should process order with COD payment that is confirmed', async () => {
        // Arrange
        const codOrder = new OrderBuilder()
          .withId('OR002')
          .asCODPending()
          .withStatus(OrderStatus.CONFIRMED)
          .withPaymentStatus(PaymentStatus.NOT_REQUIRED_YET)
          .build();

        mockRepository.mockSuccessfulFind(codOrder);
        mockRepository.mockSuccessfulUpdateStatus();

        // Act
        const result = await useCase.execute('OR002');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.status).toBe(OrderStatus.PROCESSING);
        expect(result.value.paymentInfo.status).toBe(
          PaymentStatus.NOT_REQUIRED_YET,
        );
      });

      it('should process order with completed online payment', async () => {
        // Arrange
        const onlineOrder = OrderTestFactory.createConfirmedOrder({
          id: 'OR003',
          paymentInfo: {
            ...OrderTestFactory.createConfirmedOrder().paymentInfo,
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
        });

        mockRepository.mockSuccessfulFind(onlineOrder);
        mockRepository.mockSuccessfulUpdateStatus();

        // Act
        const result = await useCase.execute('OR003');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.status).toBe(OrderStatus.PROCESSING);
        expect(result.value.paymentInfo.status).toBe(PaymentStatus.COMPLETED);
      });

      it('should process multi-item order', async () => {
        // Arrange
        const multiItemOrder = OrderTestFactory.createMultiItemOrder(5);
        const confirmedMultiItem = {
          ...multiItemOrder,
          id: 'OR004',
          status: OrderStatus.CONFIRMED,
          paymentInfo: {
            ...multiItemOrder.paymentInfo,
            status: PaymentStatus.COMPLETED,
          },
        };

        mockRepository.mockSuccessfulFind(confirmedMultiItem);
        mockRepository.mockSuccessfulUpdateStatus();

        // Act
        const result = await useCase.execute('OR004');

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.status).toBe(OrderStatus.PROCESSING);
        expect(result.value.items.length).toBe(5);
      });
    });

    describe('Failure Cases - Order Not Found', () => {
      it('should fail when order does not exist', async () => {
        // Arrange
        mockRepository.mockOrderNotFound('OR999');

        // Act
        const result = await useCase.execute('OR999');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order with id OR999 not found',
          RepositoryError,
        );
        expect(mockRepository.findById).toHaveBeenCalledWith('OR999');
        expect(mockRepository.updateStatus).not.toHaveBeenCalled();
      });
    });

    describe('Failure Cases - Business Logic Violations', () => {
      it('should fail to process pending order (not confirmed yet)', async () => {
        // Arrange
        const pendingOrder = OrderTestFactory.createPendingOrder({
          id: 'OR005',
        });
        mockRepository.mockSuccessfulFind(pendingOrder);

        // Act
        const result = await useCase.execute('OR005');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order is not in a shippable state',
          UseCaseError,
        );
        expect(mockRepository.updateStatus).not.toHaveBeenCalled();
      });

      it('should fail to process already processing order', async () => {
        // Arrange
        const processingOrder = OrderTestFactory.createProcessingOrder({
          id: 'OR006',
        });
        mockRepository.mockSuccessfulFind(processingOrder);

        // Act
        const result = await useCase.execute('OR006');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order is not in a shippable state',
          UseCaseError,
        );
        expect(mockRepository.updateStatus).not.toHaveBeenCalled();
      });

      it('should fail to process shipped order', async () => {
        // Arrange
        const shippedOrder = OrderTestFactory.createShippedOrder({
          id: 'OR007',
        });
        mockRepository.mockSuccessfulFind(shippedOrder);

        // Act
        const result = await useCase.execute('OR007');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order is not in a shippable state',
          UseCaseError,
        );
        expect(mockRepository.updateStatus).not.toHaveBeenCalled();
      });

      it('should fail to process delivered order', async () => {
        // Arrange
        const deliveredOrder = OrderTestFactory.createDeliveredOrder({
          id: 'OR008',
        });
        mockRepository.mockSuccessfulFind(deliveredOrder);

        // Act
        const result = await useCase.execute('OR008');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order is not in a shippable state',
          UseCaseError,
        );
        expect(mockRepository.updateStatus).not.toHaveBeenCalled();
      });

      it('should fail to process cancelled order', async () => {
        // Arrange
        const cancelledOrder = OrderTestFactory.createCancelledOrder({
          id: 'OR009',
        });
        mockRepository.mockSuccessfulFind(cancelledOrder);

        // Act
        const result = await useCase.execute('OR009');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Order is not in a shippable state',
          UseCaseError,
        );
        expect(mockRepository.updateStatus).not.toHaveBeenCalled();
      });
    });

    describe('Failure Cases - Repository Errors', () => {
      it('should fail when repository update fails', async () => {
        // Arrange
        const confirmedOrder = OrderTestFactory.createConfirmedOrder({
          id: 'OR010',
        });
        mockRepository.mockSuccessfulFind(confirmedOrder);
        mockRepository.mockUpdateStatusFailure('Database connection error');

        // Act
        const result = await useCase.execute('OR010');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Database connection error',
          RepositoryError,
        );
        expect(mockRepository.findById).toHaveBeenCalledWith('OR010');
        expect(mockRepository.updateStatus).toHaveBeenCalledWith(
          'OR010',
          OrderStatus.PROCESSING,
        );
      });

      it('should handle unexpected errors gracefully', async () => {
        // Arrange
        const confirmedOrder = OrderTestFactory.createConfirmedOrder({
          id: 'OR011',
        });
        mockRepository.mockSuccessfulFind(confirmedOrder);
        mockRepository.updateStatus.mockRejectedValue(
          new Error('Unexpected database error'),
        );

        // Act
        const result = await useCase.execute('OR011');

        // Assert
        ResultAssertionHelper.assertResultFailure(
          result,
          'Unexpected Usecase Error',
          UseCaseError,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty order ID', async () => {
        // Arrange
        mockRepository.mockOrderNotFound('');

        // Act
        const result = await useCase.execute('');

        // Assert
        ResultAssertionHelper.assertResultFailure(result);
        expect(mockRepository.findById).toHaveBeenCalledWith('');
      });

      it('should handle order with special characters in ID', async () => {
        // Arrange
        const orderId = 'OR-2025-001#SPECIAL';
        const confirmedOrder = OrderTestFactory.createConfirmedOrder({
          id: orderId,
        });
        mockRepository.mockSuccessfulFind(confirmedOrder);
        mockRepository.mockSuccessfulUpdateStatus();

        // Act
        const result = await useCase.execute(orderId);

        // Assert
        ResultAssertionHelper.assertResultSuccess(result);
        expect(result.value.id).toBe(orderId);
      });
    });
  });
});
