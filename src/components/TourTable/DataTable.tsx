import React, { useContext } from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { Tour } from '../../redux/mapStoreToProps';
import { TourTableContext } from '../../providers/TourTable.provider';

type Props = {
  columns: MUIDataTableColumn[];
  data: Tour[];
};
export const DataTable = ({ columns, data }: Props):JSX.Element => {
  const { test } = useContext(TourTableContext);
  // eslint-disable-next-line no-console
  console.log(test);
  return (
    <MUIDataTable
      options={{
        filterType: 'dropdown',
        pagination: false,
        responsive: 'scrollMaxHeight',
        filter: false,
        download: false,
        search: false,
        print: false,
        viewColumns: false,
        selectableRows: 'none',
        fixedHeader: false,
      }}
      columns={columns}
      data={data}
      title=""
    />
  );
};
export default DataTable;
