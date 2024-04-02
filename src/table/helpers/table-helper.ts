import { Table, Configuration } from './../models';

export const toTable = <T>(configuration: Configuration<T>): Table<T> => {
  let gridTemplateColumn = configuration.columns
    .map((c) => c.width || '1fr')
    .join(' ');
  if (configuration.selectionMode !== 'none') {
    gridTemplateColumn = 'min-content ' + gridTemplateColumn;
  }
  if (configuration.expandable) {
    gridTemplateColumn = gridTemplateColumn + ' min-content';
  }
  const firstSticky = configuration.columns[0]?.sticky || false;
  const lastSticky =
    configuration.columns[configuration.columns?.length || 0]?.sticky || false;

  const result: Table<T> = {
    columnTemplate: gridTemplateColumn,
    columns: configuration.columns.map((c, i, arr) => ({
      name: c.name,
      sortable: !!c.sortFn,
      stickyLeft: c.sticky,
      stickyRight: false,
      width: c.width,
    })),
    rowId: configuration.rowId,
    stickyFooter: configuration.stickyFooter,
    stickyHeader: configuration.stickyHeader,
    stickyExpandable: configuration.stickyExpandable || lastSticky,
    stickySelection: configuration.stickySelection || firstSticky,
    selectable: configuration.selectionMode !== 'none',
    withCheckBox: configuration.selectionMode === 'checkbox',
    withRadio: configuration.selectionMode === 'radio',
    expandable: configuration.expandable,
    filterSelectionFn: configuration.filterSelectionFn,
    expansionFn: configuration.expansionFn,
    dataTrackByFn: (_, data) => data[configuration.rowId],
  };

  return result;
};
