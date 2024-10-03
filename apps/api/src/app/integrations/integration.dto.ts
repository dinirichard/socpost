export interface ProviderResponse {
    id: string;
    internalId?: string;
    name: string;
    username?: string;
    picture: string;
    profile: string;
    refreshToken?: string; // The refresh token, if applicable
    providerIdentifier: string;
    type: string;
    token: string;
    disabled: boolean;
    tokenExpiration?: Date;
    inBetweenSteps?: boolean
    refreshNeeded?: boolean;
    organizationId: string;
  };


