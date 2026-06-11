import { render } from '@testing-library/react';
import { FacebookPosts } from 'src/containers/Homepage/FacebookPosts';

describe('FacebookPosts', () => {
  it('renders nothing when there are no posts', () => {
    const { container } = render(<FacebookPosts posts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a card per post with image, message and link', () => {
    const { container } = render(
      <FacebookPosts
        testId="fb-feed"
        posts={[
          {
            id: 'p1', message: 'Gig Friday', permalink_url: 'https://fb/p1', created_time: '2026-06-01T00:00:00Z', full_picture: 'https://img/1.jpg',
          },
          { id: 'p2', message: 'New song out' },
        ]}
      />,
    );
    const cards = container.querySelectorAll('.fbPost');
    expect(cards).toHaveLength(2);
    expect((cards[0] as HTMLAnchorElement).getAttribute('href')).toBe('https://fb/p1');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://img/1.jpg');
    expect(container.querySelector('[data-testid="fb-feed"]')).not.toBeNull();
  });

  it('falls back to the WebJamLLC page url when a post has no permalink', () => {
    const { container } = render(<FacebookPosts posts={[{ id: 'p3', message: 'x' }]} />);
    expect((container.querySelector('.fbPost') as HTMLAnchorElement).getAttribute('href'))
      .toBe('https://www.facebook.com/WebJamLLC/');
  });
});
