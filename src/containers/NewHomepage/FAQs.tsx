/* eslint-disable react/jsx-one-expression-per-line */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

function Faqs(): JSX.Element {
  return (
    <div className="faqs">
      <h3 style={{ textDecoration: 'underline', textAlign: 'center' }}>FAQs</h3>
      <div className="qAnda">
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography style={{ fontWeight: 'bold', fontFamily: '"Habibi", sans-serif' }}>
              How can I contact you?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Send an email to Josh and Maria Sherman&nbsp;
              <a href="mailto:web.jam.adm@gmail.com">
                <strong>web.jam.adm@gmail.com</strong>
              </a> or call <a href="tel:5404948035"><strong>540-494-8035</strong></a>.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography style={{ fontWeight: 'bold', fontFamily: '"Habibi", sans-serif' }}>
              What does Web Jam LLC do?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>We provide mobile-friendly web technologies and services.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography style={{ fontWeight: 'bold', fontFamily: '"Habibi", sans-serif' }}>
              What is your mission statement?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              To assist small businesses by refactoring their existing
              websites to be mobile-friendly,
              providing new online services, empowering business owners, and training staff to use these new services
              effectively.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default Faqs;

