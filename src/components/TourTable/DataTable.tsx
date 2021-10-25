import React from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import type { Tour } from '../../redux/mapStoreToProps';

type Props = {
  columns: MUIDataTableColumn[];
  data: Tour[];
};

function sortTours(data: Tour[]): Tour[] {
  const datearr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curdate = `${datearr[new Date().getMonth()]} ${new Date().getDate()}, ${new Date().getFullYear()}`;
  const sorttours = data.filter((tour) => new Date(tour.date) >= new Date(curdate)).reverse();
  if (sorttours.length > 0)sorttours[sorttours.length] = sorttours[sorttours.length + 1];
  const sortedtours = [...sorttours, ...data.filter((tour) => new Date(tour.date) < new Date(curdate))];
  return sortedtours;
}

export const DataTable = ({ columns, data }: Props):JSX.Element => {
  // console.log(data);
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
      data={sortTours(data)}
      title=""
    />
  );
};
export default DataTable;
