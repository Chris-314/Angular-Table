import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableComponent } from '../table/table.component';
import { contracts, contractsConf, createRandomContract } from './fake-data';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [TableComponent, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'test-table';

  public data = contracts;
  public conf = contractsConf;

  constructor(private cdRef: ChangeDetectorRef) {

  }

  public remove(event: Event) {
    this.data.splice(0, 5);
    this.cdRef.detectChanges();
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  public add(event: Event) {
    const newContracts = new Array(5)
    .fill(0)
    .map(() => createRandomContract());

    this.data.splice(0,0, ...newContracts);
    this.cdRef.detectChanges();
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
