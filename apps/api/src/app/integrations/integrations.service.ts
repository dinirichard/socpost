import { Injectable } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';

@Injectable()
export class IntegrationsService {
  constructor(
    private integrationManager: IntegrationManager,
  ){}


  create(createIntegrationDto: CreateIntegrationDto) {
    return 'This action adds a new integration';
  }

  findAll() {
    return `This action returns all integrations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} integration`;
  }

  update(id: number, updateIntegrationDto: UpdateIntegrationDto) {
    return `This action updates a #${id} integration`;
  }

  remove(id: number) {
    return `This action removes a #${id} integration`;
  }
}
