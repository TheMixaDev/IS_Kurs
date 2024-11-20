import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Risk} from "../../models/risk";
import {TopRiskDto} from "../../models/dto/top-risk-dto";
import {Page} from "../../models/misc/page";
import { RiskDto } from "../../models/dto/risk-dto";

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private riskSubject = new Subject<{}>();
  risk$ = this.riskSubject.asObservable();
  
  constructor(private http: HttpClient, private apiService: ApiService) {}

  initiateUpdate() {
    this.riskSubject.next({});
  }

  getAllRisks(page: number = 0): Observable<Page<Risk> | HttpErrorResponse> {
    return this.http.get<Page<Risk>>(`${this.apiService.apiUrl}/risks`, { params: { page: page.toString() }, headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  createRisk(risk: RiskDto): Observable<Risk | HttpErrorResponse> {
    return this.http.post<Risk>(`${this.apiService.apiUrl}/risks`, risk, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  updateRisk(id: number, updatedRisk: RiskDto): Observable<Risk | HttpErrorResponse> {
    return this.http.put<Risk>(`${this.apiService.apiUrl}/risks/${id}`, updatedRisk, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  deleteRisk(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/risks/${id}`, { headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }

  addRiskToTask(taskId: number, riskId: number): Observable<any | HttpErrorResponse> {
    return this.http.post<any>(`${this.apiService.apiUrl}/risks/task/${taskId}`, null, { params: {riskId}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  removeRiskFromTask(taskId: number, riskId: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/risks/task/${taskId}`, { params: {riskId}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  getRisksForTask(taskId: number): Observable<Risk[] | HttpErrorResponse> {
    return this.http.get<Risk[]>(`${this.apiService.apiUrl}/risks/task/${taskId}`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  addRiskToIdea(ideaId: number, riskId: number): Observable<any | HttpErrorResponse> {
    return this.http.post<any>(`${this.apiService.apiUrl}/risks/idea/${ideaId}`, null, { params: {riskId}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  removeRiskFromIdea(ideaId: number, riskId: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/risks/idea/${ideaId}`, { params: {riskId}, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  getRisksForIdea(ideaId: number): Observable<Risk[] | HttpErrorResponse> {
    return this.http.get<Risk[]>(`${this.apiService.apiUrl}/risks/idea/${ideaId}`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  getTop10Risks(): Observable<TopRiskDto[] | HttpErrorResponse> {
    return this.http.get<TopRiskDto[]>(`${this.apiService.apiUrl}/risks/top10`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }
}
