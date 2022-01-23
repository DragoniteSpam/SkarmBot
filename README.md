# SkarmBot

## Features

 - Maintains an XKCD database and notifies subscribed channels about new releases
 - Notify users when someone says their name (or nickname, or otherwise brings up a topic of interest)
 - Keep track of server activity, and present the data for those interested in tidbits such as "the most common words that people say"
 - Hold conversations with users; "learns" based on chat history ([hilarity ensures](https://twitter.com/DragoniteSpam/status/1483687506923118593))
 - Sing songs, participate in Skyrim LARPs, and quote Douglas Adams with the best of them
 - Keep chat colorful by randomizing the appearance of selected roles periodically

## Getting Started

### Adding Skarmbot to a Server
Skarmbot is hosted by the developers and can simply be added to a discord server with the link below.  
[Ask your Server Administrators to add Skarm to your favorite server today!](https://discordapp.com/oauth2/authorize?client_id=319291086570913806&scope=bot)

### Hosting Skarmbot
1. Clone the repository locally by running `git clone https://github.com/DragoniteSpam/SkarmBot.git`
2. Install Box Drive and log in with credentials that have access to the database repository `skarmData`
3. Run the powershell script `initialize-Dependencies.ps1` to install node.js and all required packages to execute skarmbot
4. Resolve any errors identified by the initialization script so that another run of it confirms that all node packages are installed, all data files are present, and all tokens are present
5. Run the powershell script `.\launcher.ps1 -operationMode live` to host the live instance of SkarmBot
6. Run the powershell script `.\launcher.ps1 -operationMode test` to host the test instance of SkarmBot
