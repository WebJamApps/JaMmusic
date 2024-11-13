import { Box, Grid } from '@mui/material';
import { ReactNode } from 'react';
import Faqs from './FAQs';
import { Item } from './CurrentProjects';

function WJLogo(): JSX.Element {
  return (
    <div className="col-md-6 slideshow" style={{ width: '100%', height: '100%' }}>
      <div id="slideshow1">
        <img
          style={{
            marginTop: '15px',
            maxHeight: '450px',
            boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
          }}
          alt="Web Jam Banner Large"
          src="../static/imgs/banner1.jpg"
        />
      </div>
    </div>
  );
}

function HomepageIntro(): JSX.Element {
  const col6Style = {
    msFlex: '0 0 50%',
    flex: '0 0 50%',
    maxWidth: '100%',
    top: '0',
    paddingRight: '6px',
    paddingLeft: '10px',
  };
  return (
    <div className="col-md-6" style={col6Style}>
      <p
        translate="no"
        lang="en"
        style={{
          marginTop: '12px', marginBottom: '40px', fontSize: '12pt', textAlign: 'left',
        }}
      >
        Web Jam LLC helps businesses bring their web technologies into the 21st century! Let us
        help make your website mobile-friendly and grow your business by utilizing the power of online services.
        More information is available in our&nbsp;
        <a
          href="https://www.dropbox.com/s/bzdqp3hr682y9sw/WebJamLLC_FactSheet.pdf?dl=0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fact Sheet
        </a>
        .
      </p>
      <Faqs />
    </div>
  );
}

interface GridItemProps {
  children: ReactNode;
  order: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

function AboutUs(): JSX.Element {
  // eslint-disable-next-line react/prop-types
  const GridItem: React.FC<GridItemProps> = ({ children, order }) => (
    <Grid
      xs={12}
      sm={12}
      md={12}
      lg={6}
      xl={6}
      order={order}
    >
      <Item>{children}</Item>
    </Grid>
  );
  return (
    <div>
      <div
        className="container-fluid"
        style={{
          maxWidth: '100%', paddingLeft: '15px', paddingRight: '15px', marginLeft: 'auto', marginRight: 'auto',
        }}
      >
        <div
          className="row"
          style={{
            marginLeft: '-15px', marginRight: '-15px', display: 'flex', flexWrap: 'wrap',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Grid container columnSpacing={1}>
              <>
                <GridItem order={{
                  xs: 2, sm: 2, md: 2, lg: 1, xl: 1,
                }}
                >
                  <HomepageIntro />
                </GridItem>
                <GridItem order={{
                  xs: 1, sm: 1, md: 1, lg: 2, xl: 2,
                }}
                >
                  <WJLogo />
                </GridItem>
              </>
            </Grid>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;

