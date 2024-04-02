import { Observable } from "rxjs";
import { PropertyFn } from "./property-fn";


export type SelectionMode = 'none' | 'checkbox' | 'radio';
export type SelectionFilterFn<T> = (data: T) => boolean;
export type ExpansionFn<T, U = T> = (data: T) => (U | Promise<U> | Observable<U>);
export interface Configuration<T> {
  readonly rowId: keyof T;
  readonly columns: ColumnConfiguration<T>[];
  readonly stickyHeader: boolean;
  readonly stickyFooter: boolean;
  readonly filterSelectionFn : SelectionFilterFn<T>;
  readonly stickySelection: boolean;
  readonly selectionMode: SelectionMode;
  readonly expandable: boolean;
  readonly stickyExpandable: boolean;
  readonly expansionFn: ExpansionFn<T, unknown>;
}
export interface ColumnConfiguration<T, K extends keyof T = keyof T> {
  column: K;
  name: string;
  cellValue:  PropertyFn<T[K], string>;
  sortFn: ((data: T[], column: keyof T, value: T[K]) => T[]) | null;
  sticky: boolean;
  stickyLeft: boolean;
  stickyRight: boolean;
  width: string | null;
}
