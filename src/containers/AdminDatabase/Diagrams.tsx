import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper,
} from '@mui/material';
import adminDatabaseUtils from './admin-database.utils';

export interface MermaidApi {
  render: (id: string, text: string) => Promise<{ svg: string }>;
}

export async function defaultLoadMermaid(): Promise<MermaidApi> {
  const m = await import('mermaid');
  const mermaid = m.default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default',
  });
  return mermaid;
}

export interface DiagramsProps {
  token?: string;
  loadMermaid?: () => Promise<MermaidApi>;
}

export function Diagrams({ token, loadMermaid = defaultLoadMermaid }: DiagramsProps) {
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbSvg, setDbSvg] = useState<string | null>(null);

  const [systemLoading, setSystemLoading] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [systemSvg, setSystemSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const fetchDbDiagram = async () => {
      setDbLoading(true);
      setDbError(null);
      setDbSvg(null);
      try {
        const text = await adminDatabaseUtils.getDatabaseDiagram(token);
        if (!isMounted) return;
        const mermaid = await loadMermaid();
        if (!isMounted) return;
        const renderId = `db-diagram-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(renderId, text);
        if (!isMounted) return;
        setDbSvg(svg);
      } catch (e) {
        if (!isMounted) return;
        const err = e as { message?: string };
        setDbError(err.message || 'Failed to load database diagram');
      } finally {
        if (isMounted) {
          setDbLoading(false);
        }
      }
    };

    const fetchSystemDiagram = async () => {
      setSystemLoading(true);
      setSystemError(null);
      setSystemSvg(null);
      try {
        const text = await adminDatabaseUtils.getSystemDiagram(token);
        if (!isMounted) return;
        const mermaid = await loadMermaid();
        if (!isMounted) return;
        const renderId = `system-map-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(renderId, text);
        if (!isMounted) return;
        setSystemSvg(svg);
      } catch (e) {
        if (!isMounted) return;
        const err = e as { message?: string };
        setSystemError(err.message || 'Failed to load system map');
      } finally {
        if (isMounted) {
          setSystemLoading(false);
        }
      }
    };

    void fetchDbDiagram();
    void fetchSystemDiagram();

    return () => {
      isMounted = false;
    };
  }, [token, loadMermaid]);

  return (
    <Box sx={{ marginTop: 4 }} data-testid="admin-database-diagrams">
      <Typography variant="h5" sx={{ marginBottom: 2 }}>Diagrams</Typography>

      <Paper
        data-testid="database-diagram-container"
        sx={{
          padding: 3,
          marginBottom: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>Database Diagram</Typography>
        {dbLoading && (
          <Box data-testid="database-diagram-loading" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={24} />
            <Typography variant="body2">Loading database diagram...</Typography>
          </Box>
        )}
        {dbError && (
          <Alert severity="error" data-testid="database-diagram-error">
            {dbError}
          </Alert>
        )}
        {!dbLoading && !dbError && dbSvg && (
          <Box
            data-testid="database-diagram-svg"
            sx={{ overflowX: 'auto', textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: dbSvg }}
          />
        )}
      </Paper>

      <Paper
        data-testid="system-map-container"
        sx={{
          padding: 3,
          marginBottom: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>System Map</Typography>
        {systemLoading && (
          <Box data-testid="system-map-loading" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={24} />
            <Typography variant="body2">Loading system map...</Typography>
          </Box>
        )}
        {systemError && (
          <Alert severity="error" data-testid="system-map-error">
            {systemError}
          </Alert>
        )}
        {!systemLoading && !systemError && systemSvg && (
          <Box
            data-testid="system-map-svg"
            sx={{ overflowX: 'auto', textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: systemSvg }}
          />
        )}
      </Paper>
    </Box>
  );
}

export default Diagrams;
