import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Box, Typography, CircularProgress, Alert,
} from '@mui/material';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { AuthContext } from 'src/providers/Auth.provider';
import { ThemeContext } from 'src/providers/Theme.provider';
import adminApiUtils from './admin-api.utils';

export function AdminApi(): React.JSX.Element {
  const { auth } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const allowed = adminApiUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.includes(auth.user.userType);

  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSpec = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminApiUtils.fetchOpenApi(auth.token);
      setSpec(data);
    } catch (e) {
      const err = e as { response?: { body?: { message?: string } }; message?: string };
      setError(err.response?.body?.message || err.message || 'Failed to load API specification');
    } finally {
      setLoading(false);
    }
  }, [auth.token, isAuthorized]);

  useEffect(() => {
    void fetchSpec();
  }, [fetchSpec]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
    return () => {
      document.documentElement.classList.remove('dark-mode');
    };
  }, [theme]);

  if (!isAuthorized) {
    return (
      <Box sx={{ padding: 3 }} data-testid="admin-api-unauthorized">
        <Typography variant="h6">Not authorized</Typography>
        <Typography variant="body2">You must be signed in as an admin to view this page.</Typography>
      </Box>
    );
  }

  const outerClass = theme === 'dark' ? 'dark-mode' : '';

  return (
    <div className={outerClass} data-testid="admin-api-page">
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }} data-testid="admin-api-loading">
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box sx={{ p: 2 }} data-testid="admin-api-error">
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {spec && !loading && (
        <SwaggerUI
          spec={spec}
          supportedSubmitMethods={[]}
          validatorUrl={null}
          showExtensions={true}
        />
      )}
    </div>
  );
}

export default AdminApi;
