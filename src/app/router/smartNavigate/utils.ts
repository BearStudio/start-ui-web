import { Location } from 'react-router-dom';

/**
 *
 * @description build the complete current route from location
 * @returns complete current route
 */
export const getCurrentRoute = (location: Location) =>
  `${location.pathname}${location.search}`;
