import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Role} from "../../models/role";
import {Status} from "../../models/status";

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAllRoles(): Observable<Role[] | HttpErrorResponse> {
    return this.http.get<Role[]>(`${this.apiService.apiUrl}/roles`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  createRole(role: Role): Observable<Role | HttpErrorResponse> {
    return this.http.post<Role>(`${this.apiService.apiUrl}/roles`, role, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  updateRole(id: number, updatedRole: Role): Observable<Role | HttpErrorResponse> {
    return this.http.put<Role>(`${this.apiService.apiUrl}/roles/${id}`, updatedRole, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }


  deleteRole(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/roles/${id}`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  getRoleStatuses(id: number): Observable<Status[] | HttpErrorResponse> {
    return this.http.get<Status[]>(`${this.apiService.apiUrl}/roles/${id}/statuses`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  addRoleStatus(roleId: number, statusId: number): Observable<any | HttpErrorResponse> {
    return this.http.post<any>(`${this.apiService.apiUrl}/roles/${roleId}/statuses`, null, { params: {statusId}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  deleteRoleStatus(roleId: number, statusId: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/roles/${roleId}/statuses`, { params: {statusId}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }
}
