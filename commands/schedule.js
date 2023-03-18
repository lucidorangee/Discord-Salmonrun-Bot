
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Replies with SR: New Wave schedule'),
	async execute(interaction) {
		try {
			const sc = await fetch('https://splatoon3.ink/data/schedules.json');
			const kr = await fetch('https://splatoon3.ink/data/locale/ko-KR.json');
			const schedule = await sc.json();
			const krnames = await kr.json();
			const coopSchedule = schedule.data.coopGroupingSchedule;
			const curSchedule = coopSchedule.regularSchedules.nodes[0];

			const startTime = curSchedule.startTime;
			const endTime = curSchedule.endTime;
			const stagename = curSchedule.setting.coopStage.name;
			const stageid = curSchedule.setting.coopStage.id;
			const weapon1 = curSchedule.setting.weapons[0];
			const weapon2 = curSchedule.setting.weapons[1];
			const weapon3 = curSchedule.setting.weapons[2];
			const weapon4 = curSchedule.setting.weapons[3];
			console.log(kr.stages);
			const krstagename = krnames.stages[stageid].name;
			await interaction.reply(`The current schedule stage is: ${JSON.stringify(stagename)}.`
			+`\nCurrent weapons are ${weapon1.name}, ${weapon2.name}, ${weapon3.name}, ${weapon4.name}.`
			+`\n현재 연어런 스테이지는: ${JSON.stringify(krstagename)}`
			+`\n현재 무기들은 ${krnames.weapons[weapon1.__splatoon3ink_id].name}, ${krnames.weapons[weapon2.__splatoon3ink_id].name}, ${krnames.weapons[weapon3.__splatoon3ink_id].name}, ${krnames.weapons[weapon4.__splatoon3ink_id].name}.`);
			
		} catch (error) {
			console.error(error);
			await interaction.reply('An error occurred while fetching the schedule.');
		}
	},
};