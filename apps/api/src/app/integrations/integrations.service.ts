import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import axios from 'axios';
import { makeId } from '@socpost/libraries/nest/lib/services/make.is';
import { SocialProvider } from '@socpost/libraries/nest/lib/integrations/socials/social.integrations.interface';
import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';
import { simpleUpload } from '../upload/v1.uploader';
import { ProviderResponse } from './integration.dto';

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

  async findAllByOrg(orgId: string) {
    try {
        const response = await this.databaseService.integration.findMany({
          where: {
            organizationId: orgId,
            deletedAt: null,
          }
        });

        return response.map( integrat => {
          return integrat as ProviderResponse;
        })
      } catch (error) {
        throw new InternalServerErrorException(error, 'There was an error accessing the database');
    }
  }

  async findOne(id: string) {
    try{
        return await this.databaseService.integration.findUnique({
          where: {
            id,
          }
        }) as ProviderResponse;
      } catch (error) {
        throw new InternalServerErrorException(error, 'There was an error accessing the database');
    }
  }

  async update(id: string, updateIntegrationDto: Prisma.IntegrationUpdateInput) {
    return await this.databaseService.integration.update({
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
    expiresIn,
    username?: string,
    isBetweenSteps = false,
    refresh?: string,
    timezone?: number
  ) {
    try {
        const loadImage = await axios.get(picture, { responseType: 'arraybuffer' });
        const uploadedPicture = await simpleUpload(
          loadImage.data,
          `${makeId(10)}.png`,
          'image/png'
        );
      
        const createdResponse = await this.databaseService.integration.create({
            data: {
                name,
                picture: uploadedPicture,
                type,
                internalId,
                token,
                refreshToken,
                providerIdentifier : provider,
                profile: username,
                inBetweenSteps : isBetweenSteps,
                tokenExpiration: new Date(Date.now() + expiresIn * 1000),
                // refresh,
                // timezone
                refreshNeeded: false,
                organization: {
                  connect: {
                      id: org
                  }
              }
            }
        });

        return createdResponse as ProviderResponse;
    } catch(error) {
      throw new InternalServerErrorException(error, 'There was an error accessing the database');
    }
  }

  getIntegrationsList(org: string) {
    return this.databaseService.integration.findMany({
      where: {
        organizationId: org,
      }
    })
  }

  async getIntegrationById(org: string, id: string) {
    try {
        return await this.databaseService.integration.findFirst({
          where: {
            id,
            organizationId: org,
          }
        }) as ProviderResponse;
    } catch(error) {
      throw new InternalServerErrorException(error, 'There was an error accessing the database');
    }
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
        expiresIn
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

  async enableChannel(org: string, id: string) {
    // const integrations = (
    //   await this.databaseService.integration.findMany({
    //     where: {
    //       organizationId: org,
    //       deletedAt: null,
    //     },
    //   })
    // ).filter((f) => !f.disabled);
    // if (integrations.length >= totalChannels) {
    //   throw new Error('You have reached the maximum number of channels');
    // }

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

  async getPostsForChannel(org: string, id: string) {
    // return await this.databaseService.post.groupBy({
    //   by: ['group'],
    //   where: {
    //     organizationId: org,
    //     integrationId: id,
    //     deletedAt: null,
    //   },
    // });

    return await this.databaseService.post.findMany({
      where: {
        organizationId: org,
        integrationId: id,
        deletedAt: null,
      },
    });
  }

  deleteChannel(org: string, id: string) {
    return this.databaseService.integration.update({
      where: {
        id,
        organizationId: org,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
