import React from 'react';
import { shallow } from 'enzyme';
import { MusicPlayer } from '../../src/components/music-player';

const data = [
  {
    title: 'I Still Haven"t Found What I"m Looking For by U2 - Josh & Maria Sherman',
    category: 'pub',
    url: 'https://soundcloud.com/joshandmariamusic/still-havent-found-what-im-looking-for',
    id: '28ru9weis2309uoi4jrgbefieqr'
  },
  {
    title: 'Cups (when i"m gone) by A. P. Carter - Josh & Maria Sherman',
    category: 'pub',
    url: 'https://soundcloud.com/joshandmariamusic/cups-when-im-gone',
    id: '28ru9weis2309ur9r7ifuviuiu'
  },
  {
    title: 'I"m Yours by Jason Mraz - Josh & Maria Sherman',
    category: 'pub',
    url: 'https://soundcloud.com/joshandmariamusic/im-yours',
    id: '28ru9weis2309kjh34ig9gfui'
  }
];


test('picture slider component test setup', () => {
  const ms = shallow(<MusicPlayer data={data} urls={data} />);
});
