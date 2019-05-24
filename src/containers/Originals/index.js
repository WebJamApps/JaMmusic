import React, { Component } from 'react';
import MusicPlayer from '../../components/MusicPlayer';
import songData from '../songs.json';

export default class Originals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urls: songData.songs.filter(song => song.category === 'originals'),
      copy: Array.from(songData.songs.filter(song => song.category === 'originals')),
    };
    this.fixLocalUtube();
    // this.urls = songData.songs.filter(song => song.category === 'originals');
    // this.copy = Array.from(songData.songs.filter(song => song.category === 'originals'));
  }

  componentDidMount() {
    document.title = 'Original Songs | Web Jam LLC';
    // this.setState({
    //   urls: this.urls,
    //   copy: this.copy,
    // });
    this.fixLocalUtube();
  }

  fixLocalUtube() {
    const { urls } = this.state;
    for (let i = 0; i < urls.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
      if (urls[i].url.includes('https://www.youtube')) urls[i].url = urls[i].url.replace('https:', 'http:');
    }
    console.log(urls);// eslint-disable-line no-console
    this.setState({ urls, copy: urls });
  }

  render() {
    // this.fixLocalUtube();
    const { urls, copy } = this.state;
    // console.log(this.urls);
    // console.log(this.copy);
    return (
      <div className="page-content">
        <div style={{ maxWidth: '4in', margin: 'auto', textAlign: 'center' }}>
          <h4 style={{
            textAlign: 'center', margin: '20px', fontWeight: 'bold', marginBottom: '0',
          }}
          >
Original Songs
          </h4>
          <MusicPlayer songs={urls} copy={copy} />
        </div>
        <div style={{ minHeight: '.5in' }}>&nbsp;</div>
      </div>
    );
  }
}
