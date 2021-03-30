// Lipton Sparkling Ice Tea Classic 0,33L

// Libs:
require('dotenv').config();
const Discord   = require('discord.js');
const fs        = require('fs');
const cron      = require('cron');
const client    = new Discord.Client({ disableMentions: 'everyone' });
client.commands = new Discord.Collection();

// Admins & settings:
const uidR   = process.env.UIDR;
const prefix = process.env.PREFIX;

// Helpers:
const { jsonModeration } = require('./helpers/fileHandler');
const { autoReact }      = require('./functions/autoReact');
const { updateMembers }  = require('./functions/updateMembers.js');
const { walkSync }       = require('./functions/walkSync');

const { quote }    = require('./functions/quote');
//const { logs }     = require('./functions/logs');
const { warnUser } = require('./functions/warnUser.js');

const { textureSubmission } = require('./functions/textures_submission/textureSubmission.js');
const { textureCouncil }    = require('./functions/textures_submission/textureCouncil.js');
const { textureRevote }     = require('./functions/textures_submission/textureRevote.js');
const { getResults }        = require('./functions/textures_submission/getResults.js');
const { autoPush }          = require('./functions/autoPush.js');
const { doPush }            = require('./functions/doPush.js');

const { checkTimeout }      = require('./functions/moderation/checkTimeout.js');
const { addMutedRole }      = require('./functions/moderation/addMutedRole.js');
const { inviteDetection }   = require('./functions/moderation/inviteDetection.js');

