import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [UsersModule, AuthModule, IntegrationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
