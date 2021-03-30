<img src="https://i.imgur.com/Hf0eeiU.png" alt="CompliBot" align="right" height="256px">
<div align="center">
  <h1>CompliBot</h1>
  <h3>The official bot of all Compliance Resource Pack discords</h3>

![RepoSize](https://img.shields.io/github/repo-size/Compliance-Resource-Pack/Discord-Bot)
![Issues](https://img.shields.io/github/issues/Compliance-Resource-Pack/Discord-Bot)
![PullRequests](https://img.shields.io/github/issues-pr/Compliance-Resource-Pack/Discord-Bot)
</div>

___
### Online on:
- [Compliance 32x](https://discord.gg/sN9YRQbBv7)
- [Compliance 64x](https://discord.gg/Tqtwtgh)
- [Compliance Addons](https://discord.gg/qVeDfZw)
- [Compliance Tweaks](https://discord.gg/6psYdRF)
- [Compliance Dungeons](https://discord.gg/eeVpygu)
- [Compliance Mods](https://discord.gg/QF2CAX7)

___
### Installation and launching:
- Install **[Node.js](https://nodejs.org/)** on your machine. **Version 14.0.0 or newer is required!**
- Clone the repository on your machine.
- Open your console in the cloned repository.
- To complete the installation, write the following command in the console:
```console
npm install --save-dev
```
- After installation, you will need to **[configure the bot](#bot-config:)**.
- To start the bot, write the following command in the console:
```console
node .
```
- Or when you're on Windows, you can just open the `start.bat` file

___
###   Web app:

To only start web app :

```
npm run webapponly
```

And go to :
```
http://localhost:3000/webapp
```
___
### Bot config:

**DISCLAIMER: We won't help you rebranding the bot for any other server. If you really want to do that, then you need to figure it out yourself.**

- Create an app on the **[Discord Developer Portal](https://discord.com/developers/)**.
- Go to the **Bot** tab, create a bot and copy its token.
- Create a file named **.env** or rename the **.env.example** file to **.env**.
- Open the **.env** file using any text editor.
- This file contains general bot settings in this format:

|Field name|Example value|Description|
|:---:|:---:|:---:|
|CLIENT_TOKEN|"-"|The token you copied from the Developer Portal, used to login the bot.|
|PREFIX|"/"|This is the character used to execute commands.|
|UIDR, UIDJ & UIDD|"123456789123456789"|The user id's of the three bot maintainers.|
|MAINTENANCE|"false"|Makes all commands maintainer-only, sets status to dnd.|
|COMPLIBOT_GIT_TOKEN|"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"|Git token for the CompliBot account to push textures.|
|MODS|"987654321987654321"|The id's of all people with a moderator role or higher, used for the modping command.|

There also is `strings.js` and `settings.js` with various other settings, but that aren't needed for the bot to run.
