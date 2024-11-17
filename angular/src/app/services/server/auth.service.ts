import {forwardRef, Inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {JwtRequestDto} from "../../models/dto/jwt-request-dto";
import {JwtResponseDto} from "../../models/dto/jwt-response-dto";
import {User} from "../../models/user";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // Auth API URL
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);
  token$: Observable<string | null> = this.tokenSubject.asObservable();
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken) this.tokenSubject.next(savedToken);
    if (savedUser) this.userSubject.next(JSON.parse(savedUser));
  }

  login(loginRequest: JwtRequestDto): Observable<JwtResponseDto> {
    return this.http.post<JwtResponseDto>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUser(response.user);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }


  setToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }
}
