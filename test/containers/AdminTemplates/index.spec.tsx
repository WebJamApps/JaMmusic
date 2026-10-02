import '@testing-library/jest-dom';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { AdminTemplates } from 'src/containers/AdminTemplates';
import adminTemplatesUtils, { type Itemplate } from 'src/containers/AdminTemplates/admin-templates.utils';

const adminAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'tk',
  user: { userType: 'JaM-admin', email: 'a@b.com' },
};

const mockTemplates: Itemplate[] = [
  {
    _id: 'temp-1',
    type: 'Originals',
    stage: 'cold',
    subject: 'Cold Originals Subject',
    introHtml: '<p>Hi [Contact Name],</p>',
    bodyHtml: 'Cold Originals Body',
    footerPhotoRef: 'photo-ref-1',
    active: true,
    updated_at: '2026-06-27T12:00:00Z',
    lastModifiedBy: 'admin',
  },
  {
    _id: 'temp-2',
    type: 'PubFestivalBrewery',
    stage: 'returning',
    subject: 'Warm Pub Subject',
    bodyHtml: 'Warm Pub Body [Contact Name]',
    active: false,
    updated_at: '2026-06-27T13:00:00Z',
  },
  {
    _id: 'temp-3',
    type: 'Originals',
    stage: 'upcoming',
    subject: 'Upcoming Originals Subject',
    introHtml: 'Looking forward to [Next Gig Date]',
    bodyHtml: 'Upcoming Originals Body',
  },
];

const wrap = (auth: Iauth) => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <AdminTemplates />
  </AuthContext.Provider>
);

const importFile = async (content: string, format: 'json' | 'csv') => {
  fireEvent.click(screen.getByTestId('import-btn'));
  const file = new File([content], `templates.${format}`, { type: format === 'json' ? 'application/json' : 'text/csv' });
  fireEvent.change(screen.getByTestId('import-file-input'), { target: { files: [file] } });
  await waitFor(() => expect(screen.getByTestId('confirm-import-btn')).toBeEnabled());
  fireEvent.click(screen.getByTestId('confirm-import-btn'));
  await screen.findByText(/Import complete/);
};

