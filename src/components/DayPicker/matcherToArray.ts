import { Matcher } from 'react-day-picker';

// Code that is not exported from the react-day-picker library but that is useful
// when extending the disabled props.
// https://github.com/gpbl/react-day-picker/blob/206ff6229e7afa557b9c4b2b4ef3733cdd4397a3/src/contexts/Modifiers/utils/matcherToArray.ts
export function matcherToArray(
  matcher: Matcher | Matcher[] | undefined
): Matcher[] {
  if (Array.isArray(matcher)) {
    return [...matcher];
  } else if (matcher !== undefined) {
    return [matcher];
  } else {
    return [];
  }
}
