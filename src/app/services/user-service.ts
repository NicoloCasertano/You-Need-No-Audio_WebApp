import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { UserNoPassModel } from "../models/user-nopass-model";
import { UserModel } from "../models/user-model";
import { AuthService } from "./authorization-service";
import { environment } from "../../environment";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _url: string = environment.apiUrl;
    private _http: HttpClient = inject(HttpClient);
    private _authService = inject(AuthService);

    getUtentiByUsername(userName: string):Observable<UserNoPassModel[]>{
        return this._http.get<UserNoPassModel[]>(`${this._url}/users/${userName}`);
    }

    getUtenteByUtenteId(userId: number):Observable<UserNoPassModel>{
        return this._http.get<UserNoPassModel>(`${this._url}/users/${userId}`);
    }

    getUserByArtName(artName: string):Observable<UserModel[]> {
        return this._http.get<UserModel[]>(`${this._url}/users/${artName}`);
    }

    promoteUser(userId: string, newRole: string = 'ADMIN') {
        return this._http.put(`${this._url}/users/${userId}/role`, null, {
            params: new HttpParams().set('role', newRole)
        });
    }

    getUserById(userId: number) {
        return this._http.get<UserModel>(`${this._url}/users/${userId}`);
    }

    private getAuthHeaders() {
        const token = localStorage.getItem('jwt_token');
        const headers = token
            ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
            : new HttpHeaders();
        return { headers };
    }
}