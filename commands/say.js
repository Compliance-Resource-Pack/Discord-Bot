uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'say',
	description: 'Make the bot send any message you specify',
	uses: 'Bot Developers',
	syntax: `${prefix}say [message] [attach a file]`,
	async execute(client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ) {
      if (!args.length) return await message.reply('You haven\'t specified a message to send!');
      else {

				if (message.attachments.size > 0) {
					await message.channel.send(args.join(" "), {files: [message.attachments.first().url]})
				} else {
					await message.channel.send(args.join(" "));
				}

        await message.delete().catch();
      }
    } else return
	}
};