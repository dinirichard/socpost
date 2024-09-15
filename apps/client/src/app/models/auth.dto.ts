export interface registerDTO {
    name : string,
    organizationName: string,
    email: string,
    password: string,
}

export interface loginDTO {
    email: string,
    password: string,
}