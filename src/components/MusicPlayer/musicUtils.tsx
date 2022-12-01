
import type { ISong } from 'src/providers/Data.provider';

function setPlayerStyle(song: ISong):Record<string, unknown> {
  let playerStyle = {
    backgroundColor: '#2a2a2a',
    textAlign: 'center',
    backgroundImage: `url(${song.image})`,
    backgroundPosition: 'center',
    backgroundSize: '80%',
    backgroundRepeat: 'no-repeat',
  };
  if (song.image === undefined || song.image === '') {
    playerStyle = {
      backgroundImage: 'url("/static/imgs/webjamlogo1.png")',
      backgroundColor: '#2a2a2a',
      textAlign: 'center',
      backgroundPosition: 'center',
      backgroundSize: '80%',
      backgroundRepeat: 'no-repeat',
    };
    if (song.url[8] === 's' || song.url[12] === 'y') {
      playerStyle = {
        backgroundImage: '',
        backgroundColor: '#eee',
        textAlign: 'center',
        backgroundPosition: 'center',
        backgroundSize: '80%',
        backgroundRepeat: 'no-repeat',
      };
    }
  }
  return playerStyle;
}

export default {
  setPlayerStyle,
};
