import * as chroma from 'chroma-js'
import { App, Message, MessageEmbed, User } from 'dxn'
import { codeblock } from './helpers/codeblock'

type Game = {
  user: User
  startedAt: number
  onMessage(message: Message): void
} & {
  type: 'guess'
  color: string
}

let games: Game[] = []

export const getUserGame = (user: User): Game =>
  games.find((g) => g.user.id === user.id)

/**
 * register color game.
 */
export const registerColorGame = (app: App): void => {
  app.command('guess', (message) => {
    const inGame = getUserGame(message.author)

    if (inGame) {
      message.reply(`既にゲームに参加しています。\n`)
      return
    }

    const game: Game = {
      type: 'guess',
      user: message.author,
      color: chroma.random().hex(),
      startedAt: Date.now(),
      onMessage(ansMsg) {
        if (ansMsg.id === message.id) {
          return
        }

        const color = chroma(ansMsg.content).hex()
        const embed = new MessageEmbed()
          .setTitle('答え')
          .setColor(game.color)
          .addField(
            'スコア',
            codeblock(
              (100 - chroma.distance(game.color, color)).toFixed(2) + '%'
            )
          )
          .addField('答え', codeblock(game.color, 'css'))
          .addField('あなたの答え', codeblock(color, 'css'))
          .setImage(
            `http://placehold.jp/${color.slice(1)}/${color.slice(
              1
            )}/256x256.png`
          )

        ansMsg.reply(embed)

        games = games.filter((g) => g !== game)
      },
    }

    console.log(game.color)
    const embed = new MessageEmbed()
      .setTitle('色当てゲーム')
      .setColor(game.color)
      .setDescription(
        '画像の色を答えてください（例: `#00aaff`, `red`, `rgb(60, 128, 255)`）'
      )
      .setImage(
        `http://placehold.jp/${game.color.slice(1)}/${game.color.slice(
          1
        )}/256x256.png`
      )

    message.channel.send(embed)
    games.push(game)
  })

  app.client.on('message', (message) => {
    const game = getUserGame(message.author)

    if (game) {
      game.onMessage(message)
    }
  })
}

setInterval(() => {
  for (const game of games) {
    const time = Date.now() - game.startedAt

    if (time >= 100000) {
      console.log('remove', game)
      games = games.filter((g) => g !== game)
    }
  }
}, 1000)