// try to read this json
jsonModeration.read(false).then(warnList => { // YOU MUST NOT LOCK because only read

// Resources:
const colors  = require('./res/colors');
const strings = require('./res/strings');

// Import settings & commands handler:
const commandFiles = walkSync('./commands').filter(file => file.endsWith('.js'));
const settings     = require('./settings');

// Scheduled Functions:
// Texture submission process: (each day at 00:00 GMT)
let scheduledFunctions = new cron.CronJob('0 0 * * *', async () => {
	// C32x
	await textureSubmission(client, settings.C32_SUBMIT_1,  settings.C32_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await textureSubmission(client, settings.C32_SUBMIT_1B, settings.C32_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await    textureCouncil(client, settings.C32_SUBMIT_2,  settings.C32_SUBMIT_3, settings.C32_RESULTS, 1);	// 1 DAYS OFFSET
	await     textureRevote(client, settings.C32_SUBMIT_3,  settings.C32_RESULTS,  3);							// 3 DAYS OFFSET
	
	// C64x
	await textureSubmission(client, settings.C64_SUBMIT_1,  settings.C64_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await textureSubmission(client, settings.C64_SUBMIT_1B, settings.C64_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await    textureCouncil(client, settings.C64_SUBMIT_2,  settings.C64_SUBMIT_3, settings.C64_RESULTS, 1);	// 1 DAYS OFFSET
	await     textureRevote(client, settings.C64_SUBMIT_3,  settings.C64_RESULTS,  3);							// 3 DAYS OFFSET
	
});

// Texture submission push: (each day at 00:10 GMT)
let pushToGithub = new cron.CronJob('10 0 * * *', async () => {
	// Download textures from #results
	await getResults(client, settings.C32_RESULTS);
	await getResults(client, settings.C64_RESULTS);

	await doPush();	// Push them trough GitHub
});

// Moderation timeout check : (each 30s)
setInterval(function() {checkTimeout(client)},30000)

require('./webapp/app')

// Bot status:
client.on('ready', async () => {
	const activities_list = [
		"compliancepack.net",
		"Bot Simulator 2077",
		"Minecraft with Compliance 32x",
		"Minecraft with Compliance 64x",
		"Detroit: Become Human"
	];

	if (process.env.MAINTENANCE.toLowerCase() === 'true') client.user.setPresence({ activity: { name: 'maintenance' }, status: 'dnd' });
	else setInterval(() => {
		var activity = activities_list[Math.floor(Math.random()*activities_list.length)]
		client.user.setActivity(activity, {type: 'PLAYING'});
	}, 600000);

	/*
	 * ENABLE TEXTURE SUBMISSION PROCESS
	 */
	scheduledFunctions.start();
	pushToGithub.start();

	/*
	 * UPDATE MEMBERS
	 */
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);

	console.log(`--------------------------------------------------------------\n\n\n─=≡Σ((( つ◕ل͜◕)つ\nJavaScript is a pain, but I'm fine, I hope...\n\n\n--------------------------------------------------------------\n`);

	// get out if no channel, no cache or empty cache
	if(client.channels === undefined || client.channels.cache === undefined || client.channels.cache.length === 0) return;

	// get out if history channel not found
	const destinationChannel = client.channels.cache.get('785867553095548948');
	if(destinationChannel === undefined) return;

	const embed = new Discord.MessageEmbed()
		.setTitle('Started')
		.setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
		.setColor(colors.GREEN)
		.setTimestamp();
	await destinationChannel.send(embed);
});

/*
 * MEMBER JOIN
 */
client.on('guildMemberAdd', async member =>{
	// Muted role check:
	for (var i = 0; i < warnList.length; i++) {
		if (`${member.id}` == warnList[i].user && warnList[i].muted == true) {
			const role = member.guild.roles.cache.find(r => r.name === 'Muted');
			await member.roles.add(role);
		}
	}

	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);
});

/*
 * MEMBER LEFT
 */
client.on('guildMemberRemove', async member =>{
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);
});

/*
 * BOT ADD OR REMOVE
 */
client.on('guildCreate', async guild =>{
	var joinLeaveChannel = client.channels.cache.get('823891571547308053');

	var embed = new Discord.MessageEmbed()
		.setThumbnail(guild.iconURL())
		.setColor(colors.YELLOW)
		.setTitle(`I was added to a server!`)
		.setDescription('Please check if this action was intended.')
		.addFields(
			{ name: 'Name:', value: `\`${guild.name}\``},
			{ name: 'ID:', value: `\`${guild.id}\``},
			{ name: 'Owner:', value: `\`${guild.owner.user.tag}\` | \`${guild.owner.id}\``},
		)
		.setTimestamp()

	await joinLeaveChannel.send(embed);
});

client.on('guildDelete', async guild =>{
	var joinLeaveChannel = client.channels.cache.get('823891571547308053');

	var embed = new Discord.MessageEmbed()
		.setThumbnail(guild.iconURL())
		.setColor(colors.YELLOW)
		.setTitle(`I was removed from a server!`)
		.setDescription('Please check if this action was intended.')
		.addFields(
			{ name: 'Name:', value: `\`${guild.name}\``},
			{ name: 'ID:', value: `\`${guild.id}\``},
			{ name: 'Owner:', value: `\`${guild.owner.user.tag}\` | \`${guild.owner.id}\``},
		)
		.setTimestamp()

	await joinLeaveChannel.send(embed);
});

/*
 * COMMAND HANDLER
 * - Automated: /commands & below
 * - Easter Eggs & others: below
 */
for (const file of commandFiles) {
	const command = require(file);
	client.commands.set(command.name, command);
}

/*
 * COMMAND HANDLER
 */
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITHOUT prefix & bot messages

	if (process.env.MAINTENANCE === 'true' && message.author.id !== uidR) {
		const msg = await message.reply(strings.COMMAND_MAINTENANCE);
		await message.react('❌');
		await msg.delete({timeout: 30000});
	}
	
	const args        = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command     = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return warnUser(message,strings.CANT_EXECUTE_IN_DMS);
	}

	command.execute(client, message, args).catch(async error => {
		console.error(error);
		const embed = new Discord.MessageEmbed()
			.setColor(colors.RED)
			.setTitle(strings.BOT_ERROR)
			.setDescription(strings.COMMAND_ERROR);

		await message.channel.send(embed)
		await message.react('❌');
	})

	/*
	 * COMMAND HISTORY
	 */

	// get out if no channel, no cache or empty cache
	if (client.channels === undefined || client.channels.cache === undefined || client.channels.cache.length === 0) return;

	if (message.channel.type === 'dm') return;

	// get out if history channel not found
	const destinationChannel = client.channels.cache.get('785867690627039232');
	if (destinationChannel === undefined) return;

	// eventually create the embed and send it

	var embed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.displayAvatarURL())
		.setColor(colors.BLUE)
		.setDescription(`[Jump to location](${message.url})\n\n**Command**: \`${commandName}\`\n**Channel**: <#${message.channel.id}>\n**Guild**: \`${message.guild}\`\n**User ID**: \`${message.author.id}\`\n**Message ID**: \`${message.id}\`\n**Command Sent**: \`${message.createdAt.toLocaleString()}\``)
		.setTimestamp()

	await destinationChannel.send(embed);
});

/*
 * EASTER EGGS & CUSTOM COMMANDS:
 */
