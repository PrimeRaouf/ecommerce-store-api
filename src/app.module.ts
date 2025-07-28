import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './modules/orders/orders.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { EnvConfigModule } from './config/config.module';
import { DatabaseModule } from './core/database/database.module';

@Module({
  imports: [
    OrdersModule,
    EnvConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [configuration],
    }),
    DatabaseModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
