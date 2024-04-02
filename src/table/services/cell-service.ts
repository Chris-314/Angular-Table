import { BehaviorSubject } from 'rxjs';
import { Cell, Configuration } from '../models';

export class CellService<T> {
  private cellSubject = new BehaviorSubject<Cell<T>[]>([]);

  public get cells$() {
    return this.cellSubject.asObservable();
  }

  private toCells(data: T, rowIdx: number, configuration: Configuration<T>) {
    return configuration.columns.reduce<Cell<T>[]>((p, c, i) => {
      const cellValue = data[c.column];
      return [
        ...p,
        {
          cellId: `${rowIdx}-${i}`,
          column: c.column,
          isDirty: false,
          value: c.cellValue(cellValue),
          width: c.width,
          stickyLeft: c.stickyLeft,
          stickyRight: c.stickyRight
        },
      ];
    }, []);
  }

  private refreshCells(
    cells: Cell<T>[],
    rowIdx: number,
    configuration: Configuration<T>
  ) {
    return cells.map((cell) => {
      const colConf = configuration.columns.find(
        (col) => col.column === cell.column
      );
      if (!colConf) {
        console.warn(
          '[CellService] : Trying to refresh a cell that does not have cell configuration',
          cell
        );
        return cell;
      }
      const colIdx = configuration.columns.findIndex(
        (conf) => conf === colConf
      );

      return {
        ...cell,
        isDirty: true,
        cellId: `${rowIdx}-${colIdx}`,
      };
    });
  }

  public insert(
    cells: Cell<T>[],
    rowIndex: number,
    configuation: Configuration<T>
  ): void;
  public insert(
    data: T,
    rowIndex: number,
    configuration: Configuration<T>
  ): void;
  public insert(
    data: T | Cell<T>[],
    rowIndex: number,
    configuration: Configuration<T>
  ) {
    const cells = Array.isArray(data)
      ? this.refreshCells(data, rowIndex, configuration)
      : this.toCells(data, rowIndex, configuration);
    const actualCells = this.cellSubject.value.slice();
    const cellIdx = rowIndex * configuration.columns.length;
    actualCells.splice(cellIdx, 0, ...cells);

    this.cellSubject.next(actualCells);
  }

  public removeRow(
    rowIndex: number | null,
    configuration: Configuration<T>,
    sendUpdate = true
  ): Cell<T>[] {
    if (rowIndex === null) {
      console.warn('[CellService] : Trying to remove an unknown row');

      return [];
    }
    const actualCells = this.cellSubject.value.slice();
    const cellIdx = rowIndex * configuration.columns.length;
    const cells = actualCells.splice(cellIdx, configuration.columns.length);
    if (sendUpdate) {
      this.cellSubject.next(actualCells);
    }
    return cells;
  }
  public clear() {
    this.cellSubject.next([]);
  }
}
