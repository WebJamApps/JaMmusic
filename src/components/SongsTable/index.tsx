
import { useContext, FC } from 'react';
import MUIDataTable from 'mui-datatables';
import type { Dispatch, AnyAction } from 'redux';
import { ISong, SongsContext } from '../../providers/Songs.provider';
import songsTableUtils from './songsTableUtils';
import { EditorContext } from '../../providers/Editor.provider';

type SongsTableProps = { sData?:ISong[], token:string, dispatch: Dispatch<AnyAction> };
const SongsTable:FC<SongsTableProps> = ({ sData, token }): JSX.Element => {
  const { songs } = useContext(SongsContext);
  const { editor, setEditor } = useContext(EditorContext);
  let tableData = sData !== undefined ? sData : songs;
  tableData = tableData.length > 0 ? songsTableUtils.addButtons(tableData, token, setEditor, editor) : [];
  return (
    <div style={{ padding: '10px', marginBottom: '-20px' }}>
      {tableData.length > 0 ? (
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
          columns={['modify', 'title', 'url', 'artist', 'category', 'album', 'image', 'composer', 'year']}
          data={tableData}
          title=""
        />
      ) : null }
    </div>
  );
};
export default SongsTable;
