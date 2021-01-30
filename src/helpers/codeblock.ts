/**
 * create codeblock markdown.
 */
export const codeblock = (code: string, lang = ''): string =>
  ['```' + lang, code, '```'].join('\n')
