import React, { Component, RefObject } from 'react';
import commonUtils from '../../lib/commonUtils';
import DefaultPlayer from './Player';

type SProps = {
};
export class Songs extends Component<SProps> {
  o: RefObject<unknown>;

  commonUtils: typeof commonUtils;

  constructor(props: SProps) {
    super(props);
    this.o = React.createRef();
    this.commonUtils = commonUtils;
  }

  componentDidMount(): void { this.commonUtils.setTitleAndScroll('Songs', window.screen.width); }

  // componentDidUpdate(): void { this.commonUtils.setTitleAndScroll('Songs', window.screen.width); }

  render(): JSX.Element {
    return (
      <div id="pageContent" className="page-content">
        <DefaultPlayer />
      </div>
    );
  }
}
export default Songs;
