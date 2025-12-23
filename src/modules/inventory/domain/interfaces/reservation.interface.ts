import { ReservationStatus } from '../value-objects/reservation-status';
import { IReservationItem } from './reservation-item.interface';

export interface IReservation {
  id: string | null;
  orderId: string;
  items: IReservationItem[];
  status: ReservationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
