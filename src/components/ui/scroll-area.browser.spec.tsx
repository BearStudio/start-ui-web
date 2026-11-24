import { describe, expect, it } from 'vitest';

import { ScrollArea } from '@/components/ui/scroll-area';

import { page, render, setupUser } from '@/tests/utils';

// Tests load no Tailwind, so this stands in for the root's size and the viewport's `size-full`.
const setSize = (container: HTMLElement) => {
  const root = container.querySelector<HTMLElement>(
    '[data-slot="scroll-area"]'
  );
  const viewport = container.querySelector<HTMLElement>(
    '[data-slot="scroll-area-viewport"]'
  );
  root?.style.setProperty('height', '100px');
  root?.style.setProperty('width', '200px');
  viewport?.style.setProperty('height', '100%');
  return { root, viewport };
};

const items = Array.from({ length: 30 }, (_, index) => `Release ${index + 1}`);

describe('ScrollArea', () => {
  it('scrolls its viewport with the keyboard when it holds nothing focusable', async () => {
    const user = setupUser();
    const { container } = await render(
      <ScrollArea>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ScrollArea>
    );
    const { root, viewport } = setSize(container);

    await expect.poll(() => root?.hasAttribute('data-overflow-y')).toBe(true);
    await user.tab();
    expect(document.activeElement).toBe(viewport);
    await user.keyboard('{End}');
    await expect.poll(() => root?.hasAttribute('data-at-end')).toBe(true);
    expect(viewport?.scrollTop).toBeGreaterThan(0);
  });

  it('shows the vertical scrollbar while the content overflows', async () => {
    const { container } = await render(
      <ScrollArea>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ScrollArea>
    );
    setSize(container);
    const scrollbar = container.querySelector(
      '[data-slot="scroll-area-scrollbar"]'
    );

    expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
    expect(scrollbar).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => scrollbar?.hasAttribute('data-visible')).toBe(true);
  });

  it('hides the scrollbar and leaves the tab order alone when the content fits', async () => {
    const user = setupUser();
    const { container } = await render(
      <ScrollArea>
        <button type="button">Only item</button>
      </ScrollArea>
    );
    setSize(container);
    const scrollbar = container.querySelector(
      '[data-slot="scroll-area-scrollbar"]'
    );

    await user.tab();
    await expect
      .element(page.getByRole('button', { name: 'Only item' }))
      .toHaveFocus();
    expect(scrollbar).not.toHaveAttribute('data-visible');
  });

  it('puts a horizontal scrollbar with orientation="horizontal"', async () => {
    const { container } = await render(
      <ScrollArea orientation="horizontal">
        <p>Wide content</p>
      </ScrollArea>
    );

    expect(
      container.querySelector('[data-slot="scroll-area-scrollbar"]')
    ).toHaveAttribute('data-orientation', 'horizontal');
  });
});
