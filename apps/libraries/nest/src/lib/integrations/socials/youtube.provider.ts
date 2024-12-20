import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { AnalyticsData, AuthTokenDetails, GenerateAuthUrlResponse, PostDetails, PostResponse, SocialProvider } from './social.integrations.interface';
import { makeId } from '../../services/make.is';
import { url } from 'inspector';
import { SocialAbstract } from '../social.abstract';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { YoutubeSettingsDto } from '../../dtos/posts/youtube.settings.dto';
import axios from 'axios';
// import * as process from 'node:process';

const clientAndYoutube = () => {
    const client = new google.auth.OAuth2({
      clientId: process.env['YOUTUBE_CLIENT_ID'],
      clientSecret: process.env['YOUTUBE_CLIENT_SECRET'],
      redirectUri: `${process.env['FRONTEND_URL']}/integrations/social/youtube`,
    });
  
    const youtube = (newClient: OAuth2Client) =>
      google.youtube({
        version: 'v3',
        auth: newClient,
      });
  
    const youtubeAnalytics = (newClient: OAuth2Client) =>
      google.youtubeAnalytics({
        version: 'v2',
        auth: newClient,
      });
  
    const oauth2 = (newClient: OAuth2Client) =>
      google.oauth2({
        version: 'v2',
        auth: newClient,
      });
  
    return { client, youtube, oauth2, youtubeAnalytics };
  };

  export class YoutubeProvider extends SocialAbstract implements SocialProvider {
    
    identifier = 'youtube';
    name = 'YouTube';
    isBetweenSteps = false;
    scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ];

    
    async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
      const { client, oauth2 } = clientAndYoutube();
      client.setCredentials({ refresh_token: refresh_token });
      const { credentials } = await client.refreshAccessToken();
      const user = oauth2(client);
      const expiryDate = new Date(credentials.expiry_date!);
      const unixTimestamp =
        Math.floor(expiryDate.getTime() / 1000) -
        Math.floor(new Date().getTime() / 1000);
      
      const { data } = await user.userinfo.get();
      
      return {
        accessToken: credentials.access_token!,
        expiresIn: unixTimestamp!,
        refreshToken: credentials.refresh_token!,
        id: data.id!,
        name: data.name!,
        picture: data.picture!,
      };
    }

    
    async generateAuthUrl(refresh?: string): Promise<GenerateAuthUrlResponse> {
      const state = makeId(7);
      const {client} = clientAndYoutube();

      return {
        url: client.generateAuthUrl({
          access_type: 'offline',
          state,
          redirect_uri: `${process.env['FRONTEND_URL']}/integrations/social/youtube`,
          scope: this.scopes.slice(0),
          prompt: 'consent',
        }),
        codeVerifier: makeId(11),
        state,
      }
    }

    
    async authenticate(params: { 
      code: string; 
      codeVerifier: string; 
      refresh?: string; 
    })
    // : Promise<AuthTokenDetails> 
    {
      const { client, oauth2 } = clientAndYoutube();
      Logger.log(`${params.code} ::::: ${params.codeVerifier}`, 'combine');
      // try {
          const { tokens } = await client.getToken({
              code: params.code,
              // codeVerifier: params.codeVerifier,
              // client_id: process.env['YOUTUBE_CLIENT_ID'],
              // redirect_uri: `${process.env['FRONTEND_URL']}/integrations/social/youtube`,
          });
          client.setCredentials(tokens);
          Logger.log(tokens);
          const { scopes } = await client.getTokenInfo(tokens.access_token!);
          this.checkScopes(this.scopes, scopes);
          Logger.log(scopes);
          const user = oauth2(client);
          const { data } =await user.userinfo.get();
          Logger.log(data);
          const expiryDate = new Date(tokens.expiry_date!);
          const unixTimestamp =
            Math.floor(expiryDate.getTime() / 1000) -
            Math.floor(new Date().getTime() / 1000);

          return {
              accessToken: tokens.access_token!,
              expiresIn: unixTimestamp,
              refreshToken: tokens.refresh_token!,
              id: data.id!,
              name: data.name!,
              picture: data.picture!,
          };
      // } catch(error) {
          // Logger.error(error, 'Authentication Error');
          // throw new InternalServerErrorException(error, 'Authentication error');
      // }
      
    }

    //! FIXME: Write the code to post
    async post(id: string, accessToken: string, postDetails: PostDetails[]): Promise<PostResponse[]> {
      const [firstPost, ...comments] = postDetails;

      const { client, youtube } = clientAndYoutube();
      client.setCredentials({ access_token: accessToken });
      const youtubeClient = youtube(client);
  
      const { settings }: { settings: YoutubeSettingsDto } = firstPost;
  
      const response = await axios({
        url: firstPost?.media?.[0]?.url,
        method: 'GET',
        responseType: 'stream',
      });
  
      try {
        const all = await youtubeClient.videos.insert({
          part: ['id', 'snippet', 'status'],
          notifySubscribers: true,
          requestBody: {
            snippet: {
              title: settings.title,
              description: firstPost?.message,
              ...(settings?.tags?.length
                ? { tags: settings.tags.map((p) => p.label) }
                : {}),
              // ...(settings?.thumbnail?.path
              //   ? {
              //       thumbnails: {
              //         default: {
              //           url: settings?.thumbnail?.path,
              //         },
              //       },
              //     }
              //   : {}),
            },
            status: {
              privacyStatus: settings.privacy,
            },
          },
          media: {
            body: response.data,
          },
        });
  
        console.log(all);
  
        if (settings?.thumbnail?.path) {
          try {
            const allb = await youtubeClient.thumbnails.set({
              videoId: all?.data?.id!,
              media: {
                body: (
                  await axios({
                    url: settings?.thumbnail?.path,
                    method: 'GET',
                    responseType: 'stream',
                  })
                ).data,
              },
            });
  
            console.log(allb);
          } catch (err: any) {
            if (
              err.response?.data?.error?.errors?.[0]?.domain ===
              'youtube.thumbnail'
            ) {
              throw 'Your account is not verified, we have uploaded your video but we could not set the thumbnail. Please verify your account and try again.';
            }
  
            console.log(JSON.stringify(err?.response?.data, null, 2));
          }
        }
  
        return [
          {
            id: firstPost.id,
            releaseURL: `https://www.youtube.com/watch?v=${all?.data?.id}`,
            postId: all?.data?.id!,
            status: 'success',
          },
        ];
      } catch (err: any) {
        if (
          err.response?.data?.error?.errors?.[0]?.reason === 'failedPrecondition'
        ) {
          throw 'We have uploaded your video but we could not set the thumbnail. Thumbnail size is too large';
        }
        if (
          err.response?.data?.error?.errors?.[0]?.reason === 'uploadLimitExceeded'
        ) {
          throw 'You have reached your daily upload limit, please try again tomorrow.';
        }
        if (
          err.response?.data?.error?.errors?.[0]?.reason ===
          'youtubeSignupRequired'
        ) {
          console.log('nevo david!');
          throw 'You have to link your youtube account to your google account first.';
        }
      }
      return [];
    }

    //! FIXME: Wrtie the code to get analytics data
    analytics?(id: string, accessToken: string, date: number): Promise<AnalyticsData[]> {
      throw new Error('Method not implemented.');
    }


  }