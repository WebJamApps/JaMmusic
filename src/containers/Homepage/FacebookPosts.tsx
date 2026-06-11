// Presentational cards for the WebJamLLC feed served by web-jam-back's cached
// Graph API endpoint (GET /facebook/feed?pageId=, web-jam-back#799), replacing
// the unreliable Page Plugin iframe (JaMmusic#1107). FacebookFeed owns the fetch
// and decides whether to render these or the admin Reconnect button.
export interface FbPost {
  id?: string;
  message?: string;
  full_picture?: string;
  permalink_url?: string;
  created_time?: string;
}

const PAGE_URL = 'https://www.facebook.com/WebJamLLC/';

export interface FacebookPostsProps {
  posts: FbPost[];
  maxWidth?: number;
  maxHeight?: number;
  testId?: string;
}

export const FacebookPosts = ({
  posts, maxWidth = 500, maxHeight = 485, testId,
}: FacebookPostsProps) => {
  if (posts.length === 0) return null;
  return (
    <div
      className="fbFeed"
      data-testid={testId}
      style={{
        maxWidth: `${maxWidth}px`, margin: 'auto', maxHeight: `${maxHeight}px`, overflowY: 'auto', textAlign: 'left',
      }}
    >
      {posts.map((post) => (
        <a
          key={post.id || post.permalink_url}
          className="fbPost"
          href={post.permalink_url || PAGE_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '8px',
            marginBottom: '10px',
          }}
        >
          {post.full_picture ? (
            <img src={post.full_picture} alt="" style={{ width: '100%', borderRadius: '4px', marginBottom: '6px' }} />
          ) : null}
          {post.message ? <p style={{ fontSize: '10pt', margin: '0 0 4px' }}>{post.message}</p> : null}
          {post.created_time ? (
            <span style={{ fontSize: '8pt', color: '#666' }}>
              {new Date(post.created_time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          ) : null}
        </a>
      ))}
    </div>
  );
};

export default FacebookPosts;
