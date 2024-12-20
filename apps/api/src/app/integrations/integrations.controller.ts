import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseFilters, Logger, Req } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { Prisma } from '@prisma/client';
import { IntegrationManager } from '@socpost/libraries/nest/lib/integrations/integration.manager';
import { NotEnoughScopesFilter } from '@socpost/libraries/nest/lib/integrations/integration.missing.scopes';
import { ConnectIntegrationDto } from '@socpost/libraries/nest/lib/dtos/integrations/connect.integration.dto';
import { ioRedis } from '@socpost/libraries/nest/lib/redis/redis.service';
import { PostService } from '../posts/post.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private integrationManager: IntegrationManager,
    private readonly integrationsService: IntegrationsService,
    private readonly postService: PostService,
  ) {}

  @Post()
  create(@Body() createIntegrationDto: Prisma.IntegrationCreateInput) {
    return this.integrationsService.create(createIntegrationDto);
  }

  @Get('/list')
  findAll(
    @Query('orgId') orgId: string,
    @Req() req: Request,
  ) {
    Logger.log(orgId, 'orgId');
    Logger.log(req, 'Request');
    return this.integrationsService.findAllByOrg(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Get('/social/:integration')
  // @CheckPolicies([AuthorizationActions.Create, Sections.CHANNEL])
  async getIntegrationUrl(
    @Param('integration') integration: string,
    @Query('refresh') refresh: string
  ) {
    Logger.log(integration, 'integration');

    if (
      !this.integrationManager
        .getAllowedSocialsIntegrations()
        .includes(integration)
    ) {
      throw new Error('Integration not allowed');
    }

    const integrationProvider =
      this.integrationManager.getSocialIntegration(integration);
      Logger.log(integrationProvider.name, 'integration Provider:');
    const authDetails =
      await integrationProvider.generateAuthUrl(refresh);
    Logger.log(integrationProvider.name, 'integration Provider:');
    await ioRedis.set(`login:${authDetails.state}`, authDetails.codeVerifier, 'EX', 300);
    Logger.log(authDetails.url, 'authDetails url');
    Logger.log(authDetails.codeVerifier, 'authDetails codeVerifier');
    Logger.log(authDetails.state, 'authDetails state');

    return authDetails;
  }

  @Post('/social/:integration/connect')
  // @CheckPolicies([AuthorizationActions.Create, Sections.CHANNEL])
  @UseFilters(new NotEnoughScopesFilter())
  async connectSocialMedia(
    // @GetOrgFromRequest() org: Organization,
    @Param('integration') integration: string,
    @Body() body: ConnectIntegrationDto
  ) {
    if (
      !this.integrationManager
        .getAllowedSocialsIntegrations()
        .includes(integration)
    ) {
      throw new Error('Integration not allowed');
    }
    Logger.log(body.code, 'ConnectIntegrationDto code');
    Logger.log(body.refresh, 'ConnectIntegrationDto refresh');
    Logger.log(body.state, 'ConnectIntegrationDto state');
    Logger.log(body.orgId, 'ConnectIntegrationDto orgId');
    Logger.log(body.timezone, 'ConnectIntegrationDto timezone');

    const getCodeVerifier = await ioRedis.get(`login:${body.state}`);
    Logger.log(getCodeVerifier, 'getCodeVerifier');
    if (!getCodeVerifier) {
      throw new Error('Invalid state');
    }

    await ioRedis.del(`login:${body.state}`);

    const integrationProvider =
      this.integrationManager.getSocialIntegration(integration);
    const {
      accessToken,
      expiresIn,
      refreshToken,
      id,
      name,
      picture,
      username,
    } = 
    await integrationProvider.authenticate({
      code: body.code,
      codeVerifier: getCodeVerifier,
      refresh: body.refresh,
    });

    if (!id) {
      throw new Error('Invalid api key');
    }

    return this.integrationsService.createOrUpdateIntegration(
      body.orgId,
      name,
      picture,
      'social',
      String(id),
      integration,
      accessToken,
      refreshToken,
      expiresIn ? expiresIn : 999999999,
      username,
      integrationProvider.isBetweenSteps,
      body.refresh,
      +body.timezone
    );
  }

  @Post('/disable')
  disableChannel(
    @Body() body: { orgId: string; id: string;},
  ) {
    Logger.log(body.orgId, 'Org Id');
    Logger.log(body.id, 'Provider id');
    return this.integrationsService.disableChannel(body.orgId, body.id);
  }

  @Post('/enable')
  enableChannel(
    @Body() body: { orgId: string; id: string;},
  ) {
    return this.integrationsService.enableChannel(
      body.orgId,
      body.id
    );
  }

  @Delete('/')
  async deleteChannel(
    @Body() body: { orgId: string; id: string;},
  ) {
      const isTherePosts = await this.integrationsService.getPostsForChannel(
        body.orgId,
        body.id
      );
      if (isTherePosts.length) {
        for (const post of isTherePosts) {
          await this.postService.deletePost(body.orgId, post.id);
        }
      }

      return this.integrationsService.deleteChannel(body.orgId, body.id);
  }

    // @Post('/instagram/:id')
  // async saveInstagram(
  //   @Param('id') id: string,
  //   @Body() body: { pageId: string; id: string },
  //   @GetOrgFromRequest() org: Organization
  // ) {
  //   return this._integrationService.saveInstagram(org.id, id, body);
  // }

  // @Post('/facebook/:id')
  // async saveFacebook(
  //   @Param('id') id: string,
  //   @Body() body: { page: string },
  //   @GetOrgFromRequest() org: Organization
  // ) {
  //   return this._integrationService.saveFacebook(org.id, id, body.page);
  // }

  // @Post('/linkedin-page/:id')
  // async saveLinkedin(
  //   @Param('id') id: string,
  //   @Body() body: { page: string },
  //   @GetOrgFromRequest() org: Organization
  // ) {
  //   return this._integrationService.saveLinkedin(org.id, id, body.page);
  // }
}
