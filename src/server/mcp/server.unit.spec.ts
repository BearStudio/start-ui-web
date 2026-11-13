import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { afterEach, describe, expect, it } from 'vitest';

import { MCP_SCOPES } from '@/server/mcp/config';
import { createMcpServer } from '@/server/mcp/server';
import {
  mockDb,
  mockGetSession,
  mockUserHasPermission,
} from '@/server/routers/test-utils';

const now = new Date();

const mockUserFromDb = {
  id: 'user-1',
  name: 'Test User',
  email: 'user@example.com',
  emailVerified: true,
  image: null,
  createdAt: now,
  updatedAt: now,
  role: 'admin',
  banned: null,
  banReason: null,
  banExpires: null,
  onboardedAt: now,
};

const mockGenreFromDb = {
  id: 'genre-1',
  name: 'Fiction',
  color: '#ff0000',
  createdAt: now,
  updatedAt: now,
};

const clients: Client[] = [];

/**
 * Connects an MCP client to the server as if the /api/mcp route verified an
 * access token for `user-1` with the given scopes.
 */
const connect = async (scopes: string[]) => {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const authInfo: AuthInfo = {
    token: 'token',
    clientId: 'client-1',
    scopes,
    extra: { userId: 'user-1' },
  };
  const send = clientTransport.send.bind(clientTransport);
  clientTransport.send = (message, options) =>
    send(message, { ...options, authInfo });

  const server = await createMcpServer();
  await server.connect(serverTransport);

  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(clientTransport);
  clients.push(client);
  return client;
};

const getErrorCode = (result: Awaited<ReturnType<Client['callTool']>>) => {
  expect(result.isError).toBe(true);
  const [content] = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content!.text).code;
};

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()));
});

describe('MCP server', () => {
  it('should only expose the procedures that opted in with mcp.tool()', async () => {
    const client = await connect([MCP_SCOPES.read]);

    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'book_create',
      'book_deleteById',
      'book_getAll',
      'book_getById',
      'book_updateById',
      'genre_getAll',
    ]);
    const getAll = tools.find((tool) => tool.name === 'book_getAll');
    expect(getAll?.title).toBe('List books');
    expect(getAll?.annotations?.readOnlyHint).toBe(true);
    const deleteById = tools.find((tool) => tool.name === 'book_deleteById');
    expect(deleteById?.annotations?.destructiveHint).toBe(true);
  });

  it('should call the procedure as the token user, without session cookie', async () => {
    mockDb.user.findUnique.mockResolvedValue(mockUserFromDb);
    mockDb.genre.count.mockResolvedValue(1);
    mockDb.genre.findMany.mockResolvedValue([mockGenreFromDb]);
    const client = await connect([MCP_SCOPES.read]);

    const result = await client.callTool({
      name: 'genre_getAll',
      arguments: {},
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual({
      items: [
        {
          ...mockGenreFromDb,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      ],
      total: 1,
    });
    expect(mockGetSession).not.toHaveBeenCalled();
    // The MCP request carries a bearer token: the permission is checked
    // by user id, without the request headers
    expect(mockUserHasPermission).toHaveBeenCalledWith({
      headers: undefined,
      body: { userId: 'user-1', permissions: { genre: ['read'] } },
    });
  });

  it('should require the mcp:write scope for mutations', async () => {
    mockDb.user.findUnique.mockResolvedValue(mockUserFromDb);
    const client = await connect([MCP_SCOPES.read]);

    const result = await client.callTool({
      name: 'book_create',
      arguments: { title: 'Dune', author: 'Frank Herbert', genreId: 'genre-1' },
    });

    expect(getErrorCode(result)).toBe('FORBIDDEN');
    expect(mockUserHasPermission).not.toHaveBeenCalled();
  });

  it('should keep checking the user permissions', async () => {
    mockDb.user.findUnique.mockResolvedValue(mockUserFromDb);
    mockUserHasPermission.mockResolvedValue({ success: false, error: false });
    const client = await connect([MCP_SCOPES.read, MCP_SCOPES.write]);

    const result = await client.callTool({
      name: 'book_create',
      arguments: { title: 'Dune', author: 'Frank Herbert', genreId: 'genre-1' },
    });

    expect(getErrorCode(result)).toBe('FORBIDDEN');
  });

  it.each([
    ['unknown', null],
    ['banned', { ...mockUserFromDb, banned: true }],
    ['not onboarded', { ...mockUserFromDb, onboardedAt: null }],
  ])('should reject %s users', async (_, user) => {
    mockDb.user.findUnique.mockResolvedValue(user);
    const client = await connect([MCP_SCOPES.read]);

    const result = await client.callTool({
      name: 'genre_getAll',
      arguments: {},
    });

    expect(getErrorCode(result)).toBe('UNAUTHORIZED');
  });
});
