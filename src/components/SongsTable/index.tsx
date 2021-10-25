import React from 'react';
import MUIDataTable from 'mui-datatables';
import type { Dispatch, AnyAction } from 'redux';
import { ISong, SongsContext } from '../../providers/Songs.provider';
import songsTableUtils from './songsTableUtils';
import { EditorContext } from '../../providers/Editor.provider';

type Props = {
  sData?:ISong[], token:string, dispatch: Dispatch<AnyAction>
};
const SongsTable:React.FC<Props> = ({ sData, token }): JSX.Element => {
  const { test, songs } = React.useContext(SongsContext);
  const { editor, setNewEditor } = React.useContext(EditorContext);
  let tableData = sData !== undefined ? sData : songs;
  tableData = tableData.length > 0 ? songsTableUtils.addButtons(tableData, token, setNewEditor, editor) : [];
  // eslint-disable-next-line no-console
  // console.log(test);
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
