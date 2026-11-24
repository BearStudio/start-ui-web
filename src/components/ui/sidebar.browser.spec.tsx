import { createAgent } from '@ui-sdk/react/agent';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { page, render, setupUser } from '@/tests/utils';

const agent = createAgent();

describe('Sidebar parts', () => {
  beforeEach(async () => {
    // Below the sidebar breakpoint the trigger toggles the mobile drawer instead.
    await page.viewport(1280, 800);
  });

  it('lets an agent press the trigger by name and toggles the sidebar', async () => {
    const onOpenChange = vi.fn();
    await render(
      <SidebarProvider defaultOpen onOpenChange={onOpenChange}>
        <SidebarTrigger />
      </SidebarProvider>
    );

    const components = agent.snapshot().filter((entry) => !entry.offPage);
    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }
    const trigger = components.find(
      (entry) => entry.component === 'button' && entry.label
    );
    expect(trigger, 'the sidebar trigger is missing').toBeDefined();

    const result = await agent.act({
      steps: [{ ref: trigger!.ref, action: 'press' }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('runs the caller onClick on the trigger before toggling', async () => {
    const user = setupUser();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    await render(
      <SidebarProvider defaultOpen onOpenChange={onOpenChange}>
        <SidebarTrigger onClick={onClick} />
      </SidebarProvider>
    );

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders a menu button as the element passed to render', async () => {
    await render(
      <SidebarProvider>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive render={<a href="/manager/books" />}>
              Books
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>Users</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>
    );

    const link = page.getByRole('link', { name: 'Books' });
    await expect.element(link).toHaveAttribute('href', '/manager/books');
    await expect
      .element(link)
      .toHaveAttribute('data-slot', 'sidebar-menu-button');
    await expect.element(link).toHaveAttribute('data-active', 'true');
    const button = page.getByRole('button', { name: 'Users' });
    await expect.element(button).toHaveAttribute('data-active', 'false');
    await expect.element(button).toHaveAttribute('data-size', 'default');
  });

  it('keeps the menu button reachable with a tooltip', async () => {
    const user = setupUser();
    await render(
      <SidebarProvider>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">Settings</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarProvider>
    );

    await user.tab();
    await expect
      .element(page.getByRole('button', { name: 'Settings' }))
      .toHaveFocus();
  });

  it('renders a group label as a div by default', async () => {
    await render(
      <SidebarProvider>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
      </SidebarProvider>
    );
    const label = page.getByText('Platform');

    expect(label.element().tagName).toBe('DIV');
    await expect
      .element(label)
      .toHaveAttribute('data-slot', 'sidebar-group-label');
  });
});
