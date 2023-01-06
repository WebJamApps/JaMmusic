
import type { Isong } from 'src/providers/Data.provider';

const setIndex = (songs: Isong[], category: string): Isong[] => {
  let categorySongs: Isong[] = [];
  const otherSongs: Isong[] = [];
  for (let i = 0; songs.length > i; i += 1) {
    // eslint-disable-next-line security/detect-object-injection
    if (songs[i].category === category) categorySongs.push(songs[i]);
    else otherSongs.push(songs[i]);// eslint-disable-line security/detect-object-injection
  }
  categorySongs = categorySongs.concat(otherSongs);
  return categorySongs;
};

function copyRight(): JSX.Element { // eslint-disable-line class-methods-use-this
  return (<span>All Original Songs &copy;2019 &ndash; 2020 Web Jam LLC</span>);
}

function textUnderPlayer(song: Isong): JSX.Element {
  return (
    <section
      className="mt-1 textUnderPlayer"
      style={{
        fontSize: '0.8em', marginTop: 0, marginBottom: '0', paddingTop: 0, paddingBottom: 0,
      }}
    >
      <strong>
        {song.title ? song.title : null}
        {song.composer && song.category !== 'original' ? ` by ${song.composer}` : null}
        {song.artist ? ` - ${song.artist}` : null}
      </strong>
      <p style={{
        textAlign: 'center', fontSize: '8pt', marginTop: '4px', marginBottom: 0,
      }}
      >
        {song.album ? song.album : null}
        {song.year ? `, ${song.year}` : null}
      </p>
      <p style={{
        textAlign: 'center', fontSize: '8pt', marginTop: '2px', marginBottom: 0,
      }}
      >
        {song !== null && song.category === 'original' ? copyRight() : null}
      </p>
    </section>
  );
}

function setPlayerStyle(song: Isong):Record<string, unknown> {
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
  setIndex,
  textUnderPlayer,
  copyRight,
  setPlayerStyle,
};
