import React from 'react';
import MUIDataTable from 'mui-datatables';
import { ISong, SongsContext } from '../../providers/Songs.provider';

type Props = {
  sData?:ISong[]
};
const SongsTable:React.FC<Props> = ({ sData }): JSX.Element => {
  const { test, songs } = React.useContext(SongsContext);
  const tableData = sData !== undefined ? sData : songs;
  // eslint-disable-next-line no-console
  console.log(test);
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
          columns={['title', 'url', 'artist', 'category', 'album', 'image', 'composer', 'year']}
          data={tableData}
          title=""
        />
      ) : null }
    </div>
  );
};
export default SongsTable;
