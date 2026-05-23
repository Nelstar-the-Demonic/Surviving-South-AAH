extends Node
## Player stats management system

class_name PlayerStats

var hunger: int = 50
var health: int = 75
var stress: int = 40
var energy: int = 100
var hygiene: int = 60
var hope: int = 50
var money: float = 100.0
var reputation: int = 0
var relationships: Dictionary = {}  # npc_id: relationship_value

func initialize(background: String) -> void:
	# Set starting stats based on background
	match background:
		"unemployed_graduate":
			hope = 70
			money = 200.0
			reputation = 15
			energy = 80
		"township_hustler":
			reputation = 30
			money = 100.0
			energy = 90
			stress = 60
		"struggling_farmer":
			money = 150.0
			health = 85
			hope = 40
		"unemployed_youth":
			energy = 95
			stress = 70
			hope = 30
			money = 50.0
		"informal_worker":
			money = 120.0
			energy = 85
			stress = 55

func add_stat(stat_name: String, amount: int) -> void:
	match stat_name:
		"hunger":
			hunger = clampi(hunger + amount, 0, 100)
		"health":
			health = clampi(health + amount, 0, 100)
		"stress":
			stress = clampi(stress + amount, 0, 100)
		"energy":
			energy = clampi(energy + amount, 0, 100)
		"hygiene":
			hygiene = clampi(hygiene + amount, 0, 100)
		"hope":
			hope = clampi(hope + amount, 0, 100)

func daily_decay() -> void:
	# Simulate daily stat changes
	hunger = clampi(hunger + 5, 0, 100)
	energy = clampi(energy - 15, 0, 100)
	hyiene = clampi(hygiene - 2, 0, 100)
	
	if hunger > 80:
		health = clampi(health - 3, 0, 100)
	
	if stress > 80:
		energy = clampi(energy - 5, 0, 100)

func check_critical_thresholds() -> Array[String]:
	var warnings: Array[String] = []
	
	if hunger > 80:
		warnings.append("CRITICAL: You're starving!")
	if health < 30:
		warnings.append("CRITICAL: Your health is failing!")
	if stress > 90:
		warnings.append("CRITICAL: Your stress is unbearable!")
	if hope < 10:
		warnings.append("CRITICAL: You're losing hope!")
	if money < 10:
		warnings.append("WARNING: You have almost no money!")
	
	return warnings
