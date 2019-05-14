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
    console.log(this.urls);
    console.log(this.copy);
    return (
      <div className="page-content">
        <h3 style={{ textAlign: 'center', margin: '20px', fontWeight: 'bold' }}>Original Songs</h3>
        <MusicPlayer urls={this.urls} copy={this.copy} />
      </div>
    );
  }
}
