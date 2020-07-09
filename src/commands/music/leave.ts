import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';

export default class LeaveCommand implements Command {
  format: RegExp = /^((?<command>(leave|salir))+(\s(?<forced>(forced)))?)$/;
  names: string[] = ['leave', 'salir'];
  group: CommandGroup = 'music';
  description: string = 'Sacar al bot del canal de voz. (Si hay más de 2 oyentes se hará votación)';

  async onCommand(message: Message, bot: Client, params: { [key: string]: string }) {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, params.command));
        return;
      }

      if (!message.member.voice.channel) {
        await sendMessage(message, 'no estás en un canal de voz.', params.command);
        return;
      }

      const queue = YouTube.queues[message.guild.id];
      if (!queue || !queue.playing || !queue.playingDispatcher) {
        await sendMessage(message, 'no estoy reproduciendo música.', params.command);
        return;
      }

      if (!queue.voiceChannel.members.has(message.member.id)) {
        await sendMessage(message, 'no estás en el canal de voz.', params.command);
        return;
      }

      await YouTube.voteSystem(message, ['leave', params.command], params.forced === 'forced');
    } catch (error) {
      console.error('Leave Command', error);
    }
  }
}
