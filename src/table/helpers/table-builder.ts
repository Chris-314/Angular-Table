import {
  ColumnConfiguration,
  Configuration,
  PropertyFn,
  SelectionMode,
  SelectionFilterFn,
  ExpansionFn,
} from '../models';
type WidthUnit = 'px' | '%' | 'ch' | 'rem' | 'fr';
type Width = `${string}${WidthUnit}`;
type SortFn<T, K extends keyof T = keyof T> = (
  data: T[],
  column: keyof T,
  value: T[K]
) => T[];
class ColumnBuilder<T, K extends keyof T = keyof T> {
  private name: string | null = null;
  private cellValue: PropertyFn<T[K], string> = (val) => JSON.stringify(val);
  private stickyValue = false;
  private sortFn: SortFn<T, K> | null = null;
  public widthValue: Width | null = null;

  constructor(private column: K) {}

  public withName(name: string) {
    this.name = name;
    return this;
  }
  public parseValue(parser: PropertyFn<T[K], string>) {
    this.cellValue = parser;
    return this;
  }

  public sticky(): ColumnBuilder<T, K> {
    this.stickyValue = true;
    return this;
  }

  public sortable(sortFn: SortFn<T, K>) {
    this.sortFn = sortFn;
  }
  public width(width: Width) {
    this.widthValue = width;
    return this;
  }

  public build(): ColumnConfiguration<T, K> {
    return {
      column: this.column,
      name: this.name || this.column.toString(),
      cellValue: this.cellValue,
      sticky: this.stickyValue,
      stickyLeft: this.stickyValue,
      stickyRight: this.stickyValue,
      sortFn: this.sortFn,
      width: this.widthValue,
    };
  }
}

export class TableBuilder<T> {
  private columns: ColumnBuilder<T, any>[] = [];
  public hasStickyHeader = false;
  public hasStickyFooter = false;
  public selectionMode: SelectionMode = 'none';
  public isExpandable = false;
  public stickyExpandable = true;
  public stickySelection = true;
  public selectionFilterFn: SelectionFilterFn<T> = () => true;
  public expansionFn: ExpansionFn<T, unknown> = (data: T) => data;

  private constructor(private rowId: keyof T) {}

  private cleanStickyness(
    columns: ColumnConfiguration<T>[]
  ): ColumnConfiguration<T>[] {
    //Basic algorithm to set all stickyleft if columns <= middle and all sitckyRight if column > middle
    const areAllSticky = columns.every((c) => c.sticky);
    if (areAllSticky) {
      return columns.map((c) => ({ ...c, sticky: false }));
    }
    const len = columns.length;
    const middle = len % 2 === 0 ? len / 2 : (len + 1) / 2;
    let leftPart = columns.slice(0, middle).reverse();
    let rightPart = columns.slice(middle);
    const leftFirstIdx = leftPart.findIndex((c) => c.sticky);
    const rightFirstIdx = rightPart.findIndex((c) => c.sticky);
    if (leftFirstIdx >= 0) {
      leftPart = leftPart.map((c, i) => ({ ...c, stickyLeft: i >= leftFirstIdx }));
    }
    if (rightFirstIdx >= 0) {
      rightPart = rightPart.map((c, i) => ({
        ...c,
        stickyRight: i >= rightFirstIdx,
      }));
    }
    return [...leftPart.reverse(), ...rightPart];
  }

  public static for<U>(rowId: keyof U): TableBuilder<U> {
    return new TableBuilder(rowId);
  }

  public withColumn<K extends keyof T = keyof T>(
    column: K,
    configuration: (builder: ColumnBuilder<T, K>) => void
  ) {
    const columnBuilder = new ColumnBuilder<T, K>(column);
    this.columns.push(columnBuilder);

    configuration(columnBuilder);
    return this;
  }

  public withSelection(selectionMode: Exclude<SelectionMode, 'none'>): this;
  public withSelection(
    selectionMode: Exclude<SelectionMode, 'none'>,
    sticky?: boolean
  ): this;
  public withSelection(
    SelectionMode: Exclude<SelectionMode, 'none'>,
    selectionFilterFn: SelectionFilterFn<T>,
    sticky?: boolean
  ): this;
  public withSelection(
    selectionMode: Exclude<SelectionMode, 'none'>,
    param2?: boolean | SelectionFilterFn<T>,
    param3?: boolean | undefined
  ) {
    this.selectionMode = selectionMode;
    let filterFn = this.selectionFilterFn;
    if (typeof param2 === 'boolean') {
      this.stickySelection = param2;
    } else if (typeof param2 === 'function') {
      filterFn = param2;
      this.stickySelection = param3 === undefined ? true : param3;
    }
    if (filterFn) {
      this.selectionFilterFn = filterFn;
    }
    return this;
  }

  public expandable<U = T>(sticky?: boolean): this;
  public expandable<U = T>(
    expansionFn?: ExpansionFn<T, U>,
    sticky?: boolean
  ): this;
  public expandable<U = T>(
    param1?: ExpansionFn<T, U> | boolean,
    param2?: boolean
  ): this {
    if (typeof param1 === 'function') {
      this.expansionFn = param1;
    }
    if (typeof param1 === 'boolean') {
      this.stickyExpandable = param1;
    } else if (typeof param2 === 'boolean') {
      this.stickyExpandable = param2;
    }
    this.isExpandable = true;
    return this;
  }

  public stickyHeader() {
    this.hasStickyHeader = true;
    return this;
  }
  public stickyFooter() {
    this.hasStickyFooter = true;
    return this;
  }

  public build(): Configuration<T> {
    //Fix stickyness here to simplify computing
    return {
      columns: this.cleanStickyness(this.columns.map((c) => c.build())),
      rowId: this.rowId,
      stickyFooter: this.hasStickyFooter,
      stickyHeader: this.hasStickyHeader,
      stickyExpandable: this.stickyExpandable,
      stickySelection: this.stickySelection,
      selectionMode: this.selectionMode,
      expandable: this.isExpandable,
      expansionFn: this.expansionFn,
      filterSelectionFn: this.selectionFilterFn,
    };
  }
}
