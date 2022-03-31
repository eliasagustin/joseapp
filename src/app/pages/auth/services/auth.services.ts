import { Injectable } from "@angular/core";
import { USER_STORAGE_KEY } from "@shared/constants/constants";
import { User, ApiError, Session, createClient, SupabaseClient, UserCredentials } from "@supabase/supabase-js";
import { BehaviorSubject, Observable } from "rxjs";

import { environment } from "src/environments/environment";

type supabaseResponse = User | Session | ApiError | null;

@Injectable({ providedIn: 'root'})

export class AuthService {
    
    private supabaseClient: SupabaseClient;
    private userSubject = new BehaviorSubject<User | null>(null);

    constructor() {
        this.supabaseClient = createClient(environment.supabase.url, environment.supabase.publicKey);
        this.setUser();
    }

    get user$():Observable<User| null>{
        return this.userSubject.asObservable();
    }

    async signIn(credentials: UserCredentials): Promise<supabaseResponse> {
        try {
            const {user, error, ...rest} = await this.supabaseClient.auth.signIn(credentials);
            this.setUser();
            return error ? error : user;
        } catch (error) {
            console.log("error de credenciales ", error);
            return error as ApiError;
        }
    }

    async signUp(credentials: UserCredentials): Promise<supabaseResponse> {
        try {
            const {user, error, ...rest} = await this.supabaseClient.auth.signUp(credentials);
            this.setUser();
            return error ? error : user;
        } catch (error) {
            console.log("error de credenciales ", error);
            return error as ApiError;
        }
    }

    signOut():Promise<{error: ApiError | null}>{
        localStorage.removeItem(USER_STORAGE_KEY);
        this.userSubject.next(null);
        return this.supabaseClient.auth.signOut();
    }

    private setUser():void{
        //TODO: Deberia agregar as unknown para que no de error en el cast y as User para que no de error en el tipo
        const session = localStorage.getItem(USER_STORAGE_KEY); //as unknown as User;
        this.userSubject.next(session ? JSON.parse(session) : null);
    }
}