import { TwitterApi } from 'twitter-api-v2';
import {
    AnalyticsData,
  AuthTokenDetails,
  GenerateAuthUrlResponse,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '../../integrations/socials/social.integrations.interface';
// import { lookup } from 'mime-types';
// import sharp from 'sharp';
// import { readOrFetch } from '@gitroom/helpers/utils/read.or.fetch';
// import removeMd from 'remove-markdown';
import { SocialAbstract } from '../social.abstract';
import { InternalServerErrorException, Logger } from '@nestjs/common';


export class XProvider extends SocialAbstract implements SocialProvider {
    identifier = 'x';
    name = 'X';
    isBetweenSteps = false;
    scopes = [];

    async generateAuthUrl(refresh?: string): Promise<GenerateAuthUrlResponse> {
      Logger.log( process.env['X_API_KEY']!, 'X_API_KEY');
        const client = new TwitterApi({
            appKey: process.env['X_API_KEY']!,
            appSecret: process.env['X_API_SECRET']!,
        });
        try{
        const { url, oauth_token, oauth_token_secret } =
            await client.generateAuthLink(
                process.env['FRONTEND_URL'] +
                  `/integrations/social/x${refresh ? `?refresh=${refresh}` : ''}`,
                {
                    authAccessType: 'write',
                    linkMode: 'authenticate',
                    forceLogin: false,
                }
            );
        return {
            url,
            codeVerifier: oauth_token + ':' + oauth_token_secret,
            state: oauth_token,
        };
      } catch (error) {
          Logger.error(error, 'Authentication Error');
          throw new InternalServerErrorException(error, 'Authentication error');
      }
    }

    async authenticate(params: { code: string; codeVerifier: string; refresh?: string; }): Promise<AuthTokenDetails> {
        const { code, codeVerifier } = params;
        const [oauth_token, oauth_token_secret] = codeVerifier.split(':');

        const startingClient = new TwitterApi({
            appKey: process.env['X_API_KEY']!,
            appSecret: process.env['X_API_SECRET']!,
            accessToken: oauth_token,
            accessSecret: oauth_token_secret,
        });

        const { accessToken, client, accessSecret } = await startingClient.login(
          code
        );
      
        const { id, name, profile_image_url_https } = await client.currentUser(
          true
        );
      
        const { data: { username }, } = await client.v2.me({
          'user.fields': 'username',
        });
      
        return {
            id: String(id),
            accessToken: accessToken + ':' + accessSecret,
            name,
            refreshToken: '',
            expiresIn: 999999999,
            picture: profile_image_url_https,
            username,
        };
    }



    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const startingClient = new TwitterApi({
            clientId: process.env['TWITTER_CLIENT_ID']!,
            clientSecret: process.env['TWITTER_CLIENT_SECRET']!,
        });
        const {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
            client,
        } = await startingClient.refreshOAuth2Token(refreshToken);
        const {
          data: { id, name, profile_image_url },
        } = await client.v2.me();
      
        const { data: { username }, } 
            = await client.v2.me({
                'user.fields': 'username',
            });
      
        return {
            id,
            name,
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
            picture: profile_image_url,
            username,
        };
    }


    async post(id: string, accessToken: string, postDetails: PostDetails[]): Promise<PostResponse[]> {
      const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
      const client = new TwitterApi({
        appKey: process.env['X_API_KEY']!,
        appSecret: process.env['X_API_SECRET']!,
        accessToken: accessTokenSplit,
        accessSecret: accessSecretSplit,
      });
      const {
        data: { username },
      } = await client.v2.me({
        'user.fields': 'username',
      });

      const uploadedMedias = ( await Promise.all(
          postDetails.flatMap((p) => 
            p?.media?.flatMap(async (m) => {
              return {
                id: (m.mimeType === "video/mp4") || (m.mimeType === "video/quicktime")
                      ? await client.v1.uploadMedia(m.url, { mimeType: m.mimeType, longVideo: true })
                      : await client.v1.uploadMedia(m.url, { mimeType: m.mimeType }),
                postId: p.id,
              };
            })
          )
        )
      ).reduce((accumulated, currVal) => {
        if (!currVal?.id) {
          return accumulated;
        }

        accumulated[currVal.postId] = accumulated[currVal.postId] || [];
        accumulated[currVal.postId].push(currVal.id);

        return accumulated;
      }, {} as Record<string, string[]>);

      Logger.log(uploadedMedias, 'Media Id as Records' );

  
      const ids: Array<{ postId: string; id: string; releaseURL: string }> = [];

      for (const post of postDetails) {
          const media_ids = (uploadedMedias[post.id] || []).filter((f) => f);

          // Ensure media_ids is a tuple of the correct length 
          const mediaIdsTuple: [string] | [string, string] | [string, string, string] | [string, string, string, string] = 
            media_ids.length === 1 ? [media_ids[0]] :
            media_ids.length === 2 ? [media_ids[0], media_ids[1]] :
            media_ids.length === 3 ? [media_ids[0], media_ids[1], media_ids[2]] :
            media_ids.length === 4 ? [media_ids[0], media_ids[1], media_ids[2], media_ids[3]] : ['ghg']; // Handle cases with 0 or more than 4 media IDs appropriately
        
          
          const { data }: { data: { id: string } } = await client.v2.tweet({
              text: post.message,
              ...(media_ids.length > 1 ? { media: { media_ids: mediaIdsTuple } } : {}),
          });
        
          ids.push({
              postId: data.id,
              id: post.id,
              releaseURL: `https://twitter.com/${username}/status/${data.id}`,
          });
      }

      return ids.map((p) => ({
          ...p,
          status: 'posted',
      }));


    }








    
    async analytics?(id: string, accessToken: string, date: number): Promise<AnalyticsData[]> {
        throw new Error('Method not implemented.');
    }
    
}