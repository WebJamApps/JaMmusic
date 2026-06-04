import React from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import AppersonAutomotive from './AppersonAutomotive';
import CollegeLutheran from './CollegeLutheran';
import { Inquiry } from './Inquiry';

export function Item(props: BoxProps): React.JSX.Element {
  const { sx, ...other } = props;
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 1,
        borderRadius: 2,
        textAlign: 'center',
        fontSize: '10pt',
        fontWeight: '400',
        flexWrap: 'wrap',
        justifyContent: 'center',
        ...sx,
      }}
      {...other}
    />
  );
}

function CurrentProjects(): React.JSX.Element {
  return (
    <div style={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container columnSpacing={1} sx={{ justifyContent: 'center' }}>
          <>
            <Grid size={{ xs: 12, md: 7, lg: 6, xl: 6 }}>
              <h3 style={{ marginTop: 0, paddingTop: 0, textAlign: 'center' }}>Our Current Projects</h3>
              <Grid container columnSpacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Item><CollegeLutheran /></Item>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Item><AppersonAutomotive /></Item>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 5, lg: 4, xl: 4 }}>
              <Item><Inquiry /></Item>
            </Grid>

          </>
        </Grid>
      </Box>
      <p className="spacer">&nbsp;</p>
    </div>
  );
}

export default CurrentProjects;
