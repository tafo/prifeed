# Security policy

Prifeed is a privacy-focused journal app. We take security and data integrity seriously.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Send a report by email to **security@prifeed.app** (or the maintainer's address listed in the GitHub profile until the domain is set up). If you want to use encryption, ask for a public PGP key in your first message.

Include in your report:

- A description of the issue
- Steps to reproduce
- The affected version (commit hash or release tag)
- The impact you see
- Any suggested fix

You will get a first response within 7 days. We will keep you updated until the issue is fixed or accepted as a known limitation.

## Scope

In scope:

- Code execution from untrusted input (entries, comments, file paths, etc.)
- Data integrity issues that can corrupt the SQLite database
- Privacy issues: any path where user data leaks outside the local machine without consent
- Update or build supply-chain issues

Out of scope:

- The user's local machine being compromised at the OS level (this is outside what an Electron app can defend against)
- Vulnerabilities in third-party services the user opts into (for example, future cloud sync providers)

## Disclosure

We follow coordinated disclosure. After a fix is shipped, we may publish a short note in the release that includes:

- A summary of the issue
- The affected versions
- Credit to the reporter, if you want to be named

If you prefer to stay anonymous, that is fine.

## Thanks

Reports from people who care about privacy and data safety make Prifeed better for everyone. Thank you.
