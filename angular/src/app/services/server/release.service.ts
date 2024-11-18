import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Release} from "../../models/release";
import {ReleaseDto} from "../../models/dto/release-dto";
import {Page} from "../../models/misc/page";

@Injectable({
  providedIn: 'root'
})
export class ReleaseService {
  private releaseSubject = new Subject<{}>();
  release$ = this.releaseSubject.asObservable();

  constructor(private http: HttpClient, private apiService: ApiService) {}

  initiateUpdate() {
    this.releaseSubject.next({});
  }

  getAllReleases(page: number = 0): Observable<Page<Release> | HttpErrorResponse> {
    return this.http.get<Page<Release>>(`${this.apiService.apiUrl}/releases`, { params: {page: page.toString()}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  getReleasesBySprint(sprintId: number, page: number = 0): Observable<Page<Release> | HttpErrorResponse> {
    return this.http.get<Page<Release>>(`${this.apiService.apiUrl}/releases/sprint/${sprintId}`, { params: {page: page.toString()}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  createRelease(releaseDto: ReleaseDto): Observable<Release | HttpErrorResponse> {
    return this.http.post<Release>(`${this.apiService.apiUrl}/releases`, releaseDto, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  updateRelease(id: number, releaseDto: ReleaseDto): Observable<Release | HttpErrorResponse> {
    return this.http.put<Release>(`${this.apiService.apiUrl}/releases/${id}`, releaseDto, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  deleteRelease(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/releases/${id}`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }
}
