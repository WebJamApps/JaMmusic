/* eslint-disable react/sort-comp */
import { PageHost } from './PageHost';

export function AppTemplate(props:any) {
  const {
    children, userCount, heartBeat,
  } = props;
  return (
    <PageHost
      children={children}
      userCount={userCount}
      heartBeat={heartBeat}
    />
  );
}

