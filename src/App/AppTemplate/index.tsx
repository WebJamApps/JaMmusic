/* eslint-disable react/sort-comp */
import { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import mapStoreToATemplateProps from 'src/redux/mapStoreToAppTemplateProps';
import { PageHost } from './PageHost';

export interface AppTemplateProps extends RouteComponentProps {
  heartBeat: string;
  userCount: number;
  children: JSX.Element;
}

export class AppTemplate extends Component<AppTemplateProps, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: AppTemplateProps) {
    super(props);
  }

  render(): JSX.Element {
    const {
      children, userCount, heartBeat, location,
    } = this.props;
    return (
      <PageHost
        children={children}
        userCount={userCount}
        heartBeat={heartBeat}
        location={location}
      />
    );
  }
}

export default withRouter(connect(mapStoreToATemplateProps, null)(AppTemplate));
