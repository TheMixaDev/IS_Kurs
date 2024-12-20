import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError, BehaviorSubject, Subscription} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {JwtRequestDto} from "../../models/dto/jwt-request-dto";
import {JwtResponseDto} from "../../models/dto/jwt-response-dto";
import {User} from "../../models/user";
import {WebsocketService} from "../websocket.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);
  token$: Observable<string | null> = this.tokenSubject.asObservable();
  user$: Observable<User | null> = this.userSubject.asObservable();

  wss: Subscription;

  constructor(private http: HttpClient,
              private websocketService: WebsocketService) {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      this.tokenSubject.next(savedToken);
      this.validate(savedToken);
    }
    if (savedUser) this.userSubject.next(JSON.parse(savedUser));

    this.wss = this.websocketService.ws$.subscribe(message => {
      if(
        (message.model == 'user' && message.id == this.userSubject.value?.login) ||
        (message.model == 'userWipe' && message.id == this.userSubject.value?.login) ||
        (message.model == 'team' && message.id == this.userSubject.value?.team?.id.toString()) ||
        (message.model == 'role' && message.id == this.userSubject.value?.role?.id.toString())
      ) {
        this.initiateUpdate();
      }
    })
  }

  ngOnDestroy() {
    this.wss.unsubscribe();
  }

  initiateUpdate() {
    this.validate(this.getToken() || '');
  }

  login(loginRequest: JwtRequestDto): Observable<JwtResponseDto> {
    return this.http.post<JwtResponseDto>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
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

  validate(token: string): void {
    this.http.get<User>(`${this.apiUrl}/users/current`,
      { headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        })
      }).pipe(catchError(error => {
        this.logout();
        return throwError(() => new Error('Требуется повторная авторизация'));
    })).subscribe(user => {
      this.setUser(user);
    });
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
