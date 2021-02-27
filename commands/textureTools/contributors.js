const Discord = require('discord.js');
const fs      = require('fs');

const prefix  = process.env.PREFIX;
const strings = require('../../res/strings');

const { autoPush } = require('../../functions/autoPush.js');
const { warnUser } = require('../../functions/warnUser.js');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

module.exports = {
	name: 'contributors',
	aliases: [ 'contributor' ],
	description: 'Use: `/contributors add ...` to add a new author.\nuse: `/contributors remove ...` to remove a contributor',
	guildOnly: false,
	uses: 'Moderators',
	syntax: `${prefix}contributors <add/remove> <path+texture name> <type> <c32/c64> <author>`,

	async execute(client, message, args) {
		if (message.member.hasPermission('ADMINISTRATOR')) {

			if (args[0] == 'add' || args[0] == 'remove') {
				var textures        = jsonContributionsJava.read();
				var texturesBedrock = jsonContributionsBedrock.read();
				var index = -1;

				if (!args[4].includes('#') || args[4] == undefined) return warnUser(message, 'The author must be a Discord Tag, ex: `Name#1234`');

				try {
					client.users.cache.find(u => u.tag === args[4]).id
				} catch(error) {
					return warnUser(message, 'This user doesn\'t exist!');
				}
				args[4] = client.users.cache.find(u => u.tag === args[4]).id;

				if (args[2].toLowerCase() == 'java') {
					for (var i = 0; i < textures.length; i++) {
						if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(args[1])) {
							index = i;
							break;
						}
					}

					if (index != -1) {
						if (args[3] == 'c32') {
							if (args[0] == 'add') {
								if (textures[index].c32.author == undefined) textures[index].c32.author = [args[4]];
								else if (!textures[index].c32.author.includes(args[4])) textures[index].c32.author.push(args[4]);
							}
							if (args[0] == 'remove') {
								if (textures[index].c32.author == undefined) return warnUser(message, 'This texture doesn\'t have an author!');
								else if (textures[index].c32.author.includes(args[4])) {
									if (textures[index].c32.author.length > 1) textures[index].c32.author = arrayRemove(textures[index].c32.author, args[4]);
									else textures[index].c32 = {};
								} else return warnUser(message, 'This author doesn\'t exist');
							}

						} else if (args[3] == 'c64') {
							if (args[0] == 'add') {
								if (textures[index].c64.author == undefined) textures[index].c64.author = [args[4]];
								else if (!textures[index].c64.author.includes(args[4])) textures[index].c64.author.push(args[4]);
							}
							if (args[0] == 'remove') {
								if (textures[index].c64.author == undefined) return warnUser(message, 'This texture doesn\'t have an author!');
								else if (textures[index].c64.author.includes(args[4])) {
									if (textures[index].c64.author.length > 1) textures[index].c64.author = arrayRemove(textures[index].c64.author, args[4]);
									else textures[index].c64 = {};
								} else return warnUser(message, 'This author doesn\'t exist');
							}
						} else return warnUser(message,'Unknown category, please use `c32` or `c64` yours: '+args[3]);
					} else return warnUser(message, 'Unknown texture, please check spelling');

					jsonContributionsJava.write(textures);

				} 
				else if (args[2].toLowerCase() == 'bedrock') {
					for (var i = 0; i < texturesBedrock.length; i++) {
						if (texturesBedrock[i].path.includes(args[1])) {
							index = i;
							break;
						}
					}

					if (index != -1) {
						if (args[3] == 'c32') {
							if (args[0] == 'add') {
								if (texturesBedrock[index].c32.author == undefined) texturesBedrock[index].c32.author = [args[4]];
								else if (!texturesBedrock[index].c32.author.includes(args[4])) texturesBedrock[index].c32.author.push(args[4]);
							}
							if (args[0] == 'remove') {
								if (texturesBedrock[index].c32.author == undefined) return warnUser(message, 'This texture doesn\'t have an author!');
								else if (texturesBedrock[index].c32.author.includes(args[4])) {
									if (texturesBedrock[index].c32.author.length > 1) texturesBedrock[index].c32.author = arrayRemove(texturesBedrock[index].c32.author, args[4]);
									else texturesBedrock[index].c32 = {};
								} else return warnUser(message, 'This author doesn\'t exist');
							}

						} else if (args[3] == 'c64') {
							if (args[0] == 'add') {
								if (texturesBedrock[index].c64.author == undefined) texturesBedrock[index].c64.author = [args[4]];
								else if (!texturesBedrock[index].c64.author.includes(args[4])) texturesBedrock[index].c64.author.push(args[4]);
							}
							if (args[0] == 'remove') {
								if (texturesBedrock[index].c64.author == undefined) return warnUser(message, 'This texture doesn\'t have an author!');
								else if (texturesBedrock[index].c64.author.includes(args[4])) {
									if (texturesBedrock[index].c64.author.length > 1) texturesBedrock[index].c64.author = arrayRemove(texturesBedrock[index].c64.author, args[4]);
									else texturesBedrock[index].c64 = {};
								} else return warnUser(message, 'This author doesn\'t exist');
							}

						} else return warnUser(message,'Unknown categorie, please use `c32` or `c64` yours: '+args[3]);
					} else return warnUser(message, 'Unknown texture, please check spelling');

					jsonContributionsBedrock.write(texturesBedrock);

				} else return warnUser(message,'Unknown resource pack type, please use `java` or `bedrock` your: '+args[2]);
			}

			autoPush('Compliance-Resource-Pack', 'JSON', 'main', `Added/Removed ${args[4]} from ${args[1]}, by: ${message.author.username}`, `./json`);
			await message.react('✅');
			
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
}

function arrayRemove(arr, value) {
	return arr.filter(function(ele){ 
		return ele != value;
	});
}