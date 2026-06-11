import { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/providers/Auth.provider';
import FacebookPosts, { type FbPost } from './FacebookPosts';
import ReconnectFacebook from './ReconnectFacebook';
import { isJamAdmin, WEBJAMLLC_PAGE_ID } from './facebook.utils';

interface FeedResponse { posts: FbPost[]; lastUpdated: string | null }

// Don't show a feed that hasn't refreshed in a week — better nothing than
// stale-looking content (the backend stops updating during a token outage).
const STALE_MS = 7 * 24 * 60 * 60 * 1000;

// Fetches the WebJamLLC feed once and decides what to show:
//  - fresh posts            → the cards
//  - stalled + signed-in admin → the Reconnect button (so the admin can fix it)
//  - stalled + everyone else   → nothing (the "Find Us on Facebook" link remains)
function FacebookFeed() {
  const { auth } = useContext(AuthContext);
  const [posts, setPosts] = useState<FbPost[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`${process.env.BackendUrl}/facebook/feed?pageId=${WEBJAMLLC_PAGE_ID}`);
        const data = await res.json() as FeedResponse;
        const fresh = !!data.lastUpdated && Date.now() - new Date(data.lastUpdated).getTime() < STALE_MS;
        if (!active) return;
        if (fresh && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
          setLastUpdated(data.lastUpdated);
        } else setStalled(true);
      } catch {
        if (active) setStalled(true);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  if (posts.length > 0) {
    return (
      <>
        <FacebookPosts posts={posts} testId="fb-feed" />
        {lastUpdated ? (
          <p className="fbUpdated" style={{ fontSize: '8pt', color: '#666', textAlign: 'center', margin: '4px 0 0' }}>
            {`Feed updated ${new Date(lastUpdated).toLocaleString()}`}
          </p>
        ) : null}
      </>
    );
  }
  if (stalled && isJamAdmin(auth)) return <ReconnectFacebook />;
  return null;
}

export default FacebookFeed;
