// src/modules/orders/domain/interfaces/IOrder.ts
import { OrderStatus } from '../value-objects/order-status';
import { ICustomerInfo, ICustomerInfoEditable } from './ICustomerInfo';
import { IOrderItem } from './IOrderItem';
import { IPaymentInfo, IPaymentInfoEditable } from './IPaymentInfo';
import { IShippingAddress, IShippingAddressEditable } from './IShippingAddress';

export interface IOrder extends IOrderEditable {
  id: string;
  customerId: string;
  paymentInfoId: string;
  shippingAddressId: string;
  customerInfo: ICustomerInfo;
  paymentInfo: IPaymentInfo;
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderEditable {
  items: IOrderItem[];
  customerInfo: ICustomerInfoEditable;
  shippingAddress: IShippingAddressEditable;
  paymentInfo: IPaymentInfoEditable;
  customerNotes?: string;
}
