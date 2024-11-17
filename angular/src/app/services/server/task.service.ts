import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";
import {Task} from "../../models/task";
import {TaskDto} from "../../models/dto/task-dto";
import {Page} from "../../models/misc/page";

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAllTasks(page: number = 0, statusId?: number, implementerLogin?: string, sprintId?: number): Observable<Page<Task> | HttpErrorResponse> {
    let params: { page: string, statusId?: string, implementerLogin?: string, sprintId?: string } = { page: page.toString() };
    if(statusId) params.statusId = statusId.toString();
    if(implementerLogin) params.implementerLogin = implementerLogin;
    if(sprintId) params.sprintId = sprintId.toString();

    return this.http.get<Page<Task>>(`${this.apiService.apiUrl}/tasks`, { params, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  createTask(taskDto: TaskDto): Observable<Task | HttpErrorResponse> {
    return this.http.post<Task>(`${this.apiService.apiUrl}/tasks`, taskDto, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  updateTask(id: number, updatedTask: TaskDto): Observable<Task | HttpErrorResponse> {
    return this.http.put<Task>(`${this.apiService.apiUrl}/tasks/${id}`, updatedTask, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }

  deleteTask(id: number): Observable<any | HttpErrorResponse> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/tasks/${id}`, { headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  assignImplementer(taskId: number, implementerLogin: string): Observable<Task | HttpErrorResponse> {
    return this.http.put<Task>(`${this.apiService.apiUrl}/tasks/${taskId}/implementer`, null, { params: { implementerLogin }, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  updateTaskStatus(taskId: number, statusId: number): Observable<Task | HttpErrorResponse> {
    return this.http.put<Task>(`${this.apiService.apiUrl}/tasks/${taskId}/status`, null, { params: { statusId: statusId.toString() }, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }


  assignSprintToTask(taskId: number, sprintId: number): Observable<Task | HttpErrorResponse> {
    return this.http.put<Task>(`${this.apiService.apiUrl}/tasks/${taskId}/sprint`, null, { params: { sprintId: sprintId.toString() }, headers: this.apiService.getHeaders() }).pipe(catchError(this.apiService.handleError));
  }
}
