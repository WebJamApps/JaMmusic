import React, { useContext } from 'react';
import { DataGrid, GridColumns, GridEnrichedColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { GigsContext } from '../providers/Gigs.provider';
import HtmlReactParser from 'html-react-parser';

export const makeVenue = ():GridEnrichedColDef => {
  return (
    {
      field: 'venue',
      headerName: 'Venue',
      width: 800,
      editable: false,
      renderCell:(params:GridRenderCellParams) => HtmlReactParser(params.value),
    }
  );
};

const columns:GridColumns = [
  {
    field: 'date',
    headerName: 'Date',
    width: 150,
    editable: false,
  },
  {
    field: 'time',
    headerName: 'Time',
    width: 150,
    editable: false,
  },
  {
    field: 'location',
    headerName: 'Location',
    width: 150,
    editable: false,
  },
  makeVenue(),
  {
    field: 'tickets',
    headerName: 'Tickets',
    width: 140,
    editable: false,
  },
];

export const Gigs = (): JSX.Element => {
  const { gigs } = useContext(GigsContext);
  return (
    <div style={{ margin: 'auto', padding:'10px', width:'100%' }}>
      <h4 style={{ textAlign:'center' }}>Gigs</h4>
      <div style={{ height: 674, width: '100%' }}>
      <DataGrid
        rows={gigs}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
      />
      </div>
    </div>
  );
};
