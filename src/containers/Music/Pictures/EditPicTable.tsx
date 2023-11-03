import { Button } from '@mui/material';
import { DataGrid, GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import { useContext, useState } from 'react';
import { DataContext } from 'src/providers/Data.provider';
import './editPicTable.scss';
import { EditPicDialog } from './EditPicDialog';
import { defaultPic } from './pictures.utils';

export const columns: GridColumns = [
  {
    field: 'title',
    headerName: 'Tite',
    minWidth: 300,
    flex: 1,
    editable: false,
  },
  {
    field: 'url',
    headerName: 'Thumbnail',
    width: 300,
    editable: false,
    renderCell: (params: GridRenderCellParams) => {
      const { row: { url } } = params;
      if (!url) return '';
      return <img alt="url" src={url} style={{ width: '200px' }} />;
    },
  },
];
interface IeditPicTableProps {
  setShowTable:(arg0:boolean)=>void
}
export function EditPicTable(props:IeditPicTableProps) {
  const { setShowTable } = props;
  const { pics } = useContext(DataContext);
  const [editPic, setEditPic] = useState(defaultPic);
  return (
    <div
      className="editPicTable"
      style={{
        display: 'inlineBlock', margin: 'auto', textAlign: 'center', paddingTop: '10px', height: '60vh',
      }}
    >
      <span>Select Which Picture to Edit</span>
      <Button
        sx={{ marginLeft: '10px' }}
        size="small"
        variant="outlined"
        className="cancelEditPicButton"
        onClick={() => setShowTable(false)}
      >
        Cancel
      </Button>
      <DataGrid
        className="rowParams"
        onRowClick={(rowParams) => {
          setEditPic(rowParams.row);
        }}
        rows={pics || []}
        columns={columns}
      />
      <EditPicDialog editPic={editPic} setEditPic={setEditPic} setShowTable={setShowTable} />
    </div>
  );
}
