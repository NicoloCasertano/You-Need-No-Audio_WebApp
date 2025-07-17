export interface JwtPayloadModel {
    userId: number,
    sub: string,
    userName: string;
    password: null;
    email: string;
    artName: string;
    works: string[];
    iat: number, //data di creazione
    exp: number,
    [key: string]: any; //expiration
}