import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loaderSubject = new Subject<{ show: boolean }>();
  loader$ = this.loaderSubject.asObservable();

  loader(show: boolean) {
    this.loaderSubject.next({ show });
  }
}
