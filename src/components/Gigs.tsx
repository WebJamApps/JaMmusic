import React, { useContext } from 'react';
import { DataGrid, GridColumns, GridEnrichedColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { GigsContext } from '../providers/Gigs.provider';
import HtmlReactParser from 'html-react-parser';
import './Gigs.scss';

export const makeVenue = ():GridEnrichedColDef => {
  return (
    {
      field: 'venue',
      headerName: 'Venue',
      width: 600,
      editable: false,
      renderCell:(params:GridRenderCellParams) => <span>{HtmlReactParser(params.value)}</span>,
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
      <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={gigs}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
      />
      </div>
    </div>
  );
};
