import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Idea} from "../../models/idea";
import {IdeaDto} from "../../models/dto/idea-dto";
import {Page} from "../../models/misc/page";

@Injectable({
  providedIn: 'root'
})
export class IdeaService {
  private ideaSubject = new Subject<{}>();
  idea$ = this.ideaSubject.asObservable();

  constructor(private http: HttpClient, private apiService: ApiService) {}

  initiateUpdate() {
    this.ideaSubject.next({});
  }

  getAllIdeas(page: number = 0, status?: string | null): Observable<Page<Idea> | HttpErrorResponse> {
    let params: { page: string, status?: string } = { page: page.toString() };
    if(status) params.status = status;

    return this.http.get<Page<Idea>>(`${this.apiService.apiUrl}/ideas`, { params: params, headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  createIdea(ideaDto: IdeaDto): Observable<Idea | HttpErrorResponse> {
    return this.http.post<Idea>(`${this.apiService.apiUrl}/ideas`, ideaDto, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  updateIdea(id: number, updatedIdea: IdeaDto): Observable<Idea | HttpErrorResponse> {
    return this.http.put<Idea>(`${this.apiService.apiUrl}/ideas/${id}`, updatedIdea, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  setIdeaStatus(id: number, status: string): Observable<any | HttpErrorResponse> {
    return this.http.put<any>(`${this.apiService.apiUrl}/ideas/${id}/status`, null, { params: {status: status}, headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }
}
