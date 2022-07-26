const { ActionRowBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, ButtonBuilder } = require('discord.js');
const { ButtonStyle } = require('discord.js');
const fs = require('fs');
const file = 'txtfiles/bonk.txt';
const allowedRoles = [
  '386270894286176257',
  '791613603534733314'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bonk')
    .setDescription('Bonk someone!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('What do you want to add?')
        .addStringOption(option => option.setName('media').setDescription('The image/video you want to add!').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Which image do you want to delete?')
        .addStringOption(option => option.setName('media').setDescription('The image/video you want to delete!').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('count')
        .setDescription('Check how many images/videos are in this command!'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('send')
        .setDescription('Let the violence fly!')
        .addUserOption(option =>
          option.setName('user')
          .setDescription('Who do you want to bonk?'))),
  
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'add') {
      if (interaction.member.roles.cache.hasAny(...allowedRoles)) {
        const addition = interaction.options.getString('media');
        const text = fs.readFileSync(file, 'utf8');
        const textByLine = text.split('\n');
        if (textByLine.includes(addition)) {
          await interaction.reply('That image is already in the command, you big dummy!');
        }
        else {
          fs.appendFileSync(file, addition.toString('utf-8') + '\n');
          console.log(`${file} updated!`);
          const embed = new EmbedBuilder()
            .setTitle('やったー！')
            .setDescription('Your media has been successfully added!')
            .setColor(0xf6a7c0)
            .setImage(addition);
          await interaction.reply({ embeds: [embed] });
        }
      }
      else {
        await interaction.reply({ content: 'You\'re not allowed to do that! Why? \'cause I SAID SO!', ephemeral: true });
      }
    } else if (interaction.options.getSubcommand() === 'delete') {
      if (interaction.member.roles.cache.hasAny(...allowedRoles)) {
        const deletion = interaction.options.getString('media');
        const text = fs.readFileSync(file, 'utf8');
        const textByLine = text.split('\n')
        if (textByLine.includes(deletion)) {
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('yesdel')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Success)
                .setEmoji('476069723121909770'),
              new ButtonBuilder()
                .setCustomId('nodel')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('626539041495711773'),
            );
      
          const embed = new EmbedBuilder()
            .setTitle('Hold on!')
            .setDescription('Are you sure you want to delete this image?')
            .setColor(0xf6a7c0)
            .setImage(deletion);
          await interaction.reply({ embeds: [embed], components: [row] });
          const filter = i => i.customId;
          const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
          collector.on('collect', async i => {
            if (i.customId === 'yesdel') {
              let newArray = textByLine.filter(image => image !== deletion);
              let newFile = newArray.join('\n');
              fs.writeFileSync(file, newFile, (err) => {
                if (err) {
                  throw err;
                }
                console.log(`${file} updated!`);
              });
              await i.update({ content: 'Image successfully deleted! さよなら。。。', components: [], embeds: [] });
            }
            else if (i.customId === 'nodel') {
              await i.update({ content: 'Image was not deleted! Phew...', components: [], embeds: [] });
            }
          });
          collector.on('end', collected => console.log(`Collected ${collected.size} items`));
        } else {
          await interaction.reply('That media isn\'t in the command, you big dummy!');
        }
      } else {
        await interaction.reply({ content: 'You\'re not allowed to do that! Why? \'cause I SAID SO!', ephemeral: true });
      }
    } else if (interaction.options.getSubcommand() === 'count') {
      const text = fs.readFileSync(file).toString('utf-8');
      const textByLine = text.split('\n');
      await interaction.reply('There are ' + (textByLine.length - 1) + ' entries in this command!')
    } else if (interaction.options.getSubcommand() === 'send') {
      const user = interaction.options.getUser('user');
      if (!user) {
        await interaction.reply('You MISSED! How do you MISS?! The bonkee was RIGHT THERE! アホ！');
      }
      else {
        const text = fs.readFileSync(file).toString('utf-8');
        const textByLine = text.split('\n');
        const max = textByLine.length - 2;
        const selection = Math.floor(Math.random() * max);
        if (textByLine[selection].search('.mp4') != -1 || textByLine[selection].search('.webm') != -1 || textByLine[selection].search('.mov') != -1) {
          await interaction.reply(`<@${interaction.user.id}> bonked <@${user.id}>! 🩹` + textByLine[selection]);
        }
        else {
          if (user.id === '701454786976940152') {
            const embed = new EmbedBuilder()
              .setTitle('OWOWOWOWOWOWOWOW')
              .setColor(0xf6a7c0)
              .setImage(textByLine[selection]);
            await interaction.reply({ content: `OW! Why are you bonking ME?! OW! STOP DOING THAT OR I'LL GET REALLY MAD!`, embeds: [embed] });
          }
          else {
            const embed = new EmbedBuilder()
              .setTitle('THWACK!')
              .setColor(0xf6a7c0)
              .setImage(textByLine[selection]);
            await interaction.reply({ content: `<@${interaction.user.id}> bonked <@${user.id}>! 🩹`, embeds: [embed] });
          }
        }
      }
    }
  }
};