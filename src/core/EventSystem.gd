## Event System
## Manages random events and their outcomes
## Godot 4.2+ | GDScript

extends Node

class_name EventSystem

# Event database
var all_events: Dictionary = {}
var event_history: Array = []

# Active events
var daily_events: Array = []

# Signals
signal event_triggered
signal event_resolved

func _ready() -> void:
	load_event_data()

func load_event_data() -> void:
	"""Load events from JSON data file"""
	var events_json = load("res://src/data/events.json")
	if events_json:
		all_events = JSON.parse_string(events_json.get_text())

func get_daily_events() -> Array:
	"""Generate events for current day"""
	daily_events.clear()
	
	var player = GameManager.instance.player_manager
	
	# Crime event chance
	if randf() < 0.08 and player.stress > 40:
		daily_events.append(create_crime_event())
	
	# Health event chance
	if randf() < 0.05 and player.health < 40:
		daily_events.append(create_health_event())
	
	# Social event chance
	if randf() < 0.12:
		daily_events.append(create_social_event())
	
	# Economic opportunity
	if randf() < 0.15:
		daily_events.append(create_economic_event())
	
	return daily_events

func get_overnight_events() -> Array:
	"""Generate events that happen while sleeping"""
	var overnight: Array = []
	
	var player = GameManager.instance.player_manager
	
	# Overnight theft risk
	if randf() < 0.05 and player.money > 50:
		overnight.append(create_theft_event())
	
	# Family messages
	if player.relationships.get("mother", 0) > 20 and randf() < 0.1:
		overnight.append(create_family_event())
	
	return overnight

func create_crime_event() -> Dictionary:
	"""Create a crime-related event"""
	return {
		"id": "mugging_risk",
		"type": "crime",
		"title": "Dangerous Stranger",
		"description": "Someone suspicious is watching you. They approach.",
		"choices": [
			{
				"text": "Run away",
				"effects": {"stress": 20, "energy": -15},
				"consequences": "Escaped but shaken"
			},
			{
				"text": "Give them your money",
				"effects": {"money": -50, "stress": 15, "hope": -10},
				"consequences": "Robbed but safe"
			},
			{
				"text": "Stand your ground",
				"effects": {"reputation": 10, "health": -20},
				"chances": {"success": 0.6, "failure": 0.4},
				"consequences": "Fought back - uncertain outcome"
			}
		]
	}

func create_health_event() -> Dictionary:
	"""Create a health-related event"""
	return {
		"id": "illness_risk",
		"type": "health",
		"title": "Feeling Sick",
		"description": "You're developing a cough and feel feverish.",
		"choices": [
			{
				"text": "Rest at home",
				"effects": {"health": 10, "energy": -20, "money": -20},
				"consequences": "Missed work but recovered"
			},
			{
				"text": "Go to clinic",
				"effects": {"health": 20, "money": -50},
				"consequences": "Treated by doctor"
			},
			{
				"text": "Push through",
				"effects": {"health": -30, "stress": 15},
				"consequences": "Made it worse, getting sicker"
			}
		]
	}

func create_social_event() -> Dictionary:
	"""Create a social/relationship event"""
	var mother_relationship = GameManager.instance.player_manager.relationships.get("mother", 0)
	
	if mother_relationship > 30:
		return {
			"id": "mother_call",
			"type": "social",
			"title": "Mom Calls",
			"description": "Your mother calls. She sounds worried about you.",
			"choices": [
				{
					"text": "Talk for a while",
					"effects": {"stress": -10, "hope": 5},
					"relationship_change": {"mother": 5},
					"consequences": "Felt better after talking"
				},
				{
					"text": "Brief conversation",
					"effects": {"stress": -5},
					"relationship_change": {"mother": 2},
					"consequences": "Quick chat"
				},
				{
					"text": "Too busy, call later",
					"effects": {},
					"relationship_change": {"mother": -10},
					"consequences": "She sounded hurt"
				}
			]
		}
	
	return {}

