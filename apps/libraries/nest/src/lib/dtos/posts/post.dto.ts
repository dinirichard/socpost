import { IsString, IsDefined, IsBoolean, IsOptional, IsArray, ValidateNested, IsDate, IsDateString, IsEnum, IsNotEmpty } from "class-validator";
import { Type } from 'class-transformer';

export enum APPROVED_SUBMIT_FOR_ORDER {
    NO = 'NO',
    AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
    YES = 'YES',
}

export class YoutubePostDTO {
    @IsDateString()
    @IsDefined()
    publishDate!: Date;

    @IsString()
    @IsDefined()
    integrationId!: string;

    @IsString()
    @IsDefined()
    organizationId!: string;

    @IsNotEmpty()
    @IsEnum(APPROVED_SUBMIT_FOR_ORDER)
    approval!: APPROVED_SUBMIT_FOR_ORDER;

    @IsString()
    @IsDefined()
    videoKind!: string;

    @IsBoolean()
    @IsDefined()
    forKids!: boolean;

    @IsString()
    @IsDefined()
    video!: string;

    @IsString()
    @IsDefined()
    provider!: string;

    @IsString()
    @IsOptional()
    image!: string;
    
    @IsString()
    @IsOptional()
    title!: string;
    
    @IsString()
    @IsOptional()
    description!: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TagDTO)
    tags!: TagDTO[];
}

export class TagDTO {
    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsDefined()
    name!: string;
}

export class PostEventDTO {
    @IsString()
    @IsDefined()
    id!: string;

    @IsDate()
    @IsDefined()
    publishDate!: Date;

    @IsString()
    @IsDefined()
    title!: string;

    @IsString()
    @IsDefined()
    profileImage!: string;

    @IsString()
    @IsDefined()
    provider!: string;
}



export interface Post {
    id            : string;      
    integrationId  : string;
    organizationId : string;
    publishDate    : any;
    state?         : string;
    content?       : string;
    group?         : string;
    title?         : string;
    description?   : string;
    releaseId?     : string;
    releaseUrl?    : string;
    settings?       : string;
    image?          : string;
    video?          : string;
    videoKind?     : string;
    forKids?       : boolean;
    approval       : APPROVED_SUBMIT_FOR_ORDER;
    tags?           : Tag[];
}

export interface Tag {
    id: string;
    name: string;
}

export interface PostEvent {
    id: string;
    publishDate: Date;
    title: string;
    profileImage: string;
    provider: string;
}