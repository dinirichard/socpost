import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';
import { PostService } from '../posts/post.service';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, IntegrationManager, PostService],
})
export class IntegrationsModule {}
