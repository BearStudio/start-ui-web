import { useMediaQuery } from '@/platform/hooks/use-media-query';

export function useIsMobile(breakpoint: number = 768) {
  return useMediaQuery(`only screen and (max-width : ${breakpoint}px)`);
}
