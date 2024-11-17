import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {MessageDto} from "../../models/dto/message-dto";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ApiService} from "./api.service";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getCalendar(year: number): Observable<MessageDto | HttpErrorResponse> {
    const cachedData = localStorage.getItem(`calendar${year}`);
    if (cachedData) {
      return new Observable<MessageDto>(observer => observer.next(JSON.parse(cachedData)));
    }
    return this.http.get<MessageDto>(`${this.apiService.apiUrl}/calendar`, { params: { year: year.toString() }, headers: this.apiService.getHeaders() }).pipe(
      catchError(this.apiService.handleError)
    );
  }
}
