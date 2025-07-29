# SkarmBot

## Features

 - Maintains databases and notifies subscribed channels about new releases of the following comics:
   - XKCD
   - Work Chronicles
 - Notifies users when someone says their name (or nickname, or otherwise brings up a topic of interest)
 - Notifies channels of events including members joining and leaving, bans, and username/nickname changes
 - Keeps track of server activity, and present the data for those interested in tidbits such as "the most common words that people say"
 - Holds conversations with users; "learns" based on chat history ([hilarity ensures](https://twitter.com/DragoniteSpam/status/1483687506923118593))
 - Sings songs, participate in Skyrim LARPs, and quote Douglas Adams with the best of them
 - Keeps chat colorful by randomizing the appearance of selected roles periodically
 - Rewards server members with roles based on activity in a server (as configured by server moderators)

## Getting Started

### Running Skarm as a Linux Service

```sh
mkdir /srv/skarm
cd /srv/skarm
git clone https://github.com/DragoniteSpam/SkarmBot.git

sudo nano /etc/systemd/system/skarm.service
```

Inside of Nano, write:
```ini
[Unit]
Description=Skarmbot
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=YOUR_USERNAME_GOES_HERE
ExecStart=/usr/bin/pwsh /srv/skarm/SkarmBot/launcher.ps1 live

[Install]
WantedBy=multi-user.target
```

Start the service by running
```bash
sudo systemctl enable skarm
```

### Service Control Commands
```bash
sudo systemctl status skarm
sudo systemctl start skarm
sudo systemctl restart skarm
sudo systemctl stop skarm
journalctl -u skarm.service # read log
journalctl -u skarm.service -f # follow real-time log
```


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
