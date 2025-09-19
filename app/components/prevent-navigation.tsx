import { Block } from '@tanstack/react-router';

export const PreventNavigation = (props: { shoudlBlock: boolean }) => {
  return (
    <Block
      shouldBlockFn={() => {
        if (!props.shoudlBlock) return false;
        const shouldLeave = confirm('Are you sure you want to leave?');
        return !shouldLeave;
      }}
      withResolver
      enableBeforeUnload={props.shoudlBlock}
    />
  );
};
