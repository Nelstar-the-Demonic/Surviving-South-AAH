import React from "react"
import { View, Text, Button } from "react-native"

export default function MainMenu({ navigation }: any) {

  return (

    <View style={{ padding: 20 }}>

      <Text
        style={{
          fontSize: 32,
          marginBottom: 20
        }}
      >
        Surviving South A
      </Text>

      <Button
        title="New Game"
        onPress={() => navigation.navigate("Game")}
      />

    </View>

  )

}
