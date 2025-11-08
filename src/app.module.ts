import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';

// ✅ Feature Modules
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UserModule } from './user/user.module';
import { EstateModule } from './estate/estate.module';
import { HomeModule } from './home/home.module';
import { RoomModule } from './room/room.module';
import { WalletModule } from './wallet/wallet.module';
import { VisitorsModule } from './visitors/visitors.module';
import { PaymentsModule } from './payments/payments.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { CommunityModule } from './community/community.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { MessageModule } from './message/message.module';
import { IotModule } from './iot/iot.module';
import { AiModule } from './ai/ai.module';
import { AssistantModule } from './assistant/assistant.module'; // 👈 NEW — Smart Assistant layer

// ✅ Guards & Filters
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // 🌍 Global config
    ConfigModule.forRoot({ isGlobal: true }),

    // 🗄️ Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async () => {
        const dbConfig = await getDatabaseConfig();
        return {
          ...dbConfig,
          autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        };
      },
    }),

    // 🧩 Core Application Modules
    AuthModule,
    DashboardModule,
    UserModule,
    EstateModule,
    HomeModule,
    RoomModule,
    WalletModule,
    VisitorsModule,
    PaymentsModule,
    UtilitiesModule,
    CommunityModule,
    NotificationsModule,
    HealthModule,
    MessageModule,
    IotModule,

    // 🤖 AI + Assistant Layer
    AiModule,
    AssistantModule, // 👈 Added here
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const entities = this.dataSource.entityMetadatas;
    this.logger.log('🚀 --- Ochiga Smart Backend Boot Summary ---');
    this.logger.log(`🧩 Entities: ${entities.map((e) => e.name).join(', ')}`);
    this.logger.log('✅ System initialized and ready.\n');
  }
}
