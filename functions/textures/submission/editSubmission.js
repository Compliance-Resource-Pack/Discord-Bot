const emojis = require('../../../ressources/emojis')

const { magnify } = require('../../../functions/textures/magnify')
const { palette } = require('../../../functions/textures/palette')

/**
 * Edit the embed of the submission
 * @author Juknum
 * @param {DiscordClient} client
 * @param {DiscordReaction} reaction
 * @param {DiscordUser} user
 */
async function editSubmission(client, reaction, user) {
  const message  = await reaction.message.fetch()
  const member   = await message.guild.members.cache.get(user.id)
  if (member.bot === true) return
  if (message.embeds.length == 0 || message.embeds[0].fields.length == 0) return

  const authorID = await message.embeds[0].fields[0].value.split('\n').map(el => el.replace('<@', '').replace('!', '').replace('>', ''))[0]

  if (reaction.emoji.id === emojis.SEE_MORE) {

    reaction.remove().catch(err => { if (process.DEBUG) console.error(err)} )

    let EMOJIS = [emojis.SEE_LESS, emojis.INSTAPASS, emojis.INVALID, emojis.DELETE, emojis.MAGNIFY, emojis.PALETTE]

    // if the message does not have up/down vote react, remove INSTAPASS & INVALID from the emojis list (already instapassed or votes flushed)
    if (!message.embeds[0].fields[1].value.includes('⏳')) EMOJIS = EMOJIS.filter(emoji => emoji !== emojis.INSTAPASS && emoji !== emojis.INVALID && emoji !== emojis.DELETE)

    // add reacts
    for (let i = 0; EMOJIS[i]; i++) await message.react(EMOJIS[i])

    // make the filter
    const filter = (REACT, USER) => {
      return EMOJIS.includes(REACT.emoji.id) && USER.id === user.id
    }

    // await reaction from the user
    message.awaitReactions(filter, { max: 1, time: 30000, errors: [ 'time' ] })
    .then(async collected => {
      const REACTION = collected.first()
      const USER_ID = collected.first().users.cache.array().filter(user => user.bot === false).map(user => user.id)[0]

      if (REACTION.emoji.id === emojis.PALETTE) palette(message, message.embeds[0].image.url, user.id)
      if (REACTION.emoji.id === emojis.MAGNIFY) magnify(message, message.embeds[0].image.url, user.id)

      /**
       * TODO: for instapass & flush reacts, check if the user who reacted have the Council role, and not admin perms
       */
      if (REACTION.emoji.id === emojis.INSTAPASS && member.hasPermission('ADMINISTRATOR')) {
        removeReact(message, [emojis.UPVOTE, emojis.DOWNVOTE])
        editEmbed(message, `<:instapass:${emojis.INSTAPASS}> Instapassed`)
      }
      if (REACTION.emoji.id === emojis.INVALID && member.hasPermission('ADMINISTRATOR')) {
        removeReact(message, [emojis.UPVOTE, emojis.DOWNVOTE])
        editEmbed(message, `<:invalid:${emojis.INVALID}> Invalid`)
      }

      // delete message only if the first author of the field 0 is the discord user who reacted, or if the user who react is admin
      if (REACTION.emoji.id === emojis.DELETE && (USER_ID === authorID || member.hasPermission('ADMINISTRATOR'))) return await message.delete()

      removeReact(message, EMOJIS)
      await message.react(client.emojis.cache.get(emojis.SEE_MORE))

    })
    .catch(async () => {
      if (!message.deleted) {
        removeReact(message, EMOJIS)
        await message.react(client.emojis.cache.get(emojis.SEE_MORE))
      }
    })
  }
  
}

async function editEmbed(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string
  await message.edit(embed)
}

async function removeReact(message, emojis) {
  for (let i = 0; emojis[i]; i++) {
    await message.reactions.cache.get(emojis[i]).remove()
    .catch(err => { if (process.DEBUG) console.error(`Can't remove emoji: ${emojis[i]}\n${err}`) })
  }
}

exports.editSubmission = editSubmission