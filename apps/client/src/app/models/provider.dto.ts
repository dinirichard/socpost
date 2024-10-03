export interface ProviderItem {
    id: string;
    name: string;
    picture: string;
    profile: string;
    internalId?: string;
    username?: string;
    providerIdentifier: string;
    type: string;
    token: string;
    disabled: boolean;
    refreshToken?: string; // The refresh token, if applicable
    tokenExpiration?: Date;
    inBetweenSteps?: boolean
    refreshNeeded?: boolean;
    organizationId: string;
}