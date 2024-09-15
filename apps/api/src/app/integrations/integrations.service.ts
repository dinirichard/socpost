import { Injectable } from '@nestjs/common';
// import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import axios from 'axios';

@Injectable()
export class IntegrationsService {
  constructor(
    // private integrationManager: IntegrationManager,
    private readonly databaseService: DatabaseService 
  ){}


  async create(createIntegrationDto: Prisma.IntegrationCreateInput) {

    const loadImage = await axios.get(createIntegrationDto.picture, { responseType: 'arraybuffer' });
    // const up


    return this.databaseService.integration.create({
      data: createIntegrationDto
    });
  }

  async findAll() {
    return this.databaseService.integration.findMany({});
  }

  async findOne(id: string) {
    return this.databaseService.integration.findUnique({
      where: {
        id,
      }
    });
  }

  async update(id: string, updateIntegrationDto: Prisma.IntegrationUpdateInput) {
    return this.databaseService.integration.update({
      where: {
        id,
      },
      data: updateIntegrationDto
    })
  }

  async remove(id: string) {
    return this.databaseService.integration.delete({
      where: {
        id
      }
    })
  }
}
