---
title: How to add Providers
---
<SwmSnippet path="/apps/libraries/nest/src/lib/integrations/socials/youtube.provider.ts" line="37">

---

Create a Provider class to implement <SwmToken path="/apps/libraries/nest/src/lib/integrations/socials/social.integrations.interface.ts" pos="72:5:5" line-data="  export interface SocialProvider">`SocialProvider`</SwmToken>. Then add the newly created Provider into the <SwmToken path="/apps/libraries/nest/src/lib/integrations/integration.manager.ts" pos="6:2:2" line-data="const socialIntegrationList = [">`socialIntegrationList`</SwmToken>

```typescript
  export class YoutubeProvider extends SocialAbstract implements SocialProvider {
```

---

</SwmSnippet>

&nbsp;

&nbsp;

<SwmSnippet path="/apps/libraries/nest/src/lib/integrations/socials/social.integrations.interface.ts" line="2">

---

<SwmToken path="/apps/libraries/nest/src/lib/integrations/socials/social.integrations.interface.ts" pos="2:1:1" line-data="    generateAuthUrl(refresh?: string): GenerateAuthUrlResponse;">`generateAuthUrl`</SwmToken>  Should return the required url based on the providers api.\
<SwmToken path="/apps/libraries/nest/src/lib/integrations/socials/social.integrations.interface.ts" pos="4:1:1" line-data="    authenticate(params: {">`authenticate`</SwmToken> For authentication and getting token details\
<SwmToken path="/apps/libraries/nest/src/lib/integrations/socials/social.integrations.interface.ts" pos="10:1:1" line-data="    refreshToken(refreshToken: string): Promise&lt;AuthTokenDetails&gt;;">`refreshToken`</SwmToken>\
<SwmToken path="/apps/libraries/nest/src/lib/integrations/socials/social.integrations.interface.ts" pos="12:1:1" line-data="    analytics?(id: string, accessToken: string, date: number): Promise&lt;AnalyticsData[]&gt;;">`analytics`</SwmToken> Get analytics data

```typescript
    generateAuthUrl(refresh?: string): GenerateAuthUrlResponse;

    authenticate(params: {
      code: string;
      codeVerifier: string;
      refresh?: string;
    }): Promise<AuthTokenDetails>;

    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;

    analytics?(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBc29jcG9zdCUzQSUzQWRpbmlyaWNoYXJk" repo-name="socpost"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
