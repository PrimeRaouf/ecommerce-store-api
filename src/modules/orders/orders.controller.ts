import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateOrderDto } from './presentation/dto/create-order.dto';
import { UpdateOrderDto } from './presentation/dto/update-order.dto';
import { GetOrderController } from './presentation/controllers/GetOrder/get-order.controller';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderResponseDto } from './presentation/dto/order-response.dto';
import { CreateOrderController } from './presentation/controllers/CreateOrder/create-order.controller';
import { ListOrdersController } from './presentation/controllers/ListOrders/list-orders.controller';
import { ListOrdersQueryDto } from './presentation/dto/list-orders-query.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private getOrderController: GetOrderController,
    private createOrderController: CreateOrderController,
    private listOrdersController: ListOrdersController,
  ) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.createOrderController.handle(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders list with pagination and filtering' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  async findAll(@Query() query: ListOrdersQueryDto) {
    return this.listOrdersController.handle(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async findOne(@Param('id') id: string) {
    return this.getOrderController.handle(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    // return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.ordersService.remove(+id);
  }
}
