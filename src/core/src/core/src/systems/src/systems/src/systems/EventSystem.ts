import events from "../../data/events.json"

export class EventSystem {

  static getRandomEvent(player: any) {

    const validEvents = events.filter((event: any) => {

      return (
        player.age >= event.minAge &&
        player.age <= event.maxAge &&
        event.locations.includes(player.location)
)
    })

    if (validEvents.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * validEvents.length)

    return validEvents[randomIndex]

  }

}
