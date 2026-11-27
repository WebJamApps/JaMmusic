import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PrivacyPolicy } from 'src/containers/PrivacyPolicy';

describe('PrivacyPolicy', () => {
  it('says what each website collects and sets the page title', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What web-jam.com collects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What joshandmariamusic.com collects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What both websites do' })).toBeInTheDocument();
    expect(document.title).toBe('Privacy Policy | Web Jam LLC');
  });

  it('gives a way to ask about or delete information', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('link', { name: 'web.jam.adm@gmail.com' }))
      .toHaveAttribute('href', 'mailto:web.jam.adm@gmail.com');
    expect(screen.getByRole('link', { name: 'web-jam.com' })).toHaveAttribute('href', 'https://web-jam.com');
  });
});
