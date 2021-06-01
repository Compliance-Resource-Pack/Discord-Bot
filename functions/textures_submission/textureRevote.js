const Discord = require('discord.js')
const colors  = require('../../ressources/colors')
const strings = require('../../ressources/strings')

const { countReact }  = require('../../helpers/countReact')
const { getMessages } = require('../../helpers/getMessages')

var embed = null

/**
 * Check if messages have enough reactions and send them to the output channel.
 * A message need 66.66% of upvote to be accepted.
 * @author Juknum
 * @param {Discord} client Discord Client
 * @param {String} inputID Discord Channel ID (Input)
 * @param {String} outputID Discord Channel ID (Output)
 * @param {Number} offset Number of day since the message have been posted
 */
async function textureRevote(client, inputID, outputID, offset) {

	let outputChannel = client.channels.cache.get(outputID)
	let limitDate     = new Date()
	let messages = await getMessages(client, inputID)

	limitDate.setDate(limitDate.getDate() - offset)

	for (var i in messages) {
		let message     = messages[i]
		let messageDate = new Date(message.createdTimestamp)

		let messageUpvote    = countReact(message,'⬆️')
		let messageDownvote  = countReact(message,'⬇️')
		let upvotePercentage = ((messageUpvote * 100) / (messageUpvote + messageDownvote)).toFixed(2)

		if (
			upvotePercentage >= 66.66 &&
			message.embeds[0] !== undefined &&
			messageDate.getDate() == limitDate.getDate() &&
			messageDate.getMonth() == limitDate.getMonth()
		) {

			embed = new Discord.MessageEmbed()
				.setColor(colors.GREEN)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(strings.TEXTURE_WIN_REVOTE)
				.addFields(
					{ name: 'Name:',   value: message.embeds[0].fields[0].value, inline: true },
					{ name: 'Folder:', value: message.embeds[0].fields[1].value, inline: true },
					{ name: 'Type:',   value: message.embeds[0].fields[2].value, inline: true },
					{ name: 'Percentage:', value: upvotePercentage+'% ⬆️', inline: false}
				)
			
			if (message.embeds[0].description != undefined) embed.addFields({ name: 'Comment:', value: message.embeds[0].fields[3].value })

			if (message.embeds[0].title) embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url)
			else embed.setImage(message.embeds[0].image.url)

			await outputChannel.send(embed)

		}
		
		else if (
			upvotePercentage < 66.66 &&
			message.embeds[0] !== undefined &&
			messageDate.getDate() == limitDate.getDate() &&
			messageDate.getMonth() == limitDate.getMonth()
		) {

			embed = new Discord.MessageEmbed()
				.setColor(colors.RED)
				.setAuthor(message.embeds[0].author.name, message.embeds[0].author.iconURL)
				.setDescription(strings.TEXTURE_DEFEAT_REVOTE)
				.addFields(
					{ name: 'Name:',   value: message.embeds[0].fields[0].value, inline: true },
					{ name: 'Folder:', value: message.embeds[0].fields[1].value, inline: true },
					{ name: 'Type:',   value: message.embeds[0].fields[2].value, inline: true },
					{ name: 'Percentage:', value: upvotePercentage+'% ⬆️ (<66.66%)', inline: false}
				)
			
			if (message.embeds[0].description != undefined) embed.addFields({ name: 'Comment:', value: message.embeds[0].fields[3].value })

			if (message.embeds[0].title) embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url)
			else embed.setImage(message.embeds[0].image.url)

			await outputChannel.send(embed)
		}
		
	}
}

exports.textureRevote = textureRevote
