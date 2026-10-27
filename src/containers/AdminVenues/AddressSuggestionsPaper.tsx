import { Box, Paper, type PaperProps } from '@mui/material';
import logo from 'src/assets/google-maps-attribution.svg';

// Official, unmodified asset: https://developers.google.com/maps/documentation/places/web-service/policies
// Keep attribution inside the popup so it remains visible alongside the suggestions.
export function AddressSuggestionsPaper({ children, ...props }: PaperProps) {
  return (
    <Paper {...props}>
      {children}
      <Box sx={{ backgroundColor: '#fff', padding: '10px 10px 5px' }}>
        <img src={logo} alt="Google Maps" height={16} style={{ display: 'block', width: 'auto' }} />
      </Box>
    </Paper>
  );
}
