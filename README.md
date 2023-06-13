Typescript type dependencies
============================

This package vendors type dependencies for the handshake (e.g. @types/node).

This is part of the initiative to enable `typescript` type linting for
the `jsdoc`. Introducing [tsconfig.json](./tsconfig.template.json) and enabling
`checkJs` and `allowJs`, allows us to add additional type safety.

## Generating d.ts files

If you are interested in d.ts file and `npm run lint-types` does not return
error for the ported projects, you can use:
  `tsc -p . --noEmit false --emitDeclarationOnly --declaration --removeComments --outDir ts-types`
