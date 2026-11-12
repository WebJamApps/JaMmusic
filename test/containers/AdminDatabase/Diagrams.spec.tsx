import React from 'react';
import {
  render, screen, waitFor, act, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import adminDatabaseUtils from 'src/containers/AdminDatabase/admin-database.utils';
import { Diagrams, defaultLoadMermaid } from 'src/containers/AdminDatabase/Diagrams';

const controls = vi.hoisted(() => ({
  zoomIn: vi.fn(), zoomOut: vi.fn(), fitToView: vi.fn(), resetTransform: vi.fn(),
}));
const viewerLoaded = vi.hoisted(() => vi.fn());
vi.mock('react-zoom-pan-pinch', () => {
  viewerLoaded();
  return {
    TransformWrapper: ({ children, minScale, initialScale }: {
      children: (actions: typeof controls) => React.ReactNode;
      minScale: number; initialScale: number;
    }) => <div data-testid="viewer" data-min-scale={minScale} data-initial-scale={initialScale}>{children(controls)}</div>,
    TransformComponent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mocked-svg"><g></g></svg>' }),
  },
}));

describe('Diagrams component', () => {
  const token = 'test-token-123';
  const mockDbText = 'erDiagram\nUser {\n  string name\n}';
  const mockSystemText = 'flowchart TD\nWebsite --> Backend';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('adminDatabaseUtils diagram methods', () => {
    it('getDatabaseDiagram returns text on 200', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: async () => 'erDiagram\nUser',
      } as Response);

      const text = await adminDatabaseUtils.getDatabaseDiagram(token);
      expect(text).toBe('erDiagram\nUser');
    });

    it('getDatabaseDiagram throws on non-ok status', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(adminDatabaseUtils.getDatabaseDiagram(token)).rejects.toThrow('500 Internal Server Error');
    });

    it('getSystemDiagram returns text on 200', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        text: async () => 'flowchart TD',
      } as Response);

      const text = await adminDatabaseUtils.getSystemDiagram(token);
      expect(text).toBe('flowchart TD');
    });

    it('getSystemDiagram throws on non-ok status', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(adminDatabaseUtils.getSystemDiagram(token)).rejects.toThrow('401 Unauthorized');
    });
  });

  describe('Diagrams rendering and behavior', () => {
    it('does nothing when token is not provided', () => {
      const getDbSpy = vi.spyOn(adminDatabaseUtils, 'getDatabaseDiagram');
      const getSysSpy = vi.spyOn(adminDatabaseUtils, 'getSystemDiagram');

      render(<Diagrams />);

      expect(getDbSpy).not.toHaveBeenCalled();
      expect(viewerLoaded).not.toHaveBeenCalled();
      expect(getSysSpy).not.toHaveBeenCalled();
      expect(screen.queryByTestId('database-diagram-loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('system-map-loading')).not.toBeInTheDocument();
    });

    it('renders both diagrams as SVG when fetches and mermaid render succeed', async () => {
      vi.spyOn(adminDatabaseUtils, 'getDatabaseDiagram').mockResolvedValueOnce(mockDbText);
      vi.spyOn(adminDatabaseUtils, 'getSystemDiagram').mockResolvedValueOnce(mockSystemText);

      const mockMermaid = {
        render: vi.fn().mockImplementation(async (id: string) => {
          if (id.startsWith('db-diagram')) {
            return { svg: '<svg id="db-svg"><text>Database SVG</text></svg>' };
          }
          return { svg: '<svg id="sys-svg"><text>System SVG</text></svg>' };
        }),
      };
      const loadMermaidMock = vi.fn().mockResolvedValue(mockMermaid);

      render(<Diagrams token={token} loadMermaid={loadMermaidMock} />);

      expect(screen.getByTestId('database-diagram-loading')).toBeInTheDocument();
      expect(screen.getByTestId('system-map-loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('database-diagram-svg')).toBeInTheDocument();
        expect(screen.getByTestId('system-map-svg')).toBeInTheDocument();
      });

      expect(screen.getByText('Database SVG')).toBeInTheDocument();
      expect(screen.getByText('System SVG')).toBeInTheDocument();
      expect(mockMermaid.render).toHaveBeenCalledTimes(2);
      const actions = { Plus: controls.zoomIn, Minus: controls.zoomOut, Fit: controls.fitToView, Reset: controls.resetTransform };
      for (const [label, handler] of Object.entries(actions)) {
        const buttons = screen.getAllByRole('button', { name: label });
        expect(buttons).toHaveLength(2);
        buttons.forEach((button) => fireEvent.click(button));
        expect(handler).toHaveBeenCalledTimes(2);
      }
      expect(screen.getAllByTestId('viewer')[0]).toHaveAttribute('data-initial-scale', '1');
      expect(screen.getAllByTestId('viewer')[0]).toHaveAttribute('data-min-scale', '0.001');
    });

    it('shows error messages in place of diagrams when diagram fetches fail', async () => {
      vi.spyOn(adminDatabaseUtils, 'getDatabaseDiagram').mockRejectedValueOnce(new Error('Backend connection failed'));
      vi.spyOn(adminDatabaseUtils, 'getSystemDiagram').mockRejectedValueOnce(new Error('System map not found'));

      render(<Diagrams token={token} />);

      await waitFor(() => {
        expect(screen.getByTestId('database-diagram-error')).toBeInTheDocument();
        expect(screen.getByTestId('system-map-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Backend connection failed')).toBeInTheDocument();
      expect(screen.getByText('System map not found')).toBeInTheDocument();
      expect(screen.queryByTestId('database-diagram-svg')).not.toBeInTheDocument();
      expect(screen.queryByTestId('system-map-svg')).not.toBeInTheDocument();
    });

    it('shows fallback error message when fetch error is not an Error instance', async () => {
      vi.spyOn(adminDatabaseUtils, 'getDatabaseDiagram').mockRejectedValueOnce('string error');
      vi.spyOn(adminDatabaseUtils, 'getSystemDiagram').mockRejectedValueOnce({});

      render(<Diagrams token={token} />);

      await waitFor(() => {
        expect(screen.getByTestId('database-diagram-error')).toBeInTheDocument();
        expect(screen.getByTestId('system-map-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to load database diagram')).toBeInTheDocument();
      expect(screen.getByText('Failed to load system map')).toBeInTheDocument();
    });

    it('shows an error message when mermaid render throws', async () => {
      vi.spyOn(adminDatabaseUtils, 'getDatabaseDiagram').mockResolvedValueOnce(mockDbText);
      vi.spyOn(adminDatabaseUtils, 'getSystemDiagram').mockResolvedValueOnce(mockSystemText);

      const mockMermaid = {
        render: vi.fn().mockRejectedValue(new Error('Mermaid syntax parsing error')),
      };
      const loadMermaidMock = vi.fn().mockResolvedValue(mockMermaid);

      render(<Diagrams token={token} loadMermaid={loadMermaidMock} />);

      await waitFor(() => {
        expect(screen.getByTestId('database-diagram-error')).toBeInTheDocument();
        expect(screen.getByTestId('system-map-error')).toBeInTheDocument();
      });

      expect(screen.getAllByText('Mermaid syntax parsing error')).toHaveLength(2);
    });

    it('does not update state when unmounted before fetch completes', async () => {
      let resolveDb: (value: string) => void;
      const dbPromise = new Promise<string>((resolve) => {
        resolveDb = resolve;
      });
      vi.spyOn(adminDatabaseUtils, 'getDatabaseDiagram').mockReturnValueOnce(dbPromise);
      vi.spyOn(adminDatabaseUtils, 'getSystemDiagram').mockReturnValueOnce(new Promise(() => {}));

      const { unmount } = render(<Diagrams token={token} />);
      unmount();

      await act(async () => {
        resolveDb!(mockDbText);
      });

      expect(screen.queryByTestId('database-diagram-svg')).not.toBeInTheDocument();
    });

    it('redraws both diagrams when the page mode changes', async () => {
      vi.spyOn(adminDatabaseUtils, 'getDatabaseDiagram').mockResolvedValue(mockDbText);
      vi.spyOn(adminDatabaseUtils, 'getSystemDiagram').mockResolvedValue(mockSystemText);
      const load = vi.fn().mockResolvedValue({ render: vi.fn().mockResolvedValue({ svg: '<svg>diagram</svg>' }) });
      const { rerender } = render(
        <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}><Diagrams token={token} loadMermaid={load} /></ThemeProvider>,
      );
      await screen.findByTestId('database-diagram-svg');
      expect(load).toHaveBeenCalledWith('light');
      rerender(<ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}><Diagrams token={token} loadMermaid={load} /></ThemeProvider>);
      await waitFor(() => expect(load).toHaveBeenCalledWith('dark'));
      await screen.findByTestId('system-map-svg');
      expect(load).toHaveBeenCalledTimes(4);
    });

    it('defaultLoadMermaid initializes and returns the mermaid instance', async () => {
      const mermaid = await defaultLoadMermaid();
      expect(mermaid).toBeDefined();
      expect(typeof mermaid.render).toBe('function');
      const module = await import('mermaid');
      expect(module.default.initialize).toHaveBeenLastCalledWith({
        startOnLoad: false, securityLevel: 'loose', theme: 'default',
        er: { useMaxWidth: false }, flowchart: { useMaxWidth: false },
      });
      await defaultLoadMermaid('dark');
      expect(module.default.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ theme: 'dark' }));
    });
  });
});
