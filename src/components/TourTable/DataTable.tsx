import React, { useContext } from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import type { Tour } from '../../redux/mapStoreToProps';
import { TourTableContext } from '../../providers/TourTable.provider';
import { system } from 'faker';

type Props = {
  columns: MUIDataTableColumn[];
  data: Tour[];
};
export const DataTable = ({ columns, data }: Props):JSX.Element => {
  const { test } = useContext(TourTableContext);
  // eslint-disable-next-line no-console
  var datearr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curdate: string = datearr[new Date().getMonth()] + ' ' + new Date().getDay() + ', ' + new Date().getFullYear();
  const sorttours: Tour[] = data.filter(tour => tour.date>curdate).reverse();
  sorttours.concat(data.filter(tour => tour.date<curdate));
  return (
    <MUIDataTable
      options={{
        filterType: 'dropdown',
        pagination: false,
        responsive: 'standard',
        filter: false,
        download: false,
        search: false,
        print: false,
        viewColumns: false,
        selectableRows: 'none',
        fixedHeader: false,
      }}
      columns={columns}
      data={sorttours}
      title=""
    />
  );
};
export default DataTable;
