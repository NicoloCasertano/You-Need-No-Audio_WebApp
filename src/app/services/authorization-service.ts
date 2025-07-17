import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { RouteConfigLoadEnd, Router } from "@angular/router";
import { jwtDecode } from 'jwt-decode';
import { RegistrationRequestModel } from "../models/registration-request-model";
import { Observable, tap } from "rxjs";
import { JwtTokenModel } from "../models/jwt-token-model";
import { LoginRequestModel } from "../models/login-request-model";
import { JwtPayloadModel } from "../models/jwt-payload-model";
import { environment } from "../../environment";
import { AuthorityModel } from "../models/authority-model";

@Injectable({providedIn: 'root'})
export class AuthService {

    private _url: string = `${environment.apiUrl}/authentications`;
    private _http = inject(HttpClient);
    private _router = inject(Router);
    private readonly tokenKey = 'jwt_token';

    constructor(_http: HttpClient){}

    register(data: { name: string, email: string; password: string}): Observable<JwtTokenModel>{
        return this._http.post<JwtTokenModel>(`${this._url}/register-area`, data);
    }

    login(credentials: { email:string; password: string}): Observable<JwtTokenModel & {authorities: string[]}> {
        return this._http.post<JwtTokenModel & {authorities: string[]}>(`${this._url}/log-in-area`, credentials)
            .pipe(tap(resp => {
                this.setToken(resp.token);
                localStorage.setItem('user_roles', JSON.stringify(resp.authorities));
            }));
    }

    logout() {
        localStorage.removeItem('jwt_token');
        console.log("Logged out");
    }

    isLogged(): boolean {
        const token = this.getToken();
        if(!token) return false;

        const decoded = jwtDecode<JwtPayloadModel> (token);
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp > now;
        
    }

    getToken():string|null {
        return localStorage.getItem(this.tokenKey);
    }

    getUserId():number|null {
        const payload = this.decodePayload();
        return typeof payload?.userId === 'number'
            ? payload.userId
            : (payload?.userId ? +payload.userId : null);
    }
    setToken(token:string) {
        localStorage.setItem(this.tokenKey, token);
        //console.log(this.decodePayload());
    }
    
    getUserRoles(): string[] {
        const raw = localStorage.getItem('user_roles');
        return raw ? JSON.parse(raw) : [];
    }
    
    decodePayload(): JwtPayloadModel | null {
        const token = this.getToken();
        if (!token) return null;
        try {
        const payloadPart = token.split('.')[1];
        const decoded = atob(payloadPart);
        return JSON.parse(decoded) as JwtPayloadModel;
        } catch (e) {
        console.error('Errore decodifica token', e);
        return null;
        }
    }
    hasRole(role: string): boolean {
        return this.getUserRoles().includes(role);
    }
    getUserEMail():string | null {
        const p = this.decodePayload();
        return p?.sub ?? null;
    }
    getUserName():string | null {
        const p = this.decodePayload();
        return p?.userName ?? null;
    }
    getArtName(): string | null {
        const p = this.decodePayload();
        return p?.artName ?? null;
    }
}