func create_economic_event() -> Dictionary:
	"""Create an economic/opportunity event"""
	return {
		"id": "work_opportunity",
		"type": "economic",
		"title": "Extra Work",
		"description": "Someone offers you quick work for cash.",
		"choices": [
			{
				"text": "Take the work",
				"effects": {"money": 150, "energy": -20, "stress": 5},
				"consequences": "Earned extra money"
			},
			{
				"text": "Negotiate for more",
				"effects": {"money": 200, "energy": -25, "stress": 10},
				"chances": {"success": 0.6, "failure": 0.4},
				"consequences": "May offend them"
			},
			{
				"text": "Decline",
				"effects": {},
				"consequences": "Opportunity passed"
			}
		]
	}

func create_theft_event() -> Dictionary:
	"""Create overnight theft event"""
	return {
		"id": "theft_overnight",
		"type": "crime",
		"title": "Robbery",
		"description": "You wake up - someone broke in while you slept!",
		"choices": [
			{
				"text": "Report to police",
				"effects": {"money": -500, "stress": 20, "reputation": 5},
				"consequences": "Items gone but documented"
			},
			{
				"text": "Let it go",
				"effects": {"money": -500, "stress": 30, "hope": -15},
				"consequences": "Lost money and feeling violated"
			}
		]
	}

func create_family_event() -> Dictionary:
	"""Create a family event"""
	return {
		"id": "family_needs",
		"type": "social",
		"title": "Family Emergency",
		"description": "Your family needs R100 for an emergency.",
		"choices": [
			{
				"text": "Give them the money",
				"requires_money": 100,
				"effects": {"money": -100},
				"relationship_change": {"family": 20},
				"consequences": "Family grateful, you're hungry"
			},
			{
				"text": "Promise next month",
				"effects": {},
				"relationship_change": {"family": -10},
				"consequences": "Family disappointed"
			},
			{
				"text": "Can't help",
				"effects": {},
				"relationship_change": {"family": -25},
				"consequences": "Family upset with you"
			}
		]
	}

func trigger_event(event: Dictionary) -> void:
	"""Trigger an event and show UI"""
	event_triggered.emit(event)
	var ui = GameManager.instance.ui_manager
	ui.show_event_dialog(event)

func resolve_event_choice(event: Dictionary, choice_index: int) -> void:
	"""Process player's choice in an event"""
	if choice_index >= event.get("choices", []).size():
		return
	
	var choice = event["choices"][choice_index]
	var player = GameManager.instance.player_manager
	
	# Check if player has requirements
	if "requires_money" in choice:
		if player.money < choice["requires_money"]:
			# Cannot afford choice
			return
	
	# Apply effects
	if "effects" in choice:
		apply_effects(choice["effects"])
	
	# Apply relationship changes
	if "relationship_change" in choice:
		for npc in choice["relationship_change"]:
			player.change_relationship(npc, choice["relationship_change"][npc])
	
	# Handle chance-based outcomes
	if "chances" in choice:
		if randf() < choice["chances"].get("success", 0.5):
			# Success
			pass
		else:
			# Failure - apply failure effects if present
			if "failure_effects" in choice:
				apply_effects(choice["failure_effects"])
	
	event_history.append(event.get("id", "unknown"))
	event_resolved.emit()

func apply_effects(effects: Dictionary) -> void:
	"""Apply event effects to player"""
	var player = GameManager.instance.player_manager
	
	for effect_key in effects:
		var amount = effects[effect_key]
		
		match effect_key:
			"health":
				player.heal(amount) if amount > 0 else player.take_damage(-amount)
			"stress":
				player.add_stress(amount) if amount > 0 else player.reduce_stress(-amount)
			"energy":
				player.reduce_energy(-amount) if amount < 0 else player.add_energy(amount)
			"money":
				player.add_money(amount) if amount > 0 else player.spend_money(-amount)
			"hope":
				player.add_hope(amount) if amount > 0 else player.reduce_hope(-amount)
			"reputation":
				player.reputation = clamp(player.reputation + amount, -100, 100)

func get_event_history() -> Array:
	"""Get list of events that have occurred"""
	return event_history

func to_dict() -> Dictionary:
	"""Serialize event state"""
	return {
		"history": event_history,
	}

func from_dict(data: Dictionary) -> void:
	"""Deserialize event state"""
	event_history = data.get("history", [])
