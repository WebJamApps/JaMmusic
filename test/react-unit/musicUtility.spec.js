import musicUtil from '../../src/components/MusicPlayer/musicPlayerUtils';

describe('musicPlayerUtils', () => { // eslint-disable-next-line max-len
  document.body.innerHTML = "<div id='sidebar'></div> <div id='header'></div><div id='wjfooter'></div><div id='mobilemenutoggle'></div><div id='contentBlock'></div><div id='pageContent'></div><div id='headerTitle'></div><div id='mainPlayer'></div>";

  // const params = {
  //   get: (item) => { // eslint-disable-line consistent-return
  //     if (item === 'oneplayer') return true;
  //     if (item === 'id') return '123';
  //   },
  // };

  // const allSongs = [{ _id: '123' }];

  const controller = {
    setState: () => true,
    props: { songs: [{}] },
    state: { songs: [], player: { onePlayerMode: true } },
  };

  const makeOnePlayerMode = musicUtil.makeOnePlayerMode();

  // it('checks one player', () => {
  //   const result = musicUtil.checkOnePlayer(params, [], [], allSongs, {
  //     setState: () => true,
  //   });
  //   expect(result).toBe(true);
  // });

  it('makes one player', () => {
    const result = makeOnePlayerMode;
    expect(result).toBe(true);
  });

  it('checks for null styles', () => {
    document.body.innerHTML = '';
    window.outerWidth = 400;
    const result = makeOnePlayerMode;
    expect(result).toBe(true);
  });

  it('runs one player mode if it exists', () => {
    window.outerWidth = 800;
    const result = musicUtil.runIfOnePlayer(controller);
    expect(result).toBe(true);
  });
});
