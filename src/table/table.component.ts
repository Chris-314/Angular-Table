import { Configuration } from './models/configuration';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  DoCheck,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  isDevMode,
} from '@angular/core';
import { Cell, Table } from './models';
import { CellService } from './services/cell-service';
import { Subscription } from 'rxjs';
import { toTable } from './helpers/table-helper';

@Component({
  selector: 'app-table',
  standalone: true,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [JsonPipe, NgFor, NgIf],
  providers: [CellService],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T, U extends NgIterable<T> = NgIterable<T>>
  implements OnInit, OnDestroy, DoCheck, AfterViewChecked
{
  @Input() set data(value: U) {
    this._data = value;
    this._dataDirty = true;
  }
  @Input() set configuration(value: Configuration<T> | null) {
    this._configuration = value;
    this._confDirty = true;
  }
  public get configuration() {
    return this._configuration;
  }
  private _confDirty = true;
  private _dataDirty = true;
  private _data: U | undefined;
  private _configuration: Configuration<T> | null = null;
  private _differ: IterableDiffer<T> | null = null;
  private subscriptions: Subscription[] = [];

  private readonly start;
  private hasPrintedTime = false;
  public cells: Cell<T>[] = [];
  public table: Table<T> | null = null;

  constructor(
    private cellService: CellService<T>,
    private cdRef: ChangeDetectorRef,
    private _differs: IterableDiffers
  ) {
    this.start = window.performance.now();
  }
  public get nbDataColumns() {
    return (this.table?.columns.length || 0);
  }

  public get nbDisplayedColumns() {
    let adder = 0;
    if (this.table?.expandable) {
      adder++;
    }
    if (this.table?.selectable) {
      adder++;
    }
    return adder + (this.table?.columns.length || 0);
  }

  private _applyChanges(
    changes: IterableChanges<T>,
    tableConfiguration: Configuration<T>
  ) {
    changes.forEachOperation(
      (
        item: IterableChangeRecord<T>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null
      ) => {
        if (item.previousIndex === null) {
          const index = item.currentIndex !== null ? item.currentIndex : -1;
          this.cellService.insert(item.item, index, tableConfiguration);
        } else if (currentIndex === null) {
          this.cellService.removeRow(
            adjustedPreviousIndex,
            tableConfiguration,
            true
          );
        } else if (adjustedPreviousIndex !== null) {
          const cells = this.cellService.removeRow(
            adjustedPreviousIndex,
            tableConfiguration,
            false
          );
          this.cellService.insert(cells, currentIndex!, tableConfiguration);
        }
      }
    );
  }

  public trackByCell(_: number, cell: Cell<T>) {
    const result = `${cell.cellId}-${cell.isDirty}`;
    cell.isDirty = false;
    return result;
  }

  ngAfterViewChecked(): void {
    if(!this.hasPrintedTime) {
      this.hasPrintedTime = false;
      const total = window.performance.now() - this.start;
      console.log('Rendering time: ', total);
    }
  }

  ngDoCheck(): void {
    if (this._confDirty) {
      this._confDirty = false;
      this._dataDirty = true;
      this.table = null;
      this.cellService.clear();
      if (this._differ) {
        this._differ.diff([]);
      }
      if (this.configuration) {
        this.table = toTable(this.configuration);
      }
    }
    if (this._dataDirty && this.table) {
      this._dataDirty = false;
      const value = this._data;
      if (!this._differ && value) {
        if (isDevMode()) {
          try {
            // CAUTION: this logic is duplicated for production mode below, as the try-catch
            // is only present in development builds.
            this._differ = this._differs.find(value).create(this.table.dataTrackByFn);
          } catch {
            let errorMessage =
              `Cannot find a differ supporting object '${value}' of type '` +
              `${getTypeName(
                value
              )}'. NgFor only supports binding to Iterables, such as Arrays.`;
            if (typeof value === 'object') {
              errorMessage += ' Did you mean to use the keyvalue pipe?';
            }
            throw new Error(errorMessage);
          }
        } else {
          // CAUTION: this logic is duplicated for development mode above, as the try-catch
          // is only present in development builds.
          this._differ = this._differs.find(value).create(this.table.dataTrackByFn);
        }
      }
    }
    if (this._differ && this.configuration) {
      const changes = this._differ.diff(this._data);
      if (changes) this._applyChanges(changes, this.configuration);
    }
  }

  ngOnInit() {
    this.subscriptions.push(
      this.cellService.cells$.subscribe((cells) => {
        this.cells = cells;
        this.cdRef.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}

function getTypeName(type: any): string {
  return type['name'] || typeof type;
}
