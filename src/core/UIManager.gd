## UIManager Complete Implementation
## Manages all UI screens and state
## Godot 4.2+ | GDScript

extends Node

class_name UIManager

# Screen references
var current_screen: Node = null
var screen_stack: Array = []

# UI state
var active_menu: String = ""
var is_menu_open: bool = false

# Signals
signal screen_changed
signal menu_opened
signal menu_closed

func _ready() -> void:
	if not is_node_ready():
		await tree_entered
	
	# Preload common screens
	preload_screens()

func preload_screens() -> void:
	"""Preload common screen scenes"""
	# Preload critical screens
	var main_menu = preload("res://scenes/screens/MainMenu.tscn")
	var character_creation = preload("res://scenes/screens/CharacterCreation.tscn")
	var home_screen = preload("res://scenes/screens/HomeScreen.tscn")

func show_screen(screen_name: String, data: Dictionary = {}) -> void:
	"""Switch to a specific screen"""
	# Save current screen to stack
	if current_screen:
		screen_stack.append(current_screen)
		current_screen.hide()
	
	# Load and show new screen
	match screen_name:
		"main_menu":
			current_screen = preload("res://scenes/screens/MainMenu.tscn").instantiate()
		"character_creation":
			current_screen = preload("res://scenes/screens/CharacterCreation.tscn").instantiate()
		"home":
			current_screen = preload("res://scenes/screens/HomeScreen.tscn").instantiate()
		"work_selection":
			current_screen = preload("res://scenes/screens/WorkSelection.tscn").instantiate()
		"location_map":
			current_screen = preload("res://scenes/screens/LocationMap.tscn").instantiate()
		"dialogue":
			current_screen = preload("res://scenes/screens/DialogueScreen.tscn").instantiate()
		"event":
			current_screen = preload("res://scenes/screens/EventScreen.tscn").instantiate()
		"inventory":
			current_screen = preload("res://scenes/screens/Inventory.tscn").instantiate()
		"stats":
			current_screen = preload("res://scenes/screens/StatsScreen.tscn").instantiate()
		"ending":
			current_screen = preload("res://scenes/screens/EndingScreen.tscn").instantiate()
	
	if current_screen:
		get_tree().root.add_child(current_screen)
		
		# Pass data if screen supports it
		if current_screen.has_method("setup"):
			current_screen.setup(data)
		
		current_screen.show()
		screen_changed.emit()
		is_menu_open = true
		active_menu = screen_name

func go_back() -> void:
	"""Return to previous screen"""
	if screen_stack.is_empty():
		return
	
	if current_screen:
		current_screen.queue_free()
	
	current_screen = screen_stack.pop_back()
	current_screen.show()
	
	active_menu = ""
	screen_changed.emit()

func hide_current_screen() -> void:
	"""Hide current screen without removing it"""
	if current_screen:
		current_screen.hide()
		is_menu_open = false

func show_current_screen() -> void:
	"""Show previously hidden screen"""
	if current_screen:
		current_screen.show()
		is_menu_open = true

# ============= HUD UPDATES =============

func update_hud(player: PlayerManager) -> void:
	"""Update HUD with player stats"""
	# This would be called by GameManager whenever stats change
	if not is_node_ready():
		return
	
	# Find HUD node if it exists
	var hud = get_tree().root.get_node_or_null("HUD")
	if hud and hud.has_method("update_display"):
		hud.update_display(player)

func show_notification(message: String, duration: float = 2.0) -> void:
	"""Show temporary notification"""
	# Find notification system
	var notification_system = get_tree().root.get_node_or_null("NotificationSystem")
	if notification_system:
		notification_system.show_notification(message, duration)

func show_dialogue(dialogue_data: Dictionary) -> void:
	"""Show dialogue with character"""
	var dialogue_screen = preload("res://scenes/screens/DialogueScreen.tscn").instantiate()
	get_tree().root.add_child(dialogue_screen)
	dialogue_screen.setup(dialogue_data)

func show_event(event_data: Dictionary) -> void:
	"""Show event screen"""
	var event_screen = preload("res://scenes/screens/EventScreen.tscn").instantiate()
	get_tree().root.add_child(event_screen)
	event_screen.setup(event_data)

# ============= DIALOG BOXES =============

func show_yes_no_dialog(message: String, yes_callback: Callable, no_callback: Callable) -> void:
	"""Show yes/no confirmation dialog"""
	var dialog = preload("res://scenes/ui/YesNoDialog.tscn").instantiate()
	get_tree().root.add_child(dialog)
	dialog.show_dialog(message, yes_callback, no_callback)

func show_choice_dialog(message: String, choices: Array) -> void:
	"""Show choice dialog with multiple options"""
	var dialog = preload("res://scenes/ui/ChoiceDialog.tscn").instantiate()
	get_tree().root.add_child(dialog)
	dialog.show_choices(message, choices)

func show_info_dialog(message: String, title: String = "Information") -> void:
	"""Show information dialog"""
	var dialog = preload("res://scenes/ui/InfoDialog.tscn").instantiate()
	get_tree().root.add_child(dialog)
	dialog.show_info(message, title)

# ============= SCREEN SPECIFIC UPDATES =============

func update_stats_display(player: PlayerManager) -> void:
	"""Update stats on current screen"""
	if current_screen and current_screen.has_method("update_stats"):
		current_screen.update_stats(player)

func update_money_display(money: int) -> void:
	"""Update money display"""
	if current_screen and current_screen.has_method("update_money"):
		current_screen.update_money(money)

func update_job_listing(jobs: Array) -> void:
	"""Update job list display"""
	if current_screen and current_screen.has_method("update_jobs"):
		current_screen.update_jobs(jobs)

func update_inventory_display(inventory: Dictionary) -> void:
	"""Update inventory display"""
	if current_screen and current_screen.has_method("update_inventory"):
		current_screen.update_inventory(inventory)

func update_location_map(locations: Array) -> void:
	"""Update location map display"""
	if current_screen and current_screen.has_method("update_locations"):
		current_screen.update_locations(locations)

# ============= ANIMATION/TRANSITIONS =============

func fade_to_black(duration: float = 1.0) -> void:
	"""Fade screen to black"""
	# Create fade overlay
	var fade_rect = ColorRect.new()
	fade_rect.color = Color.BLACK
	fade_rect.modulate.a = 0.0
	get_tree().root.add_child(fade_rect)
	
	var tween = create_tween()
	tween.tween_property(fade_rect, "modulate:a", 1.0, duration)
	await tween.finished
	
	yield(get_tree(), "idle_frame")

func fade_from_black(duration: float = 1.0) -> void:
	"""Fade in from black"""
	var fade_rect = get_tree().root.get_node_or_null("FadeRect")
	if fade_rect:
		var tween = create_tween()
		tween.tween_property(fade_rect, "modulate:a", 0.0, duration)
		await tween.finished
		fade_rect.queue_free()

# ============= SERIALIZATION =============

func to_dict() -> Dictionary:
	"""Serialize UI state"""
	return {
		"active_menu": active_menu,
		"is_menu_open": is_menu_open,
	}

func from_dict(data: Dictionary) -> void:
	"""Deserialize UI state"""
	active_menu = data.get("active_menu", "")
	is_menu_open = data.get("is_menu_open", false)
