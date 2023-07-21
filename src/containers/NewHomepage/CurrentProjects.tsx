import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import AppersonAutomotive from './AppersonAutomotive';
import CollegeLutheran from './CollegeLutheran';
import FacebookFeed from './FacebookFeed';
import { Inquiry } from './Inquiry';

function Item(props: { [x: string]: any; sx?: any; }) {
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

// function CurrentProjects(): JSX.Element {
//   return (
//     <div className="widescreenHomepage" style={{ maxWidth: '17in', margin: 'auto' }}>
//       <div className="material-content">
//         <div className="container">
//           <h3 style={{ marginTop: 0, paddingTop: 0 }}>Our Current Projects</h3>
//           <p className="spacer">&nbsp;</p>
//           <div className="row-current-projects">
//             <div className="current-projects">
//               <CollegeLutheran />
//             </div>
//             <div className="current-projects">
//               <AppersonAutomotive />
//             </div>
//             <div className="current-projects">
//               <FacebookFeed />
//             </div>
//             <div className="current-projects" style={{ margin: 'auto', marginTop: 0 }}><Inquiry /></div>
//           </div>
//           <p className="spacer">&nbsp;</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function CurrentProjects(): JSX.Element {
//   return (
//     <div>
//       <h3 style={{ marginTop: 0, paddingTop: 0, textAlign: 'center' }}>Our Current Projects</h3>
//       <Box
//         sx={{
//           display: 'grid',
//           gridAutoRows: '500px',
//           height: 'max-content',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
//           // gridTemplateColumns: 'repeat(4, 260)',
//           gridAutoFlow: 'row',
//           maxWidth: '1400px',
//           margin: 'auto',
//           gridRow: '1 / 2',
//         }}
//       >
//         <Item sx={{ gridRow: '25%', gridColumn: 'span 1' }}>
//           <CollegeLutheran />
//         </Item>
//         <Item sx={{ gridRow: '25%', gridColumn: 'span 2' }}><AppersonAutomotive /></Item>
//         <Item sx={{ gridRow: '25%', gridColumn: 'span 3' }}><FacebookFeed /></Item>
//         <Item sx={{ gridRow: '25%', gridColumn: '4' }}><Inquiry /></Item>
//       </Box>
//       <p className="spacer">&nbsp;</p>
//     </div>
//   );
// }

function CurrentProjects(): JSX.Element {
  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ marginTop: 0, paddingTop: 0, textAlign: 'center' }}>Our Current Projects</h3>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container columnSpacing={1}>
          <>
            <Grid className="i1" xs={12} sm={12} md={6} lg={6}>
              <Item><CollegeLutheran /></Item>
            </Grid>
            <Grid className="i2" xs={12} sm={12} md={6} lg={6}>
              <Item><AppersonAutomotive /></Item>
            </Grid>
            <Grid className="i3" xs={12} sm={12} md={6} lg={6}>
              <Item><FacebookFeed /></Item>
            </Grid>
            <Grid className="i4" xs={12} sm={12} md={6} lg={6}>
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

