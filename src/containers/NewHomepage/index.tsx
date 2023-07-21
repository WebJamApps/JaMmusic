import commonUtils from 'src/lib/utils';
import { useEffect } from 'react';
// import { Box } from '@mui/material';
import AboutUs from './About';
import CurrentProjects from './CurrentProjects';

// function Item(props: { [x: string]: any; sx: any; }) {
//   const { sx, ...other } = props;
//   return (
//     <Box
//       sx={{
//         width: '100%',
//         height: '100%',
//         p: 1,
//         borderRadius: 2,
//         textAlign: 'center',
//         fontSize: '10pt',
//         fontWeight: '400',
//         overflowX: 'scroll',
//         ...sx,
//       }}
//       {...other}
//     />
//   );
// }

export function About() {
  return (
    <div className="page-content wideHome">
      <div className="anchor"> </div>
      <AboutUs />
      <hr />
      <CurrentProjects />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      {/* <FacebookFeed />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <Inquiry />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p> */}
    </div>
  );
}

export function NewHomepage(): JSX.Element {
  useEffect(() => commonUtils.setTitleAndScroll('', window.screen.width), []);
  return (
    <div>
      <About />
    </div>
  );
}
