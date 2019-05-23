import React, { Component } from 'react';
import MusicPlayer from '../../components/MusicPlayer';
import songData from '../songs.json';

export default class Originals extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.urls = songData.songs.filter(song => song.category === 'originals');
    this.copy = Array.from(songData.songs.filter(song => song.category === 'originals'));
  }

  componentDidMount() {
    document.title = 'Original Songs | Web Jam LLC';
  }

  render() {
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
          <MusicPlayer songs={this.urls} copy={this.copy} />
        </div>
        <div style={{ minHeight: '.5in' }}>&nbsp;</div>
      </div>
    );
  }
}
