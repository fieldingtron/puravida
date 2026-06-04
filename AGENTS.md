# Pura Vida Agent Notes

## Secret Encryption

- Plaintext `.env` is gitignored.
- Encrypted environment file is `.env.enc`.
- `scripts/precommit-encrypt-secrets.cjs` decrypts `.env.enc` in memory when `PASSWORD` or `SECRETS_PASSWORD` is available and compares it to `.env`.
- If content differs, the helper re-encrypts `.env` and stages only `.env.enc`.
- If no password is available and `.env` exists, the hook blocks with instructions. It never stages plaintext secrets.
- Local pre-commit hook: `scripts/hooks/pre-commit`, installed to `.git/hooks/pre-commit`.
