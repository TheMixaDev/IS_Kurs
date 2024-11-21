import {Component} from "@angular/core";

@Component({
  selector: 'app-loader',
  template: `
    <div class="absolute w-full h-full bg-gray-50" style="z-index: 100">
      <span class="mainLoader"></span>
    </div>
  `,
  standalone: true
})
export class LoaderComponent {}
