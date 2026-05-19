export class StatSystem {

  static updateStat(player: any, stat: string, amount: number) {

    if (player.stats[stat] !== undefined) {
      player.stats[stat] += amount
    }

    if (player.battleStats[stat] !== undefined) {
      player.battleStats[stat] += amount
    }

    if (player.workStats[stat] !== undefined) {
      player.workStats[stat] += amount
    }

  }

}
