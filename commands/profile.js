const prefix = process.env.PREFIX;
const fs     = require('fs');

const Discord   = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();

const settings         = require('../settings.js');
const colors           = require('../res/colors.js');
const strings          = require('../res/strings');
const { warnUser }     = require('../functions/warnUser.js');
const { jsonProfiles } = require('../helpers/fileHandler.js');

const NO_PROFILE_FOUND = -1

module.exports = {
	name: 'profile',
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}profile username <Your Name>\n${prefix}profile uuid <Your MC uuid (full uuid)>\n${prefix}profile show -> Display what the bot knows about you`,
	description: strings.HELP_DESC_PROFILE,
	guildOnly: false,
	async execute(client, message, args) {
		if(args[0] !== 'username' && args[0] !== 'uuid' && args[0] !== 'show')
			return await warnUser(message, 'Incorrect argument, expected username, uuid or show')

		// load profiles and lock
		const profiles = await jsonProfiles.read()

		try {
			let authorProfileIndex = NO_PROFILE_FOUND
			let i = 0

			// search message author profile
			while(i < profiles.length && authorProfileIndex == NO_PROFILE_FOUND) {
				if(profiles[i].id === message.author.id)
					authorProfileIndex = i
				++i
			}

			// if not found, add an empty one
			if(authorProfileIndex == NO_PROFILE_FOUND) {
				profiles.push({
					username: null,
					uuid: null,
					id: message.author.id,
					type: 'member'
				})
			}

			if(args[0] === 'show') {
				showProfile(message, profiles[authorProfileIndex].username, profiles[authorProfileIndex].uuid, profiles[authorProfileIndex].type)
			}
			else {
				// determine value
				let value = ''
				for(i = 1; i < args.length; ++i) {
					value += `${ args[i] } `
				}
				value = value.trim()
				
				if(args[0] === 'username') {
					profiles[authorProfileIndex].username = value
				}
				else { // else its UUID
					profiles[authorProfileIndex].uuid = value
				}
			}

			// write and release
			await jsonProfiles.write(profiles)

			// react
			return await message.react('✅')
		} catch(error) {
			jsonProfiles.release()
			console.error(error)
			return await warnUser(message, error.toString())
		}
	}
}

function showProfile(message, username = 'None', uuid = 'None', type = 'member') {
	if (username == null) username = 'None';
	if (uuid == null) uuid = 'None';

	var embed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.avatarURL())
		.addFields(
			{ name: 'Website Username', value: username          },
			{ name: 'Minecraft UUID',   value: uuid              },
			{ name: 'Discord ID',       value: message.author.id },
			{ name: 'Type',             value: type              }
		)
		.setColor(colors.BLUE)
		.setFooter(message.client.user.username, settings.BOT_IMG);

	return message.reply(embed);
}