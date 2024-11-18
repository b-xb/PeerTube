/* SystemJS module definition */
// eslint-disable-next-line no-var
declare var module: NodeModule

interface NodeModule {
  id: string
}

declare module 'markdown-it-emoji/lib/light.mjs'

// FIXME: remove color-bits upgrade (with https://github.com/romgrk/color-bits/commit/ea01b950ab89e5ea7a85471642b95dd1fbffb68d included)
declare module 'color-bits'
