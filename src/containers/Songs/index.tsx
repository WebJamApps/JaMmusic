import { useEffect } from 'react';
import commonUtils from '../../lib/commonUtils';
import { Player } from './Player';

export function Songs() {
  useEffect(() => {
    commonUtils.setTitleAndScroll('Songs', window.screen.width);
  });
  return (
    <div id="pageContent" className="page-content">
      <Player />
    </div>
  );
}
