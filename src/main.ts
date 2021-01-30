import { App, MessageEmbed } from 'dxn'
import * as dotenv from 'dotenv'
import { registerColorPattern } from './color'
import * as chroma from 'chroma-js'
import { codeblock } from './helpers/codeblock'
import { registerColorGame } from './game'
dotenv.config()

const app = new App({
  prefixes: ['.'],
})

registerColorPattern(app)
registerColorGame(app)

app.command(
  'help',
  (message) => {
    const embed = new MessageEmbed()
      .setTitle('ヘルプ')
      .setColor(chroma.random().hex())

    for (const cmd of app.commands) {
      embed.addField(
        app.prefixes[0] + cmd.schema,
        codeblock(cmd.description || '説明がありません。')
      )
    }

    message.channel.send(embed)
  },
  'ヘルプを表示します。'
)

app.login(process.env.DISCORD_BOT_TOKEN)
