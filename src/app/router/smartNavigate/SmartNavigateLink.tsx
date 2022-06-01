import { FC } from 'react';

import { Link, LinkProps, useLocation } from 'react-router-dom';

import { getCurrentRoute } from '@/app/router/smartNavigate/utils';

/**
 *
 * @description react-router-dom Link overcoat that add state *from* value for manage smart navigation
 *
 * @param props react-router-dom Link props
 */
export const SmartNavigateLink: FC<LinkProps> = (props) => {
  const location = useLocation();

  const from = getCurrentRoute(location);

  return <Link {...props} state={{ ...props.state, from }} />;
};
