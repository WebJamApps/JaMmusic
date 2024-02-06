import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import AppersonAutomotive from './AppersonAutomotive';
import CollegeLutheran from './CollegeLutheran';
import FacebookFeed from './FacebookFeed';
import { Inquiry } from './Inquiry';

export function Item(props: { [x: string]: any; sx?: any; }) {
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

function CurrentProjects(): JSX.Element {
  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ marginTop: 0, paddingTop: 0, textAlign: 'center' }}>Our Current Projects</h3>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container columnSpacing={1}>
          <>
            <Grid xs={12} sm={6} md={6} lg={3.25} xl={2.75}>
              <Item><CollegeLutheran /></Item>
            </Grid>
            <Grid xs={12} sm={6} md={6} lg={3.25} xl={2.75}>
              <Item><AppersonAutomotive /></Item>
            </Grid>
            <Grid xs={12} sm={8} md={6.5} lg={5.5} xl={3.75}>
              <Item><FacebookFeed /></Item>
            </Grid>
            <Grid xs={12} sm={4} md={5.5} lg={12} xl={2.75}>
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

