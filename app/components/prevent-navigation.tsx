import { Block } from '@tanstack/react-router';

export const PreventNavigation = (props: { shouldBlock: boolean }) => {
  return (
    <Block
      shouldBlockFn={() => {
        if (!props.shouldBlock) return false;
        const shouldLeave = confirm('Are you sure you want to leave?');
        return !shouldLeave;
      }}
      withResolver
      enableBeforeUnload={props.shouldBlock}
    />
  );
};
