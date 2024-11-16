import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Status} from "../../models/status";

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAllStatuses(): Observable<Status[] | HttpErrorResponse> {
    return this.http.get<Status[]>(`${this.apiService.apiUrl}/statuses`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  createStatus(status: Status): Observable<Status | HttpErrorResponse> {
    return this.http.post<Status>(`${this.apiService.apiUrl}/statuses`, status, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  updateStatus(id: number, updatedStatus: Status): Observable<Status | HttpErrorResponse> {
    return this.http.put<Status>(`${this.apiService.apiUrl}/statuses/${id}`, updatedStatus, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  deleteStatus(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/statuses/${id}`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }
}
