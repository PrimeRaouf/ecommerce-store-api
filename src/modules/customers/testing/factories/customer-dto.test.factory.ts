import { CreateCustomerDto } from '../../presentation/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../presentation/dto/update-customer.dto';
import { AddAddressDto } from '../../presentation/dto/add-address.dto';
import { UpdateAddressDto } from '../../presentation/dto/update-address.dto';
import { ListCustomersQueryDto } from '../../presentation/dto/list-customers-query.dto';
import { AddressType } from '../../domain/value-objects/address-type';

export class CustomerDtoTestFactory {
  static createCreateCustomerDto(
    overrides?: Partial<CreateCustomerDto>,
  ): CreateCustomerDto {
    const baseDto: CreateCustomerDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    return { ...baseDto, ...overrides };
  }

  static createCreateCustomerWithAddressDto(
    overrides?: Partial<CreateCustomerDto>,
  ): CreateCustomerDto {
    return this.createCreateCustomerDto({
      ...overrides,
      address: this.createAddAddressDto(),
    });
  }

  static createUpdateCustomerDto(
    overrides?: Partial<UpdateCustomerDto>,
  ): UpdateCustomerDto {
    const baseDto: UpdateCustomerDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    return { ...baseDto, ...overrides };
  }

  static createAddAddressDto(
    overrides?: Partial<AddAddressDto>,
  ): AddAddressDto {
    const baseDto: AddAddressDto = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      type: AddressType.HOME,
      isDefault: true,
    };

    return { ...baseDto, ...overrides };
  }

  static createUpdateAddressDto(
    overrides?: Partial<UpdateAddressDto>,
  ): UpdateAddressDto {
    const baseDto: UpdateAddressDto = {
      street: '456 Elm St',
      city: 'Los Angeles',
      state: 'CA',
    };

    return { ...baseDto, ...overrides };
  }

  static createListCustomersQueryDto(
    overrides?: Partial<ListCustomersQueryDto>,
  ): ListCustomersQueryDto {
    const baseDto: ListCustomersQueryDto = {
      page: 1,
      limit: 10,
    };

    return { ...baseDto, ...overrides };
  }

  // Invalid DTOs
  static createInvalidCreateCustomerDto(): CreateCustomerDto {
    return {
      firstName: '',
      lastName: '',
      email: 'invalid-email',
    };
  }

  static createInvalidAddAddressDto(): AddAddressDto {
    return {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    };
  }
}
