// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as path from 'path';

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
import { HealthModule } from './health/health.module'; // ✅ Added

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'better-sqlite3');

        if (dbType === 'postgres') {
          return {
            type: 'postgres' as const,
            host: config.get<string>('DB_HOST', 'localhost'),
            port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
            username: config.get<string>('DB_USERNAME', 'postgres'),
            password: config.get<string>('DB_PASSWORD', 'postgres'),
            database: config.get<string>('DB_DATABASE', 'estate_app'),
            entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
            synchronize: true,
          };
        }

        if (dbType === 'sqlite') {
          return {
            type: 'sqlite' as const,
            database: path.resolve(
              __dirname,
              '..',
              config.get<string>('DB_DATABASE', 'db.sqlite'),
            ),
            entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
            synchronize: true,
          };
        }

        // Default: better-sqlite3 (dev/local fast DB)
        return {
          type: 'better-sqlite3' as const,
          database: path.resolve(
            __dirname,
            '..',
            config.get<string>('DB_DATABASE', 'db.sqlite'),
          ),
          entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: true,
        };
      },
    }),

    // ✅ Feature modules
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
    HealthModule, // ✅ Registered here
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
