/* eslint-disable react/sort-comp */
import React, { Dispatch } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import mapStoreToATemplateProps from 'src/redux/mapStoreToAppTemplateProps';
import type { Iauth } from 'src/providers/Auth.provider';
import { PageHost } from './PageHost';

export interface AppTemplateProps extends RouteComponentProps {
  heartBeat: string;
  userCount: number;
  auth: Iauth;
  dispatch: Dispatch<unknown>;
  children: JSX.Element;
}

export class AppTemplate extends React.Component<AppTemplateProps, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: AppTemplateProps) {
    super(props);
  }

  render(): JSX.Element {
    const {
      children, userCount, heartBeat, auth, location, dispatch,
    } = this.props;
    return (
      <PageHost
        children={children}
        userCount={userCount}
        heartBeat={heartBeat}
        auth={auth}
        location={location}
        dispatch={dispatch}
      />
    );
  }
}

export default withRouter(connect(mapStoreToATemplateProps, null)(AppTemplate));
