import { Component } from '@angular/core';
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  standalone: true
})
export class NotFoundComponent {
  constructor(private loaderService: LoaderService) {
    this.loaderService.loader(false);
  }
}
