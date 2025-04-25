import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react';

export type ChildrenAsChild = StrictUnion<
  | {
      children?: ReactNode;
      asChild?: false;
    }
  | {
      children: ReactElement<{ children?: ReactNode }>;
      asChild: true;
    }
>;

export const cloneAsChild = (params: {
  children?: ReactNode;
  asChild?: boolean;
  render: (children?: ReactNode) => ReactNode;
}) => {
  if (!params.asChild) return params.render(params.children);

  if (!isValidElement(params.children)) {
    throw new Error(
      'React.Children.only expected to receive a single React element child.'
    );
  }

  // eslint-disable-next-line @eslint-react/no-clone-element
  return cloneElement(
    params.children,
    {},
    params.render((params.children.props as ExplicitAny)?.children ?? null)
  );
};
