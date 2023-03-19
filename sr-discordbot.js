// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, clientId, guildId, channelId } = require('./config.json');
const cron = require('cron');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});
client.commands = new Collection();

// URL to fetch the JSON data
const JSON_URL = 'https://splatoon3.ink/data/schedules.json';

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


// Start the scheduled message job
scheduledMessage.start();

//Schedule Change
let previousData;
client.once("ready", async () => {
  const kr = await fetch('https://splatoon3.ink/data/locale/ko-KR.json');
  const krnames = await kr.json();
  console.log(`Online as ${client.user.tag}`);
    
  let scheduledMessage = new cron.CronJob('0 * * * *', async () => {
  // This runs every day at 10:30:00, you can do anything you want
  // Specifing your guild (server) and your channel
     const guild = client.guilds.cache.get('193203190643032064');
     const channel = guild.channels.cache.get('193203190643032064');
     console.log("Checking!");

      //Check if sr schedule updated
      try{
        const sc = await fetch('https://splatoon3.ink/data/schedules.json');
        const schedule = await sc.json();
        const coopSchedule = schedule.data.coopGroupingSchedule;

        //Compare with previous hour
        if (previousData == undefined || (previousData !== undefined && JSON.stringify(coopSchedule) !== JSON.stringify(previousData))) {
          // If the data is different, send a message to the channel
          const curSchedule = coopSchedule.regularSchedules.nodes[0];

          const startTime = curSchedule.startTime;
          const endTime = curSchedule.endTime;
          const stagename = curSchedule.setting.coopStage.name;
          const stageid = curSchedule.setting.coopStage.id;
          const weapon1 = curSchedule.setting.weapons[0];
          const weapon2 = curSchedule.setting.weapons[1];
          const weapon3 = curSchedule.setting.weapons[2];
          const weapon4 = curSchedule.setting.weapons[3];

          const nextSchedule = coopSchedule.regularSchedules.nodes[1];

          const next_startTime = nextSchedule.startTime;
          const next_endTime = nextSchedule.endTime;
          const next_stagename = nextSchedule.setting.coopStage.name;
          const next_stageid = nextSchedule.setting.coopStage.id;
          const next_weapon1 = nextSchedule.setting.weapons[0];
          const next_weapon2 = nextSchedule.setting.weapons[1];
          const next_weapon3 = nextSchedule.setting.weapons[2];
          const next_weapon4 = nextSchedule.setting.weapons[3];

          await channel.send(`The Splatoon schedule has been updated!\n`
          +`The current schedule stage is: ${JSON.stringify(stagename)}.`
          +`\nCurrent weapons are ${weapon1.name}, ${weapon2.name}, ${weapon3.name}, ${weapon4.name}.`
          +`\n현재 연어런 스테이지는: ${JSON.stringify(krnames.stages[stageid].name)}`
          +`\n현재 무기들은 ${krnames.weapons[weapon1.__splatoon3ink_id].name}, ${krnames.weapons[weapon2.__splatoon3ink_id].name}, ${krnames.weapons[weapon3.__splatoon3ink_id].name}, ${krnames.weapons[weapon4.__splatoon3ink_id].name}.`
          +`\n\n`
          +`The next stage is: ${JSON.stringify(next_stagename)}.`
          +`\nNext weapons are ${next_weapon1.name}, ${next_weapon2.name}, ${next_weapon3.name}, ${next_weapon4.name}.`
          +`\n다음 연어런 스테이지는: ${JSON.stringify(krnames.stages[next_stageid].name)}`
          +`\n다음 무기들은 ${krnames.weapons[next_weapon1.__splatoon3ink_id].name}, ${krnames.weapons[next_weapon2.__splatoon3ink_id].name}, ${krnames.weapons[next_weapon3.__splatoon3ink_id].name}, ${krnames.weapons[next_weapon4.__splatoon3ink_id].name}.`


          );
        }

        previousData = coopSchedule;
      }catch(error){
        console.error(error);
      }
    });
        
    // When you want to start it, use:
    scheduledMessage.start()
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
client.login(token);