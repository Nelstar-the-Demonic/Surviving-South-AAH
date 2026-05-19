import { GameState } from "./GameState"
import { EventSystem } from "./systems/EventSystem"

export class GameLoop {

  static nextMonth() {

    const player = GameState.player

    player.age += 0.08

    const event = EventSystem.getRandomEvent(player)

    console.log("New Month")

    console.log("Age:", player.age.toFixed(1))

    if (event) {

      console.log("Event:", event.title)
      console.log(event.description)

    } else {

      console.log("No event this month.")

    }

  }

}
