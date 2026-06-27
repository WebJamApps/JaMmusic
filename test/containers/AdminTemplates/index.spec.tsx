/* eslint-disable @typescript-eslint/no-explicit-any */
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
];

const wrap = (auth: Iauth) => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <AdminTemplates />
  </AuthContext.Provider>
);

describe('AdminTemplates page container', () => {
  beforeEach(() => {
    adminTemplatesUtils.listTemplates = vi.fn(() => Promise.resolve(mockTemplates)) as any;
    adminTemplatesUtils.getAllowedAdminRoles = vi.fn(() => ['JaM-admin', 'Developer']) as any;
    adminTemplatesUtils.getTemplateAssetUrl = vi.fn(() => Promise.resolve('blob:mock-asset-url')) as any;
    adminTemplatesUtils.createTemplate = vi.fn(() => Promise.resolve({})) as any;
    adminTemplatesUtils.updateTemplate = vi.fn(() => Promise.resolve({})) as any;
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
