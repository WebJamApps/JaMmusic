import React, { useContext } from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import type { Tour } from '../../redux/mapStoreToProps';
import { TourTableContext } from '../../providers/TourTable.provider';

type Props = {
  columns: MUIDataTableColumn[];
  data: Tour[];
};
export const DataTable = ({ columns, data }: Props):JSX.Element => {
  const { test } = useContext(TourTableContext);
  const datearr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curdate = `${datearr[new Date().getMonth()]} ${new Date().getDay()}, ${new Date().getFullYear()}`;
  const sorttours = data.filter((tour) => new Date(tour.date) >= new Date(curdate)).reverse();
  if (sorttours.length > 0)sorttours[sorttours.length] = sorttours[sorttours.length + 1];
  const sortedtours = [...sorttours, ...data.filter((tour) => new Date(tour.date) <= new Date(curdate))];
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
      data={sortedtours}
      title=""
    />
  );
};
export default DataTable;
