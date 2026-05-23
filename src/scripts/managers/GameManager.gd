extends Node
## Global game state manager
## Handles day progression, state transitions, and global events

class_name GameManager

var player_stats: PlayerStats
var current_day: int = 0
var current_hour: int = 6
var game_state: String = "playing"  # playing, paused, ended
var starting_background: String

# Signals
signal day_changed(day: int)
signal hour_changed(hour: int)
signal game_state_changed(state: String)
signal game_ended(ending_type: String)

func _ready() -> void:
	player_stats = PlayerStats.new()
	add_to_group("persist")

func start_new_game(background: String) -> void:
	starting_background = background
	current_day = 0
	current_hour = 6
	game_state = "playing"
	player_stats.initialize(background)
	day_changed.emit(current_day)

func advance_hour() -> void:
	current_hour = (current_hour + 1) % 24
	hour_changed.emit(current_hour)
	
	if current_hour == 0:
		advance_day()

func advance_day() -> void:
	current_day += 1
	player_stats.daily_decay()
	day_changed.emit(current_day)

func end_game(ending_type: String) -> void:
	game_state = "ended"
	game_state_changed.emit(game_state)
	game_ended.emit(ending_type)

func pause_game() -> void:
	game_state = "paused"
	get_tree().paused = true
	game_state_changed.emit(game_state)

func resume_game() -> void:
	game_state = "playing"
	get_tree().paused = false
	game_state_changed.emit(game_state)
