import { TrackByFunction } from "@angular/core";
import { ExpansionFn, SelectionFilterFn } from "./configuration";

export interface Column {
  name: string;
  stickyLeft: boolean;
  stickyRight: boolean;
  sortable: boolean;
  width: string | null;
}

export interface Cell<T> {
  cellId: string;
  column: keyof T;
  stickyLeft: boolean;
  stickyRight: boolean;
  isDirty: boolean;
  value: string;
  width: string | null;
}

export interface Table<T> {
  readonly rowId: keyof T;
  readonly columnTemplate: string | null;
  readonly columns: Column[];
  readonly stickyHeader: boolean;
  readonly stickyFooter: boolean;
  readonly selectable: boolean;
  readonly stickySelection: boolean;
  readonly expandable: boolean;
  readonly stickyExpandable: boolean;
  readonly withCheckBox: boolean;
  readonly withRadio: boolean;
  readonly expansionFn: ExpansionFn<T, unknown>;
  readonly filterSelectionFn: SelectionFilterFn<T>;
  readonly dataTrackByFn: TrackByFunction<T>
}
