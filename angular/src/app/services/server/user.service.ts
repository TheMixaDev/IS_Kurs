import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {User} from "../../models/user";
import {UserDto} from "../../models/dto/user-dto";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAllUsers(page: number = 0, login: string): Observable<User[] | HttpErrorResponse> {
    let params = { page: page.toString(), login: login };

    return this.http.get<User[]>(`${this.apiService.apiUrl}/users`, {params, headers: this.apiService.getHeaders()}).pipe(catchError(this.apiService.handleError));
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
}