describe('AdminTemplates page container', () => {
  beforeEach(() => {
    vi.spyOn(adminTemplatesUtils, 'listTemplates').mockResolvedValue(mockTemplates);
    vi.spyOn(adminTemplatesUtils, 'getAllowedAdminRoles').mockReturnValue(['JaM-admin', 'Developer']);
    vi.spyOn(adminTemplatesUtils, 'getTemplateAssetUrl').mockResolvedValue('blob:mock-asset-url');
    vi.spyOn(adminTemplatesUtils, 'createTemplate').mockResolvedValue(mockTemplates[0]);
    vi.spyOn(adminTemplatesUtils, 'updateTemplate').mockResolvedValue(mockTemplates[0]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders not-authorized when user is not authenticated', () => {
    render(wrap(defaultAuth));
    expect(screen.getByTestId('admin-templates-unauthorized')).toBeDefined();
  });

  it('renders authorized UI and lists templates on load', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    expect(screen.getByTestId('admin-templates-page')).toBeDefined();
    expect(adminTemplatesUtils.listTemplates).toHaveBeenCalledWith('tk');
  });

  it('allows switching stage tabs and selected types', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    // Default selection is Originals / Cold
    const subjectInput = screen.getByTestId('template-subject-input') as HTMLInputElement;
    expect(subjectInput.value).toBe('Cold Originals Subject');

    // Switch to returning stage tab
    const warmTab = screen.getByTestId('templates-tab-stage-returning');
    await act(async () => {
      fireEvent.click(warmTab);
    });

    // No returning template exists for Originals, should show empty/blank editor fields
    expect(subjectInput.value).toBe('');

    // Switch template type to PubFestivalBrewery
    const pubBtn = screen.getByTestId('template-type-PubFestivalBrewery');
    await act(async () => {
      fireEvent.click(pubBtn);
    });

    // Should load temp-2 which is PubFestivalBrewery + returning
    expect(subjectInput.value).toBe('Warm Pub Subject');
  });

  it('loads Upcoming content and shows blank fields for a type without an Upcoming template', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    fireEvent.click(screen.getByTestId('templates-tab-stage-upcoming'));
    expect(screen.getByTestId('template-subject-input')).toHaveValue('Upcoming Originals Subject');
    expect(screen.getByTestId('template-intro-textarea')).toHaveValue('Looking forward to [Next Gig Date]');
    expect(screen.getByTestId('template-body-textarea')).toHaveValue('Upcoming Originals Body');

    fireEvent.click(screen.getByTestId('template-type-MidRangeCafeBar'));
    expect(screen.getByTestId('template-subject-input')).toHaveValue('');
    expect(screen.getByTestId('template-intro-textarea')).toHaveValue('');
    expect(screen.getByTestId('template-body-textarea')).toHaveValue('');
  });

  it.each(['cold', 'returning', 'upcoming'])('loads the intro or a blank value on the %s tab', async (stage) => {
    await act(async () => { render(wrap(adminAuth)); });
    fireEvent.click(screen.getByTestId(`templates-tab-stage-${stage}`));
    const expectedIntro = mockTemplates.find(t => t.type === 'Originals' && t.stage === stage)?.introHtml || '';
    expect(screen.getByLabelText('Intro HTML Content')).toHaveValue(expectedIntro);
    if (stage === 'returning') {
      fireEvent.click(screen.getByTestId('template-type-PubFestivalBrewery'));
      expect(screen.getByTestId('template-subject-input')).toHaveValue('Warm Pub Subject');
      expect(screen.getByTestId('template-intro-textarea')).toHaveValue('');
    }
  });

  it.each(['Originals', 'MidRangeCafeBar'] as const)('saves the Upcoming stage and edited intro for %s', async (type) => {
    await act(async () => { render(wrap(adminAuth)); });
    fireEvent.click(screen.getByTestId('templates-tab-stage-upcoming'));
    fireEvent.click(screen.getByTestId(`template-type-${type}`));
    const saveButton = screen.getByTestId('template-save-btn');
    expect(screen.getByRole('button', { name: /revert/i })).toBeDisabled();
    fireEvent.change(screen.getByTestId('template-intro-textarea'), { target: { value: '<p>See you soon!</p>' } });
    expect(saveButton).toBeEnabled();
    expect(screen.getByRole('button', { name: /revert/i })).toBeEnabled();
    await act(async () => { fireEvent.click(saveButton); });
    const payload = expect.objectContaining({ type, stage: 'upcoming', introHtml: '<p>See you soon!</p>' });
    if (type === 'Originals') {
      expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledWith('tk', 'temp-3', payload);
    } else {
      expect(adminTemplatesUtils.createTemplate).toHaveBeenCalledWith('tk', payload);
    }
  });

  it('reverts intro edits and saves an empty intro when explicitly cleared', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    const intro = screen.getByTestId('template-intro-textarea');
    const revert = screen.getByRole('button', { name: /revert/i });
    fireEvent.change(intro, { target: { value: 'Temporary intro' } });
    expect(revert).toBeEnabled();
    fireEvent.click(revert);
    expect(intro).toHaveValue('<p>Hi [Contact Name],</p>');
    expect(revert).toBeDisabled();
    fireEvent.change(intro, { target: { value: '' } });
    await act(async () => { fireEvent.click(screen.getByTestId('template-save-btn')); });
    expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledWith('tk', 'temp-1', expect.objectContaining({ introHtml: '' }));
  });

  it('reverts an intro in a new template to blank', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    fireEvent.click(screen.getByTestId('template-type-OnlineForm'));
    fireEvent.change(screen.getByTestId('template-intro-textarea'), { target: { value: 'Draft intro' } });
    fireEvent.click(screen.getByRole('button', { name: /revert/i }));
    expect(screen.getByTestId('template-intro-textarea')).toHaveValue('');
    expect(screen.getByRole('button', { name: /revert/i })).toBeDisabled();
  });

  it('inserts Next Gig Date into the body by default even after focusing the subject', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    fireEvent.focus(screen.getByTestId('template-subject-input'));
    fireEvent.click(screen.getByTestId('token-chip-[Next Gig Date]'));
    expect(screen.getByTestId('template-body-textarea')).toHaveValue('Cold Originals Body[Next Gig Date]');
    expect(screen.getByTestId('template-intro-textarea')).toHaveValue('<p>Hi [Contact Name],</p>');
    expect(screen.getByTestId('template-subject-input')).toHaveValue('Cold Originals Subject');
  });

  it('inserts chips at the last-focused intro or body selection and restores its cursor', async () => {
    await act(async () => { render(wrap(adminAuth)); });
    const intro = screen.getByTestId('template-intro-textarea') as HTMLTextAreaElement;
    const body = screen.getByTestId('template-body-textarea') as HTMLTextAreaElement;
    fireEvent.focus(intro);
    intro.setSelectionRange(3, 5);
    fireEvent.focus(screen.getByTestId('template-subject-input'));
    fireEvent.click(screen.getByTestId('token-chip-[Next Gig Date]'));
    expect(intro).toHaveValue('<p>[Next Gig Date] [Contact Name],</p>');
    expect(body).toHaveValue('Cold Originals Body');
    await waitFor(() => {
      expect(intro).toHaveFocus();
      expect(intro.selectionStart).toBe(18);
      expect(intro.selectionEnd).toBe(18);
    });

    fireEvent.focus(body);
    body.setSelectionRange(5, 14);
    fireEvent.click(screen.getByTestId('token-chip-[Venue Name]'));
    expect(body).toHaveValue('Cold [Venue Name] Body');
    expect(intro).toHaveValue('<p>[Next Gig Date] [Contact Name],</p>');
    await waitFor(() => expect(body).toHaveFocus());
  });

  it.each(['json', 'csv'] as const)('imports valid stages, rejects an unknown stage and defaults a missing stage in %s', async (format) => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => { render(wrap(adminAuth)); });
    const rows = [
      { type: 'Originals', stage: 'upcoming', subject: 'Upcoming import' },
      { type: 'Originals', stage: 'warm', subject: 'Invalid import' },
      { type: 'OnlineForm', subject: 'Default cold import' },
      { type: 'PubFestivalBrewery', stage: 'returning', subject: 'Returning import' },
    ];
    const content = format === 'json' ? JSON.stringify(rows)
      : ['type,stage,subject', 'Originals,upcoming,Upcoming import', 'Originals,warm,Invalid import',
        'OnlineForm,,Default cold import', 'PubFestivalBrewery,returning,Returning import'].join('\n');
    await importFile(content, format);
    expect(screen.getByText('Import complete. Success: 3, Failures: 1')).toBeInTheDocument();
    expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledTimes(2);
    expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledWith('tk', 'temp-3', expect.objectContaining({ stage: 'upcoming' }));
    expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledWith('tk', 'temp-2', expect.objectContaining({ stage: 'returning' }));
    expect(adminTemplatesUtils.createTemplate).toHaveBeenCalledTimes(1);
    expect(adminTemplatesUtils.createTemplate).toHaveBeenCalledWith('tk', expect.objectContaining({ stage: 'cold' }));
    expect(errorSpy).toHaveBeenCalledWith(
      'Import failed for item:', expect.objectContaining({ stage: 'warm' }), expect.objectContaining({ message: 'Invalid stage: warm' }),
    );
  });

  it.each(['json', 'csv'] as const)('counts one upcoming row and one invalid row in %s', async (format) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => { render(wrap(adminAuth)); });
    const content = format === 'json'
      ? JSON.stringify([{ type: 'OnlineForm', stage: 'upcoming' }, { type: 'Originals', stage: 'warm' }])
      : 'type,stage\nOnlineForm,upcoming\nOriginals,warm';
    await importFile(content, format);
    expect(screen.getByText('Import complete. Success: 1, Failures: 1')).toBeInTheDocument();
    expect(adminTemplatesUtils.createTemplate).toHaveBeenCalledTimes(1);
    expect(adminTemplatesUtils.createTemplate).toHaveBeenCalledWith('tk', expect.objectContaining({ stage: 'upcoming' }));
    expect(adminTemplatesUtils.updateTemplate).not.toHaveBeenCalled();
  });

  it.each([
    ['json', 'present'], ['json', 'empty'], ['json', 'missing'], ['json', 'non-string'],
    ['csv', 'present'], ['csv', 'empty'], ['csv', 'missing'],
  ] as const)('carries only a non-empty string intro through %s imports (%s)', async (format, introCase) => {
    await act(async () => { render(wrap(adminAuth)); });
    const intro = '<p>Imported intro</p>';
    const introValues = { present: intro, empty: '', 'non-string': 123 };
    const introFields = introCase === 'missing' ? {} : { introHtml: introValues[introCase] };
    const rows = [
      { type: 'Originals', stage: 'cold', subject: 'Updated intro', ...introFields },
      { type: 'OnlineForm', stage: 'upcoming', subject: 'Created intro', ...introFields },
    ];
    const csvIntro = introCase === 'missing' ? '' : `,${introCase === 'present' ? intro : ''}`;
    const csvHeader = `type,stage,subject${introCase === 'missing' ? '' : ',introHtml'}`;
    const content = format === 'json' ? JSON.stringify(rows)
      : [csvHeader, `Originals,cold,Updated intro${csvIntro}`, `OnlineForm,upcoming,Created intro${csvIntro}`].join('\n');
    await importFile(content, format);
    expect(screen.getByText('Import complete. Success: 2, Failures: 0')).toBeInTheDocument();
    const updatedPayload = vi.mocked(adminTemplatesUtils.updateTemplate).mock.calls[0][2];
    const createdPayload = vi.mocked(adminTemplatesUtils.createTemplate).mock.calls[0][1];
    for (const payload of [updatedPayload, createdPayload]) {
      if (introCase === 'present') {
        expect(payload).toHaveProperty('introHtml', intro);
      } else {
        expect(payload).not.toHaveProperty('introHtml');
      }
    }
  });

  it('inserts personalization tokens into body html at cursor', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    const textarea = screen.getByTestId('template-body-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Cold Originals Body');

    const tokenChip = screen.getByTestId('token-chip-[Venue Name]');
    await act(async () => {
      fireEvent.click(tokenChip);
    });

    expect(textarea.value).toBe('Cold Originals Body[Venue Name]');
  });

  it('handles custom photo selection and Base64 loading', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    // Initially loads the existing asset from backend via getTemplateAssetUrl mock
    expect(adminTemplatesUtils.getTemplateAssetUrl).toHaveBeenCalledWith('tk', 'photo-ref-1');

    // Mock choosing a local file
    const file = new File(['dummy content'], 'photo.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('template-photo-input');

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Mock FileReader behavior
    await waitFor(() => {
      expect(screen.getByTestId('template-photo-preview')).toBeDefined();
    });
  });

  it('saves edits when Save Template is clicked', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    const subjectInput = screen.getByTestId('template-subject-input');
    await act(async () => {
      fireEvent.change(subjectInput, { target: { value: 'New Subject!' } });
    });

    const saveBtn = screen.getByTestId('template-save-btn');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledWith('tk', 'temp-1', expect.objectContaining({
      subject: 'New Subject!',
      type: 'Originals',
      stage: 'cold',
    }));
  });

  it('creates a new template when saving non-configured type+stage', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    // Select MidRangeCafeBar (not configured)
    const cafeBtn = screen.getByTestId('template-type-MidRangeCafeBar');
    await act(async () => {
      fireEvent.click(cafeBtn);
    });

    const subjectInput = screen.getByTestId('template-subject-input');
    await act(async () => {
      fireEvent.change(subjectInput, { target: { value: 'Cafe Cold Subject' } });
    });

    const saveBtn = screen.getByTestId('template-save-btn');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(adminTemplatesUtils.createTemplate).toHaveBeenCalledWith('tk', expect.objectContaining({
      type: 'MidRangeCafeBar',
      stage: 'cold',
      subject: 'Cafe Cold Subject',
    }));
  });

  it('triggers JSON and CSV exports', async () => {
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = vi.fn();

    await act(async () => {
      render(wrap(adminAuth));
    });

    const exportJsonBtn = screen.getByTestId('export-json-btn');
    const exportCsvBtn = screen.getByTestId('export-csv-btn');

    await act(async () => {
      fireEvent.click(exportJsonBtn);
      fireEvent.click(exportCsvBtn);
    });

    expect(createObjectURLMock).toHaveBeenCalledTimes(2); // 2 for exports (image loading is mocked)
  });

  it('opens import dialog and confirms bulk JSON uploads', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    const importBtn = screen.getByTestId('import-btn');
    await act(async () => {
      fireEvent.click(importBtn);
    });

    expect(screen.getByTestId('import-dialog')).toBeDefined();

    // Mock choosing a JSON file
    const fileContent = JSON.stringify([{ type: 'Originals', stage: 'cold', subject: 'Imported Sub' }]);
    const file = new File([fileContent], 'templates.json', { type: 'application/json' });
    const fileInput = screen.getByTestId('import-file-input');

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByText('Imported Sub')).toBeDefined();
    });

    const confirmBtn = screen.getByTestId('confirm-import-btn');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    // Should call updateTemplate for existing Originals Cold
    await waitFor(() => {
      expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledWith('tk', 'temp-1', expect.objectContaining({
        subject: 'Imported Sub',
      }));
    });
  });

  it('allows reverting unsaved changes', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    const subjectInput = screen.getByTestId('template-subject-input') as HTMLInputElement;
    expect(subjectInput.value).toBe('Cold Originals Subject');

    await act(async () => {
      fireEvent.change(subjectInput, { target: { value: 'Temporary Unsaved Change' } });
    });
    expect(subjectInput.value).toBe('Temporary Unsaved Change');

    const revertBtn = screen.getByRole('button', { name: /revert/i }) as HTMLButtonElement;
    expect(revertBtn.disabled).toBe(false);

    await act(async () => {
      fireEvent.click(revertBtn);
    });

    expect(subjectInput.value).toBe('Cold Originals Subject');
  });

  it('allows removing footer photo', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    // Wait for initial image preview
    await waitFor(() => {
      expect(screen.getByTestId('template-photo-preview')).toBeDefined();
    });

    // Click remove photo button (DeleteIcon is inside an IconButton)
    const removePhotoBtn = screen.getByTestId('DeleteIcon').closest('button');
    expect(removePhotoBtn).not.toBeNull();

    await act(async () => {
      fireEvent.click(removePhotoBtn!);
    });

    expect(screen.queryByTestId('template-photo-preview')).toBeNull();
  });

  it('opens import dialog and confirms bulk CSV uploads', async () => {
    await act(async () => {
      render(wrap(adminAuth));
    });

    const importBtn = screen.getByTestId('import-btn');
    await act(async () => {
      fireEvent.click(importBtn);
    });

    // Mock choosing a CSV file
    const csvContent = 'type,stage,subject,bodyHtml,active\nOriginals,cold,Imported CSV Sub,Imported CSV Body,true';
    const file = new File([csvContent], 'templates.csv', { type: 'text/csv' });
    const fileInput = screen.getByTestId('import-file-input');

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByText('Imported CSV Sub')).toBeDefined();
    });

    const confirmBtn = screen.getByTestId('confirm-import-btn');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(adminTemplatesUtils.updateTemplate).toHaveBeenCalledWith('tk', 'temp-1', expect.objectContaining({
        subject: 'Imported CSV Sub',
      }));
    });
  });
});
