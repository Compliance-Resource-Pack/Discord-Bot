const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const fs       = require('fs');
const strings  = require('../../res/strings');
const colors   = require('../../res/colors');
const settings = require('../../settings.js');

const { warnUser }     = require('../../functions/warnUser.js');
const { modLog }       = require('../../functions/moderation/modLog.js');
const { addMutedRole } = require('../../functions/moderation/addMutedRole.js');
const { jsonModeration } = require('../../helpers/fileHandler');

module.exports = {
	name: 'warn',
	description: strings.HELP_DESC_WARN,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}warn <@user> <reason>`,
	example: `${prefix}warn @Juknum#6148 breaking the bot`,
	async execute(client, message, args) {

		if (message.member.hasPermission('BAN_MEMBERS')) {
			if (args != '') {
				const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
				const reason = args.slice(1).join(' ') || 'Not Specified';
				const role = message.guild.roles.cache.find(r => r.name === 'Muted');

				if (!member) return await warnUser(message, strings.WARN_SPECIFY_USER);

				if (member.id === message.author.id) return await warnUser(message, strings.WARN_CANT_WARN_SELF);

				if (member.id === client.user.id) return await message.channel.send(strings.COMMAND_NOIDONTTHINKIWILL_LMAO);
		
				// try to read this json
				let warnList = await jsonModeration.read();
				
				// invisible try
				try {

				var index = -1;
				for (var i = 0; i < warnList.length; i++) {
					if (warnList[i].user == `${member.id}`) {
						index = i;
						break;
					}
				}
					
				if(index != -1) {
					if (warnList[index].warn == undefined) warnList[index].warn = [reason];
					else warnList[index].warn.push(reason);

					if (warnList[index].warn.length >= 3) {
						var time = 864000 * ((warnList[index].warn.length) - 2); // 10 days * number of warn

						var mutedEmbed = new Discord.MessageEmbed()
							.setAuthor(message.author.tag, message.author.displayAvatarURL())
							.setDescription(`After ${warnList[index].warn.length} warns, ${member} has been muted for ${time/86400} days`)
							.setColor(colors.BLACK)
							.setTimestamp();

						for (var i = 0; i < warnList[index].warn.length; i++) {
							mutedEmbed.addFields({
								name: `Reason ${i+1}`, value: warnList[index].warn[i]
							})
						}

						message.channel.send(mutedEmbed);
						warnList[index].muted   = true;
						warnList[index].timeout = time;

						addMutedRole(client, member.id);
					}
				} else {
					warnList.push({
						"user": `${member.id}`,
						"warn": [reason],
						"muted": false,
						"timeout": 0
					})
				}

				var embed = new Discord.MessageEmbed()
					.setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setDescription(`Warned ${member} \nReason: ${reason}`)
					.setColor(colors.BLUE)
					.setTimestamp();
				const embedMessage = await message.channel.send(embed);
				await embedMessage.react('🗑️');
				const filter = (reaction, user) => {
					return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
				};

				embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first();
					if (reaction.emoji.name === '🗑️') {
						await embedMessage.delete();
						if (!message.deleted) await message.delete();
					}
				})
				.catch(async () => {
					await embedMessage.reactions.cache.get('🗑️').remove();
				});

				
				await jsonModeration.write(warnList);

				// invisible catch
				} catch(_error) {
					jsonModeration.release();
				}

				modLog(client, message, member, reason, time, 'warned');
				

			} else return warnUser(message,strings.COMMAND_PROVIDE_VALID_TAG);
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};