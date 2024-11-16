import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {ObjectDto} from "../models/dto/object-dto";
import {Team} from "../models/team";

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAllTeams(onlyActive: boolean): Observable<Team[] | HttpErrorResponse> {
    return this.http.get<Team[]>(`${this.apiService.apiUrl}/teams`, {params: {onlyActive: onlyActive?.toString()}, headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  createTeam(team: Team): Observable<Team | HttpErrorResponse> {
    return this.http.post<Team>(`${this.apiService.apiUrl}/teams`, team, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  updateTeam(id: number, updatedTeam: Team): Observable<Team | HttpErrorResponse> {
    return this.http.put<Team>(`${this.apiService.apiUrl}/teams/${id}`, updatedTeam, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  getTeamLoad(teamId: number, sprintId: number): Observable<ObjectDto | HttpErrorResponse> {
    return this.http.get<ObjectDto>(`${this.apiService.apiUrl}/teams/load`, { params: { teamId: teamId.toString(), sprintId: sprintId.toString() }, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  deleteTeam(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/teams/${id}`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }
}