client.on('message', async message => {
	/*for (var i = 0; i < warnList.length; i++) {
		if (warnList[i].user == message.author.id && warnList[i].muted == true) {
			//message.delete();
			addMutedRole(client, message.author.id);
		}
	}*/

	if (message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITH prefix & bot messages

	/*
	 * Mod Assistance
	 */
	//keywordsDetection(client, message);

	/*
	 * Funny Stuff
	 */
	if (message.content.includes('(╯°□°）╯︵ ┻━┻')) return await message.reply('┬─┬ ノ( ゜-゜ノ) calm down bro');

	if (message.content === 'F' ) return await message.react('🇫');

	if (message.content.toLowerCase() === 'engineer gaming' ) return await message.react('👷‍♂️');

	if (message.content.toLowerCase() === 'mhhh') {
		const embed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} translated: ${message.content}`, message.author.displayAvatarURL())
			.setDescription('```Uh-oh moment```')
			.setColor(colors.BLUE)
			.setFooter('Swahili → English', settings.BOT_IMG);
		return await message.channel.send(embed);
	}

	if (message.content.toLowerCase() === 'band') {
		await message.react('🎤');
		await message.react('🎸');
		await message.react('🥁');
		await message.react('🎺');
		await message.react('🎹');
		return;
	}

	if (message.content.toLowerCase() === 'hello there') {
		if (Math.floor(Math.random() * Math.floor(5)) != 1) return await message.channel.send('https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif');
		else return await message.channel.send('https://preview.redd.it/6n6zu25c66211.png?width=960&crop=smart&auto=webp&s=62024911a6d6dd85f83a2eb305df6082f118c8d1');
	}

	/*
	 * MESSAGE URL QUOTE
	 * when someone send a message with https://discord.com/channels/<server ID>/<channel ID>/<message ID>
	 */
	if (message.content.includes('https://discord.com/channels/') || message.content.includes('https://discordapp.com/channels')) quote(message);

	/*
	 * DISCORD SERVER INVITE DETECTION
	 * I hope there is no other use of this link type on Discord
	 * Found more information here: https://youtu.be/-51AfyMqnpI
	 */
	if (message.content.includes('https://discord.gg/') && message.guild.id != '814198513847631944') inviteDetection(client, message);

	/*
	 * AUTO REACT:
	 * (does not interfer with submission process)
	 */

	if (message.channel.id === '779759327665848320') {
		return autoReactMainPack(
			message,
			['⬆️','⬇️'],
			['You need to name your submission!', 'You need to add the folder!', 'You need to add the resource pack type! (java/bedrock)', 'Wrong resource pack type specified! (java/bedrock)'],
			['java', 'bedrock']
		)
	}

	// Texture submission Compliance 32x (#submit-texture):
	if (message.channel.id === settings.C32_SUBMIT_1 || message.channel.id === settings.C32_SUBMIT_1B) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture folder of your texture between []:\n`texture_name [folder] (comment -> optional)`',
			['[',']']
		);
	}

	// Texture submission Compliance 64x (#submit-texture):
	if (message.channel.id === settings.C64_SUBMIT_1 || message.channel.id === settings.C64_SUBMIT_1B) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture folder of your texture between []:\n`texture_name [folder] (comment -> optional)`',
			['[',']']
		);
	}

	// Texture submission Compliance Dungeons:
	if (message.channel.id === settings.CDUNGEONS_SUBMIT) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture path to your submission:\n`**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`',
			['(',')']
		);
	}

	// Texture submission Emulated Vattic Textures (FHLX):
	if (message.channel.id === '814209343502286899' || message.channel.id === '814201529032114226') {
		return autoReact(
			message,
			['814569395493011477','814569427546144812'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			undefined,
			undefined
		);
	}
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
	if (newMessage.content.startsWith(prefix) || newMessage.author.bot) return; // Avoid message WITH prefix & bot messages

	/*
	 * MODERATION
	 */
	//keywordsDetection(client, newMessage);

	/*
	 * MESSAGE URL QUOTE
	 * when someone sends a message with https://discord.com/channels/<server ID>/<channel ID>/<message ID>
	 */
	if (newMessage.content.includes('https://discord.com/channels/') || newMessage.content.includes('https://discordapp.com/channels')) quote(newMessage);

	/*
	 * MESSAGE LOGS : 
	*/
	//if (newMessage.guild.id == settings.C64_ID) logs(client, settings.C64_ID, oldMessage, newMessage, false);
	//if (newMessage.guild.id == settings.C32_ID) logs(client, settings.C32_ID, oldMessage, newMessage, false);
});

client.on('messageDelete', async message => {
	if (message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITH prefix & bot messages
	/*
	 * MESSAGE LOGS : 
	*/
	//if (message.guild.id == settings.C64_ID) logs(client, settings.C64_ID, undefined, message, true);
	//if (message.guild.id == settings.C32_ID) logs(client, settings.C32_ID, undefined, message, true);
});


}).catch(error => {
	console.trace(error)
})

// Login the bot
client.login(process.env.CLIENT_TOKEN).catch(console.error);