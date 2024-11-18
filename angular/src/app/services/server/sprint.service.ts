import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Sprint} from "../../models/sprint";
import {SprintDto} from "../../models/dto/sprint-dto";
import {SprintTeamDto} from "../../models/dto/sprint-team-dto";
import {UserStoryPointsDto} from "../../models/dto/user-story-points-dto";
import {Release} from "../../models/release";
import {Page} from "../../models/misc/page";

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private sprintSubject = new Subject<{}>();
  sprint$ = this.sprintSubject.asObservable();

  constructor(private http: HttpClient, private apiService: ApiService) {}

  initiateUpdate() {
    this.sprintSubject.next({});
  }

  getAllSprints(page: number = 0): Observable<Page<Sprint> | HttpErrorResponse> {
    return this.http.get<Page<Sprint>>(`${this.apiService.apiUrl}/sprints`, { params: { page: page.toString() }, headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  getSprint(id: number): Observable<Sprint | HttpErrorResponse> {
    return this.http.get<Sprint>(`${this.apiService.apiUrl}/sprints/${id}`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  createSprint(sprintDto: SprintDto): Observable<Sprint | HttpErrorResponse> {
    return this.http.post<Sprint>(`${this.apiService.apiUrl}/sprints`, sprintDto, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }


  updateSprint(id: number, updatedSprint: SprintDto): Observable<Sprint | HttpErrorResponse> {
    return this.http.put<Sprint>(`${this.apiService.apiUrl}/sprints/${id}`, updatedSprint, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  deleteSprint(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/sprints/${id}`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  getSprintsByYearAndTeam(year: number, teamName: string): Observable<SprintTeamDto[] | HttpErrorResponse> {
    return this.http.get<SprintTeamDto[]>(`${this.apiService.apiUrl}/sprints/filtered`, { params: { year: year.toString(), teamName: teamName }, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  getStoryPointsPerUser(sprintId: number): Observable<UserStoryPointsDto[] | HttpErrorResponse> {
    return this.http.get<UserStoryPointsDto[]>(`${this.apiService.apiUrl}/sprints/${sprintId}/story-points`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  getSprintReleases(id: number): Observable<Release[] | HttpErrorResponse> {
    return this.http.get<Release[]>(`${this.apiService.apiUrl}/sprints/${id}/releases`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }
}
