import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {User} from "../../models/user";
import {UserDto} from "../../models/dto/user-dto";
import {Page} from "../../models/misc/page";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new Subject<{}>();
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private apiService: ApiService) {}

  initiateUpdate() {
    this.userSubject.next({});
  }

  getAllUsers(page: number = 0, login: string, team: number = 0, onlyActive: boolean | null = true): Observable<Page<User> | HttpErrorResponse> {
    let params : { page: string, login: string, team: number, onlyActive?: boolean } = { page: page.toString(), login, team};
    if(onlyActive) params.onlyActive = onlyActive;

    return this.http.get<Page<User>>(`${this.apiService.apiUrl}/users`, {params, headers: this.apiService.getHeaders()}).pipe(catchError(this.apiService.handleError));
  }

  getCurrentUser(): Observable<User | HttpErrorResponse> {
    return this.http.get<User>(`${this.apiService.apiUrl}/users/current`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  registerUser(userDto: UserDto): Observable<User | HttpErrorResponse> {
    return this.http.post<User>(`${this.apiService.apiUrl}/users/register`, userDto, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  updateUserRole(login: string, roleId: number): Observable<User | HttpErrorResponse> {
    return this.http.put<User>(`${this.apiService.apiUrl}/users/${login}/role`, null, { params: {roleId: roleId.toString()}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  updateUserTeam(login: string, teamId: number): Observable<User | HttpErrorResponse> {
    let params = {teamId: teamId.toString()};

    return this.http.put<User>(`${this.apiService.apiUrl}/users/${login}/team`, null, { params, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  updateUser(login: string, userDto: UserDto): Observable<User | HttpErrorResponse> {
    return this.http.put<User>(`${this.apiService.apiUrl}/users/${login}`, userDto, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  wipeUser(login: string): Observable<void | HttpErrorResponse> {
    return this.http.delete<void>(`${this.apiService.apiUrl}/users/${login}`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }
}
