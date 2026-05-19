import React from "react"
import { View, Text, Button } from "react-native"

import { GameLoop } from "../core/GameLoop"
import { GameState } from "../core/GameState"

export default function GameScreen() {

  const player = GameState.player

  return (

    <View style={{ padding: 20 }}>

      <Text>Surviving South A</Text>

      <Text>Age: {player.age.toFixed(1)}</Text>

      <Text>Health: {player.stats.health}</Text>

      <Text>Energy: {player.stats.energy}</Text>

      <Text>Stress: {player.stats.stress}</Text>

      <Text>Money: R{player.money}</Text>

      <Button
        title="Next Month"
        onPress={() => GameLoop.nextMonth()}
      />

    </View>

  )

}
