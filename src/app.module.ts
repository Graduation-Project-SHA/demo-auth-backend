import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './modules/roles/roles.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CountriesModule } from './modules/countries/countries.module';
import { CoachesModule } from './modules/coaches/coaches.module';
import { PostsModule } from './modules/posts/posts.module';
import { StoriesModule } from './modules/stories/stories.module';
import { ProductsModule } from './modules/products/products.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { ProductsCategoriesModule } from './modules/products-categories/products-categories.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { ExerciseLibraryModule } from './modules/exercise-library/exercise-library.module';
import { MealLibraryModule } from './modules/meal-library/meal-library.module';
import { SupplementLibraryModule } from './modules/supplement-library/supplement-library.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ChatModule } from './modules/chat/chat.module';
import { AppSettingsModule } from './modules/app-settings/app-settings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

import config from './config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('MAIL_USER')}>`,
        },
        template: {
          dir: join(process.cwd(), 'src', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    PrismaModule,
    RolesModule,
    AdminsModule,
    AuthModule,
    UsersModule,
    CountriesModule,
    CoachesModule,
    PostsModule,
    StoriesModule,
    ProductsModule,
    RestaurantsModule,
    ProductsCategoriesModule,
    SponsorsModule,
    CertificatesModule,
    ExerciseLibraryModule,
    MealLibraryModule,
    SupplementLibraryModule,
    SubscriptionsModule,
    ChatModule,
    AppSettingsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
