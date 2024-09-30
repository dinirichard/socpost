import { Injectable } from '@nestjs/common';
// import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import axios from 'axios';
import { makeId } from '@socpost/libraries/nest/lib/services/make.is';
import { SocialProvider } from '@socpost/libraries/nest/lib/integrations/socials/social.integrations.interface';
import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';
import { simpleUpload } from '../upload/v1.uploader';

@Injectable()
export class IntegrationsService {
  constructor(
    private integrationManager: IntegrationManager,
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


  async createOrUpdateIntegration(
    org: string,
    name: string,
    picture: string,
    type: 'social',
    internalId: string,
    provider: string,
    token: string,
    refreshToken = '',
    expiresIn?: Date,
    username?: string,
    isBetweenSteps = false,
    refresh?: string,
    timezone?: number
  ) {
    const loadImage = await axios.get(picture, { responseType: 'arraybuffer' });
    const uploadedPicture = await simpleUpload(
      loadImage.data,
      `${makeId(10)}.png`,
      'image/png'
    );

    return this.databaseService.integration.create({
        data: {
            name,
            picture,
            type,
            internalId,
            token,
            refreshToken,
            providerIdentifier : provider,
            tokenExpiration : expiresIn,
            // username,
            inBetweenSteps : isBetweenSteps,
            // refresh,
            // timezone
            organization: {
              connect: {
                  id: org
              }
          }
        }
    }
    );
  }

  getIntegrationsList(org: string) {
    return this.databaseService.integration.findMany({
      where: {
        organizationId: org,
      }
    })
  }

  getIntegrationById(org: string, id: string) {
    return this.databaseService.integration.findFirst({
      where: {
        id,
        organizationId: org,
      }
    });
  }

  async refreshToken(provider: SocialProvider, refresh: string) {
    try {
      const { refreshToken, accessToken, expiresIn } =
        await provider.refreshToken(refresh);

      if (!refreshToken || !accessToken || !expiresIn) {
        return false;
      }

      return { refreshToken, accessToken, expiresIn };
    } catch (e) {
      return false;
    }
  }

  async disconnectChannel(orgId: string, integration: Prisma.$IntegrationPayload) {
    await this.databaseService.integration.update({
      where: {
        id: integration.scalars.id,
        organizationId: orgId,
      },
      data: {
        refreshNeeded: true,
      },
    })
    // await this.informAboutRefreshError(orgId, integration);
  }

  // async informAboutRefreshError(orgId: string, integration: Prisma.$IntegrationPayload) {
  //   await this._notificationService.inAppNotification(
  //     orgId,
  //     `Could not refresh your ${integration.providerIdentifier} channel`,
  //     `Could not refresh your ${integration.providerIdentifier} channel. Please go back to the system and connect it again ${process.env.FRONTEND_URL}/launches`,
  //     true
  //   );
  // }

  async refreshNeeded(org: string, id: string) {
    return await this.databaseService.integration.update({
      where: {
        id,
        organizationId: org,
      },
      data: {
        refreshNeeded: true,
      },
    })
  }

  async refreshTokens() {
    const integrations = await this.databaseService.integration.findMany({
      where: {
        tokenExpiration: {
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        inBetweenSteps: false,
        deletedAt: null,
        refreshNeeded: false,
      },
    });
    for (const integration of integrations) {
      const provider = this.integrationManager.getSocialIntegration(
        integration.providerIdentifier
      );

      const data = await this.refreshToken(provider, integration.refreshToken!);

      if (!data) {
        // await this.informAboutRefreshError(
        //   integration.organizationId,
        //   integration
        // );
        await this.refreshNeeded(
          integration.organizationId,
          integration.id
        )
        return;
      }

      const { refreshToken, accessToken, expiresIn } = data;

      await this.createOrUpdateIntegration(
        integration.organizationId,
        integration.name,
        integration.picture!,
        'social',
        integration.internalId,
        integration.providerIdentifier,
        accessToken,
        refreshToken,
      );
    }
  }

  async disableChannel(org: string, id: string) {
    return this.databaseService.integration.update({
      where: {
        id,
        organizationId: org,
      },
      data: {
        disabled: true,
      },
    });
  }

  async enableChannel(org: string, totalChannels: number, id: string) {
    const integrations = (
      await this.databaseService.integration.findMany({
        where: {
          organizationId: org,
          deletedAt: null,
        },
      })
    ).filter((f) => !f.disabled);
    if (integrations.length >= totalChannels) {
      throw new Error('You have reached the maximum number of channels');
    }

    return this.databaseService.integration.update({
      where: {
        id,
        organizationId: org,
      },
      data: {
        disabled: false,
      },
    });
  }
}
