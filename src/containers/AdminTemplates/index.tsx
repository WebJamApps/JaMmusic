import {
  useCallback, useContext, useEffect, useState, useRef,
} from 'react';
import {
  Box, Typography, TextField, Button, Grid, Card, CardContent,
  Tabs, Tab, FormControlLabel, Switch, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, Divider, IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { AuthContext } from 'src/providers/Auth.provider';
import adminTemplatesUtils, { type Itemplate, exportToCSV, parseCSV } from './admin-templates.utils';

const TYPES = ['Originals', 'PubFestivalBrewery', 'MidRangeCafeBar', 'OnlineForm'] as const;
const STAGES = ['cold', 'returning'] as const;

const TOKENS = [
  '[Contact Name]',
  '[Venue Name]',
  '[Booking Period]',
  '[Target Dates]',
];

export function AdminTemplates() {
  const { auth } = useContext(AuthContext);
  const allowed = adminTemplatesUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.indexOf(auth.user.userType) !== -1;

  const [templates, setTemplates] = useState<Itemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Editor states
  const [selectedType, setSelectedType] = useState<Itemplate['type']>('Originals');
  const [selectedStage, setSelectedStage] = useState<Itemplate['stage']>('cold');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [active, setActive] = useState(true);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Import Dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Partial<Itemplate>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Find active template being edited
  const currentTemplate = templates.find((t) => t.type === selectedType && t.stage === selectedStage);

  const refresh = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminTemplatesUtils.listTemplates(auth.token);
      setTemplates(data);
    } catch (e) {
      setError((e as Error).message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [auth.token, isAuthorized]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Load selected template into editor states
  useEffect(() => {
    if (currentTemplate) {
      setSubject(currentTemplate.subject || '');
      setBodyHtml(currentTemplate.bodyHtml || '');
      setActive(currentTemplate.active !== false);
      setPhotoData(null);
      setPhotoPreview(null);
      setIsDirty(false);

      if (currentTemplate.footerPhotoRef) {
        setPhotoPreview(null); // Clear first
        adminTemplatesUtils.getTemplateAssetUrl(auth.token, currentTemplate.footerPhotoRef)
          .then((url) => {
            setPhotoPreview(url);
          })
          .catch(() => {
            // Asset could be missing or failed to fetch, silence
          });
      }
    } else {
      // Empty state
      setSubject('');
      setBodyHtml('');
      setActive(true);
      setPhotoData(null);
      setPhotoPreview(null);
      setIsDirty(false);
    }
  }, [currentTemplate, selectedType, selectedStage, auth.token]);

  if (!isAuthorized) {
    return (
      <Box sx={{ padding: 3 }} data-testid="admin-templates-unauthorized">
        <Typography variant="h6">Not authorized</Typography>
        <Typography variant="body2">You must be signed in as an admin to view this page.</Typography>
      </Box>
    );
  }

  const handleInsertToken = (token: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBodyHtml((prev) => prev + token);
      setIsDirty(true);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = bodyHtml.substring(0, start);
    const after = bodyHtml.substring(end, bodyHtml.length);
    setBodyHtml(before + token + after);
    setIsDirty(true);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
    }, 0);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoData(base64);
      setPhotoPreview(base64);
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoData(''); // Setting empty to let backend know to clear
    setPhotoPreview(null);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (currentTemplate) {
      setSubject(currentTemplate.subject || '');
      setBodyHtml(currentTemplate.bodyHtml || '');
      setActive(currentTemplate.active !== false);
      setPhotoData(null);
      setPhotoPreview(null);
      setIsDirty(false);

      if (currentTemplate.footerPhotoRef) {
        adminTemplatesUtils.getTemplateAssetUrl(auth.token, currentTemplate.footerPhotoRef)
          .then((url) => {
            setPhotoPreview(url);
          })
          .catch(() => {});
      }
    } else {
      setSubject('');
      setBodyHtml('');
      setActive(true);
      setPhotoData(null);
      setPhotoPreview(null);
      setIsDirty(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError('');
    try {
      const payload: Partial<Itemplate> & { photoData?: string } = {
        type: selectedType,
        stage: selectedStage,
        subject,
        bodyHtml,
        active,
      };
      if (photoData !== null) {
        payload.photoData = photoData;
      }

      if (currentTemplate?._id) {
        await adminTemplatesUtils.updateTemplate(auth.token, currentTemplate._id, payload);
      } else {
        await adminTemplatesUtils.createTemplate(auth.token, payload);
      }
      setIsDirty(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message || 'Failed to save template');
    } finally {
      setSaveLoading(false);
    }
  };

  // Export functions
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pitch_templates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(templates);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pitch_templates.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import parsing
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportStatus('');
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content) as unknown;
          if (Array.isArray(parsed)) {
            setImportPreview(parsed as Partial<Itemplate>[]);
          } else if (parsed && typeof parsed === 'object') {
            setImportPreview([parsed as Partial<Itemplate>]);
          } else {
            setImportStatus('Invalid JSON structure: expected array or object');
          }
        } else {
          // Parse CSV
          const parsed = parseCSV(content);
          const mapped: Partial<Itemplate>[] = parsed.map((row) => ({
            type: row.type as Itemplate['type'],
            stage: (row.stage || 'cold') as Itemplate['stage'],
            subject: row.subject || '',
            bodyHtml: row.bodyHtml || '',
            footerPhotoRef: row.footerPhotoRef || '',
            active: row.active !== 'false',
          }));
          setImportPreview(mapped);
        }
      } catch (err) {
        setImportStatus(`Failed to parse file: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    setImportStatus('');
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < importPreview.length; i++) {
      const item = importPreview[i];
      setImportStatus(`Importing ${i + 1}/${importPreview.length}...`);
      try {
        if (!item.type || TYPES.indexOf(item.type as 'Originals') === -1) {
          throw new Error(`Invalid type: ${item.type || 'missing'}`);
        }
        const stage = (item.stage || 'cold') as Itemplate['stage'];
        if (STAGES.indexOf(stage) === -1) {
          throw new Error(`Invalid stage: ${stage}`);
        }

        const payload: Partial<Itemplate> = {
          type: item.type,
          stage,
          subject: item.subject || '',
          bodyHtml: item.bodyHtml || '',
          active: item.active !== false,
          footerPhotoRef: item.footerPhotoRef || undefined,
        };

        // Check if duplicate already exists in loaded templates list
        const existing = templates.find((t) => t.type === item.type && t.stage === stage);
        if (existing?._id) {
          await adminTemplatesUtils.updateTemplate(auth.token, existing._id, payload);
        } else {
          await adminTemplatesUtils.createTemplate(auth.token, payload);
        }
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Import failed for item:`, item, err);
      }
    }

    setImportStatus(`Import complete. Success: ${successCount}, Failures: ${failCount}`);
    setImporting(false);
    setImportPreview([]);
    setImportFile(null);
    await refresh();
  };

  return (
    <Box
      sx={{
        padding: 3, maxWidth: 1200, margin: 'auto', width: '100%', minWidth: 0,
      }}
      data-testid="admin-templates-page"
    >
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, flexWrap: 'wrap', gap: 2,
      }}>
        <Typography variant="h5">Admin Pitch Templates</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportJSON}
            data-testid="export-json-btn"
          >
            Export JSON
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            data-testid="export-csv-btn"
          >
            Export CSV
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<FileUploadIcon />}
            onClick={() => {
              setImportFile(null);
              setImportPreview([]);
              setImportStatus('');
              setImportOpen(true);
            }}
            data-testid="import-btn"
          >
            Import
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ marginBottom: 2 }} data-testid="admin-templates-error">{error}</Alert>}
      {loading && <CircularProgress data-testid="admin-templates-loading" sx={{ display: 'block', margin: '20px auto' }} />}

      {!loading && (
        <Grid container spacing={3}>
          {/* Sidebar selector */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ padding: 3 }}>
                <Typography variant="subtitle2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  1. RELATIONSHIP STAGE
                </Typography>
                <Tabs
                  value={selectedStage}
                  onChange={(_, val: Itemplate['stage']) => setSelectedStage(val)}
                  variant="fullWidth"
                  sx={{ marginBottom: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Cold" value="cold" data-testid="templates-tab-stage-cold" />
                  <Tab label="Returning" value="returning" data-testid="templates-tab-stage-returning" />
                </Tabs>

                <Typography variant="subtitle2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  2. TEMPLATE TYPE
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {TYPES.map((type) => {
                    const hasTemplate = templates.some((t) => t.type === type && t.stage === selectedStage);
                    const isSelected = selectedType === type;
                    return (
                      <Button
                        key={type}
                        variant={isSelected ? 'contained' : 'outlined'}
                        color={isSelected ? 'primary' : 'inherit'}
                        onClick={() => setSelectedType(type)}
                        data-testid={`template-type-${type}`}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          padding: '10px 15px',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                          {type === 'Originals' && 'Originals Listening Room'}
                          {type === 'PubFestivalBrewery' && 'Pub / Festival / Brewery'}
                          {type === 'MidRangeCafeBar' && 'Mid-Range Cafe & Bar'}
                          {type === 'OnlineForm' && 'Online Form / Info Block'}
                        </Typography>
                        {hasTemplate ? (
                          <Chip label="Configured" size="small" color={isSelected ? 'secondary' : 'default'} />
                        ) : (
                          <Chip label="Not Configured" size="small" variant="outlined" color="warning" />
                        )}
                      </Button>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Editor */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ padding: 3 }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1,
                }}>
                  <Typography variant="h6">
                    {selectedType === 'Originals' && 'Originals Listening Room'}
                    {selectedType === 'PubFestivalBrewery' && 'Pub / Festival / Brewery'}
                    {selectedType === 'MidRangeCafeBar' && 'Mid-Range Cafe & Bar'}
                    {selectedType === 'OnlineForm' && 'Online Form / Info Block'}
                    {' '}
                    <Chip label={selectedStage.toUpperCase()} size="small" color="primary" sx={{ ml: 1 }} />
                  </Typography>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={active}
                        onChange={(e) => {
                          setActive(e.target.checked);
                          setIsDirty(true);
                        }}
                        data-testid="template-active-toggle"
                      />
                    )}
                    label="Active"
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Subject Line"
                    fullWidth
                    size="small"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setIsDirty(true);
                    }}
                    slotProps={{ htmlInput: { 'data-testid': 'template-subject-input' } }}
                    placeholder="e.g. Booking inquiry - JaM"
                  />

                  <Box>
                    <Box sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1,
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Body HTML Content
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {TOKENS.map((token) => (
                          <Chip
                            key={token}
                            label={token}
                            size="small"
                            onClick={() => handleInsertToken(token)}
                            data-testid={`token-chip-${token}`}
                            color="secondary"
                            variant="outlined"
                            sx={{ cursor: 'pointer', fontFamily: 'monospace' }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <TextField
                      multiline
                      rows={12}
                      fullWidth
                      value={bodyHtml}
                      onChange={(e) => {
                        setBodyHtml(e.target.value);
                        setIsDirty(true);
                      }}
                      inputRef={textareaRef}
                      slotProps={{ htmlInput: { 'data-testid': 'template-body-textarea', style: { fontFamily: 'monospace' } } }}
                      placeholder="Enter HTML or text pitch template content..."
                    />
                  </Box>

                  {/* Photo upload section */}
                  <Paper variant="outlined" sx={{ padding: 2, background: 'background.default' }}>
                    <Typography variant="subtitle2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                      Footer Photo
                    </Typography>
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        {photoPreview ? (
                          <Box sx={{ position: 'relative', width: '100%', height: 120 }}>
                            <img
                              src={photoPreview}
                              alt="Footer Preview"
                              style={{
                                width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4,
                              }}
                              data-testid="template-photo-preview"
                            />
                            <IconButton
                              size="small"
                              onClick={handleRemovePhoto}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                '&:hover': { background: 'rgba(0,0,0,0.8)' },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box sx={{
                            width: '100%',
                            height: 120,
                            border: '1px dashed',
                            borderColor: 'text.secondary',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.03)',
                          }}>
                            <Typography variant="caption" color="text.secondary">No photo uploaded</Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1.5 }}>
                          Upload a template-specific image (JPG/PNG). It will be embedded inline as CID during mailing.
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                          startIcon={<CloudUploadIcon />}
                        >
                          Choose Photo File
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handlePhotoChange}
                            data-testid="template-photo-input"
                            aria-label="Upload template photo"
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Actions row */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    pt: 2,
                    marginTop: 1,
                  }}>
                    {currentTemplate && (
                      <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, alignSelf: 'center' }}>
                        Last updated: {currentTemplate.updated_at ? new Date(currentTemplate.updated_at).toLocaleString() : 'N/A'}
                        {currentTemplate.lastModifiedBy ? ` by ${currentTemplate.lastModifiedBy}` : ''}
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<UndoIcon />}
                      onClick={handleReset}
                      disabled={!isDirty}
                      size="small"
                    >
                      Revert
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saveLoading || (!isDirty && currentTemplate !== undefined)}
                      size="small"
                      data-testid="template-save-btn"
                    >
                      {saveLoading ? 'Saving...' : 'Save Template'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Bulk Import Dialog */}
      <Dialog
        open={importOpen}
        onClose={() => !importing && setImportOpen(false)}
        maxWidth="md"
        fullWidth
        data-testid="import-dialog"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Bulk Import Templates (JSON / CSV)
          <IconButton onClick={() => setImportOpen(false)} disabled={importing}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingY: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Select a JSON or CSV file exported from JaMmusic or other template managers.
              {' '}
              Uploading will automatically match against existing configurations and upsert them (Type + Stage).
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={importing}
              sx={{ width: 'fit-content' }}
            >
              Choose JSON or CSV File
              <input
                type="file"
                accept=".json,.csv"
                hidden
                onChange={handleImportFileChange}
                data-testid="import-file-input"
                aria-label="Upload import file"
              />
            </Button>

            {importFile && (
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Selected file: {importFile.name} ({Math.round(importFile.size / 102.4) / 10} KB)
              </Typography>
            )}

            {importStatus && (
              <Alert severity={importStatus.includes('Success') ? 'success' : 'info'}>
                {importStatus}
              </Alert>
            )}

            {importPreview.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  Parsed templates to import ({importPreview.length}):
                </Typography>
                <Table size="small" component={Paper} variant="outlined">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.slice(0, 5).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.stage || 'cold'}</TableCell>
                        <TableCell>{item.subject || '—'}</TableCell>
                        <TableCell>{item.active !== false ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                    {importPreview.length > 5 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="caption" color="text.secondary">
                            and {importPreview.length - 5} more items...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)} disabled={importing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmImport}
            disabled={importing || importPreview.length === 0}
            data-testid="confirm-import-btn"
          >
            {importing ? 'Importing...' : 'Confirm Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
