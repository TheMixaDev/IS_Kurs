import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Status} from "../../models/status";
import { StatusDto } from "../../models/dto/status-dto";

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private statusSubject = new Subject<{}>();
  status$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient, private apiService: ApiService) {}

  initiateUpdate() {
    this.statusSubject.next({});
  }

  getAllStatuses(): Observable<Status[] | HttpErrorResponse> {
    return this.http.get<Status[]>(`${this.apiService.apiUrl}/statuses`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  createStatus(status: StatusDto): Observable<Status | HttpErrorResponse> {
    return this.http.post<Status>(`${this.apiService.apiUrl}/statuses`, status, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  updateStatus(id: number, updatedStatus: StatusDto): Observable<Status | HttpErrorResponse> {
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
