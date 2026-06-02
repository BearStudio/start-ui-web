# WorkOS Adapter Boundary

WorkOS migration work belongs in this directory. Better Auth remains the active
provider until composition explicitly wires a WorkOS adapter.

Migration notes:

- Better Auth password hashes live in the `account` table for rows with
  `providerId = 'credential'`.
- Better Auth stores the full scrypt hash string, including parameters; do not
  strip prefixes or decode the hash before import.
- Organization imports must happen before users, password hashes, and
  memberships.
- Existing Better Auth sessions remain valid until expiry unless the Better Auth
  secret is rotated during a cutover.
