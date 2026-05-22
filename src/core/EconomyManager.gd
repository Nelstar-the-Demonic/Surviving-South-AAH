## EconomyManager Complete Implementation
## Manages jobs, money, prices, and economic systems
## Godot 4.2+ | GDScript

extends Node

class_name EconomyManager

# Job data
var available_jobs: Array = []
var all_jobs: Dictionary = {}

# Prices and inflation
var base_prices: Dictionary = {}
var current_inflation_multiplier: float = 1.0
var base_inflation: float = 0.005

# Economic state
var current_month: int = 1
var monthly_events: Array = []
var last_inflation_update: int = 0

# Signals
signal inflation_changed
signal job_pool_updated
signal price_changed

func _ready() -> void:
	load_job_data()
	setup_base_prices()

func load_job_data() -> void:
	"""Load job database from JSON"""
	var jobs_json = load("res://src/data/jobs.json")
	if jobs_json:
		all_jobs = JSON.parse_string(jobs_json.get_as_text())
		regenerate_job_pool()
	else:
		# Fallback: Create sample jobs
		create_sample_jobs()

func create_sample_jobs() -> void:
	"""Create sample jobs if JSON not available"""
	all_jobs = {
		"general_labor": {
			"id": "general_labor",
			"name": "General Laborer",
			"daily_pay": 100,
			"energy_cost": 20,
			"stress_gain": 8,
			"requirements": {"education": 0},
			"description": "Physical labor at construction site",
		},
		"office_clerk": {
			"id": "office_clerk",
			"name": "Office Clerk",
			"daily_pay": 200,
			"energy_cost": 12,
			"stress_gain": 5,
			"requirements": {"education": 50},
			"description": "Office work, typing and filing",
		},
		"security_guard": {
			"id": "security_guard",
			"name": "Security Guard",
			"daily_pay": 150,
			"energy_cost": 18,
			"stress_gain": 10,
			"requirements": {"health": 40},
			"description": "Night shift security work",
		},
		"street_vending": {
			"id": "street_vending",
			"name": "Street Vending",
			"daily_pay": 65,
			"energy_cost": 16,
			"stress_gain": 8,
			"requirements": {"education": 0},
			"description": "Sell items on street",
		},
		"tutoring": {
			"id": "tutoring",
			"name": "Private Tutoring",
			"daily_pay": 150,
			"energy_cost": 10,
			"stress_gain": 4,
			"requirements": {"education": 60},
			"description": "Teach students one-on-one",
		},
	}

func setup_base_prices() -> void:
	"""Initialize base prices"""
	base_prices = {
		"food_basic": 25,
		"food_quality": 40,
		"food_luxury": 100,
		"rent_basic": 120,
		"rent_decent": 200,
		"rent_good": 350,
		"transport": 8,
		"utilities": 60,
		"phone": 30,
		"medicine": 50,
	}

func get_price(item: String) -> int:
	"""Get current price of item with inflation"""
	if item not in base_prices:
		return 0
	
	var base_price = base_prices[item]
	return int(base_price * current_inflation_multiplier)

func regenerate_job_pool() -> void:
	"""Generate today's available jobs based on player stats"""
	available_jobs.clear()
	
	var player = GameManager.instance.player_manager
	
	# Check education-based jobs
	if player.education > 30:
		add_job_to_pool("office_clerk")
	
	if player.education > 50:
		add_job_to_pool("tutoring")
	
	if player.education > 60:
		add_job_to_pool("administrator")
	
	# Informal jobs (always available)
	if randf() > 0.4:
		add_job_to_pool("street_vending")
	
	if randf() > 0.5:
		add_job_to_pool("general_labor")
	
	# Physical jobs
	if player.health > 50:
		add_job_to_pool("security_guard")
	
	job_pool_updated.emit()

func add_job_to_pool(job_id: String) -> void:
	"""Add specific job to available jobs"""
	if job_id in all_jobs:
		if job_id not in available_jobs:
			available_jobs.append(all_jobs[job_id])

func get_daily_income_from_job(job_id: String) -> int:
	"""Get income for completing a specific job"""
	if job_id not in all_jobs:
		return 0
	
	var job = all_jobs[job_id]
	var base_pay = job.get("daily_pay", 0)
	
	# Add some randomness to informal work
	var variance = randi_range(-10, 20) if job.get("is_informal", false) else 0
	return max(0, base_pay + variance)

func apply_monthly_inflation(month: int = 1) -> void:
	"""Calculate and apply monthly inflation"""
	var seasonal_modifier = get_seasonal_inflation_modifier(month)
	var random_event = randf_range(-0.01, 0.02)
	
	var total_inflation = base_inflation + seasonal_modifier + random_event
	current_inflation_multiplier *= (1.0 + total_inflation)
	
	# Cap to prevent runaway inflation
	current_inflation_multiplier = clamp(current_inflation_multiplier, 1.0, 2.5)
	
	inflation_changed.emit()
	price_changed.emit()

func get_seasonal_inflation_modifier(month: int) -> float:
	"""Get seasonal inflation modifier for month"""
	match month % 12:
		11, 12, 1:  # Nov, Dec, Jan - Summer
			return 0.003
		2, 3, 4:  # Feb, Mar, Apr - Autumn
			return 0.002
		5, 6, 7:  # May, Jun, Jul - Winter
			return 0.010
		_:  # Spring (Aug, Sep, Oct)
			return 0.002
	return 0.0

func calculate_daily_expenses() -> int:
	"""Calculate what player needs to spend today"""
	var food = 25
	var transport = 15
	var utilities_daily = int(get_price("utilities") / 30.0)
	var phone = 1
	var misc = 10
	
	return food + transport + utilities_daily + phone + misc

func get_available_jobs() -> Array:
	"""Return today's available jobs"""
	return available_jobs

func get_job_details(job_id: String) -> Dictionary:
	"""Get full details of a job"""
	return all_jobs.get(job_id, {})

func calculate_monthly_income(player: PlayerManager) -> int:
	"""Calculate total monthly income based on employment"""
	var monthly = 0
	
	if player.employment_status == "formal" and player.salary > 0:
		monthly = player.salary * 20  # ~20 working days per month
	elif player.employment_status == "informal":
		monthly = randi_range(1200, 2400)  # Variable informal income
	else:
		# Unemployed - supplementary income only
		monthly = randi_range(200, 600)
	
	return monthly

func to_dict() -> Dictionary:
	"""Serialize economy state"""
	return {
		"inflation": current_inflation_multiplier,
		"month": current_month,
		"base_prices": base_prices,
	}

func from_dict(data: Dictionary) -> void:
	"""Deserialize economy state"""
	current_inflation_multiplier = data.get("inflation", 1.0)
	current_month = data.get("month", 1)
	base_prices = data.get("base_prices", base_prices)
