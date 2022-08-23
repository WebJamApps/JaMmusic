/* eslint-disable react/sort-comp */
import React, { Dispatch } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { Auth } from 'src/redux/mapStoreToProps';
import mapStoreToATemplateProps from 'src/redux/mapStoreToAppTemplateProps';
import { PageHost } from './PageHost';

export interface AppTemplateProps extends RouteComponentProps {
  heartBeat: string;
  userCount: number;
  auth: Auth;
  dispatch: Dispatch<unknown>;
  children?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const defaultDispatch:Dispatch<Record<string, unknown>> = (_arg0: Record<string, unknown>): void => { };

export class AppTemplate extends React.Component<AppTemplateProps> {
  static defaultProps = {
    dispatch: defaultDispatch,
    auth: {
      isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
    },
    userCount: 0,
    heartBeat: 'white',
  };

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: AppTemplateProps) {
    super(props);
  }

  render(): JSX.Element {
    const { children, userCount, heartBeat, auth, location, dispatch } = this.props;
    return <PageHost
      children={children} userCount={userCount} heartBeat={heartBeat} auth={auth}
      location={location} dispatch={dispatch}
    />;
  }
}

export default withRouter(connect(mapStoreToATemplateProps, null)(AppTemplate));
