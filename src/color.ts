import { App, MessageEmbed, TextChannel } from 'dxn'
import * as chroma from 'chroma-js'
import { codeblock } from './helpers/codeblock'
import { getUserGame } from './game'

const callString = (f: string, args: (string | number)[]) =>
  `${f}(${args.join(', ')})`

const sendColorInfo = (channel: TextChannel, color: number) => {
  const data = chroma(color)

  const hexString = color.toString(16).padStart(6, '0')
  const image = `http://placehold.jp/${hexString}/${hexString}/256x256.png`
  const name = data.name()
  const rgb = data.rgb()

  const embed = new MessageEmbed()
    .setTitle(name)
    .setImage(image)
    .addField('hex', codeblock(`#${hexString}`, 'css'))
    .addField('rgb', codeblock(callString('rgb', rgb), 'css'))

  channel.send(embed)
}

/**
 * register color pattern.
 */
export const registerColorPattern = (app: App): void => {
  app.client.on('message', ({ content, channel, author }) => {
    if (getUserGame(author)) {
      return
    }

    try {
      const color = chroma(content)

      sendColorInfo(channel as TextChannel, color.num())
    } catch {
      //
    }
  })

  app.command(
    'grad {a: string} {b: string}',
    (message, { args }) => {
      if (getUserGame(message.author)) {
        return
      }

      const a = chroma(args.a)
      const b = chroma(args.b)
      const image = encodeURI(
        `http://placehold.jp/99ccff/ffffff/256x256.png?text= &css={"background":"-webkit-gradient(linear, left top, right bottom, from(${a.css()}), to(${b.css()}))"}`
      )

      const embed = new MessageEmbed()
        .setTitle(`Gradation \`${a.hex()}\` → \`${b.hex()}\``)
        .setImage(image)
        .addField('from', codeblock(a.hex(), 'css'))
        .addField('to', codeblock(b.hex(), 'css'))

      message.channel.send(embed)
    },
    'グラデーションを表示します。'
  )
}
