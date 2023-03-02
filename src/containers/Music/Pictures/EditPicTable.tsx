import { Button } from '@mui/material';

interface IeditPicTableProps {
  setShowTable:(arg0:boolean)=>void
}
export function EditPicTable(props:IeditPicTableProps) {
  const { setShowTable } = props;
  return (
    <div
      className="editPicTable"
      style={{
        display: 'inlineBlock', margin: 'auto', textAlign: 'center', paddingTop: '10px',
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
    </div>
  );
}
