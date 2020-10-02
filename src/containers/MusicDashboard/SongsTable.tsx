import React from 'react';
import MUIDataTable from 'mui-datatables';
import { SongsContext } from '../../providers/Songs.provider';

const SongsTable = (): JSX.Element => {
  const { test, songs } = React.useContext(SongsContext);
  // eslint-disable-next-line no-console
  console.log(test);
  return (
    <div style={{ padding: '10px', marginBottom: '-20px' }}>
      {songs.length > 0 ? (
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
          data={songs}
          title=""
        />
      ) : null }
    </div>
  );
};
export default SongsTable;
