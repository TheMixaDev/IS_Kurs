import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Tag} from "../../models/tag";

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private statusSubject = new Subject<{}>();
  tag$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient, private apiService: ApiService) {}

  initiateUpdate() {
    this.statusSubject.next({});
  }

  getAllTags(): Observable<Tag[] | HttpErrorResponse> {
    return this.http.get<Tag[]>(`${this.apiService.apiUrl}/tags`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  createTag(tag: Tag): Observable<Tag | HttpErrorResponse> {
    return this.http.post<Tag>(`${this.apiService.apiUrl}/tags`, tag, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  updateTag(id: number, updatedTag: Tag): Observable<Tag | HttpErrorResponse> {
    return this.http.put<Tag>(`${this.apiService.apiUrl}/tags/${id}`, updatedTag, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  deleteTag(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/tags/${id}`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  addTagToTask(taskId: number, tagId: number): Observable<any | HttpErrorResponse> {
    return this.http.post<any>(`${this.apiService.apiUrl}/tags/task/${taskId}`, null, { params: { tagId }, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  removeTagFromTask(taskId: number, tagId: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/tags/task/${taskId}`, { params: { tagId }, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  getTagsForTask(taskId: number): Observable<Tag[] | HttpErrorResponse> {
    return this.http.get<Tag[]>(`${this.apiService.apiUrl}/tags/task/${taskId}`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }
}
