import { Injectable } from "@nestjs/common";
import { ArticleProvider } from "./articles/article.integration.interface";
import { SocialProvider } from "./socials/social.integrations.interface";
import { YoutubeProvider } from "./socials/youtube.provider";
import { XProvider } from "./socials/x.provider";


const socialIntegrationList: SocialProvider[] = [
    new YoutubeProvider(),
    new XProvider(),
];

const articleIntegrationList: ArticleProvider[]  = [];

@Injectable()
export class IntegrationManager {

    getAllIntegrations() {
        return {
            social: socialIntegrationList.map((p) => ({
                name: p.name,
                identifier: p.identifier,
            })),
            article: articleIntegrationList.map((p) => ({
                name: p.name,
                identifier: p.identifier
            }))
        }
    }

    getAllowedSocialsIntegrations() {
        return socialIntegrationList.map((p) => p.identifier);
    }

    getSocialIntegration(integration: string): SocialProvider | undefined {
        return socialIntegrationList.find((i) => i.identifier === integration)
            ? socialIntegrationList.find((i) => i.identifier === integration)
            : undefined;
    }

    getAllowedArticlesIntegrations() {
        return articleIntegrationList.map((p) => p.identifier);
    }

    getArticlesIntegration(integration: string): ArticleProvider | undefined {
        return articleIntegrationList.find((i) => i.identifier === integration)
            ? articleIntegrationList.find((i) => i.identifier === integration)
            : undefined;
    }
}


