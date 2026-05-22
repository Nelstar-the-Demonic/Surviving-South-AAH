## PlayerManager Complete Implementation
## Manages all player character data and statistics
## Godot 4.2+ | GDScript

extends Node

class_name PlayerManager

# Character info
var character_name: String = ""
var age: int = 25
var starting_background: String = ""

# PRIMARY STATS (0-100 scale, affected by decay and events)
var hunger: int = 50
var health: int = 70
var energy: int = 100
var stress: int = 30
var hygiene: int = 60
var hope: int = 70
var reputation: int = 0

# SECONDARY STATS (Experience/skill points 0-100)
var education: int = 0
var street_smart: int = 0
var social_skill: int = 0
var farming_level: int = 0
var health_skill: int = 0
var tech_skill: int = 0

# RESOURCE TRACKING
var money: int = 100
var debt: int = 0
var phone_battery: int = 100

# EMPLOYMENT
var current_job: String = ""
var employment_status: String = "unemployed"  # unemployed, informal, formal
var salary: int = 0
var days_employed: int = 0
var boss_reputation: int = 0

# RELATIONSHIPS (NPC name -> relationship points, -100 to +100)
var relationships: Dictionary = {}

# INVENTORY
var inventory: Dictionary = {}

# FARMING
var owns_farm: bool = false
var crops: Dictionary = {}
var livestock: Dictionary = {}

# HEALTH STATE
var current_illness: String = ""
var illness_severity: int = 0
var is_injured: bool = false
var is_imprisoned: bool = false

# MONTHLY TRACKING
var monthly_income: int = 0
var monthly_expenses: int = 0

# Signals
signal stats_changed
signal money_changed
signal debt_changed
signal health_status_changed
signal death_occurred

# Decision quality modifier (affected by stress)
var decision_quality_penalty: float = 1.0

func _ready() -> void:
	set_process(false)  # Manual processing

func create_character(name: String, age_val: int, background: String) -> void:
	"""Initialize a new character with chosen background"""
	character_name = name
	age = age_val
	starting_background = background
	
	# Apply background modifiers
	apply_background_modifiers(background)
	
	# Initialize relationships
	initialize_relationships()
	
	stats_changed.emit()

func apply_background_modifiers(background: String) -> void:
	"""Apply starting stat modifiers based on background"""
	match background:
		"unemployed_graduate":
			education = 70
			street_smart = 20
			money = 100
			relationships["mother"] = 40
			relationships["best_friend"] = 30
			hope = 80
		
		"township_hustler":
			education = 30
			street_smart = 60
			money = 50
			reputation = 20
			hope = 50
		
		"struggling_farmer":
			education = 40
			street_smart = 35
			farming_level = 40
			money = 80
			owns_farm = true
			relationships["family"] = 50
			hope = 80
		
		"former_student":
			education = 50
			street_smart = 40
			money = 30
			relationships["friends"] = 20
			hope = 40
		
		"unemployed_youth":
			education = 35
			street_smart = 50
			money = 20
			reputation = -20
			relationships["gang_contact"] = 30
			hope = 20
		
		"informal_worker":
			education = 45
			street_smart = 55
			money = 60
			employment_status = "informal"
			hope = 50

func initialize_relationships() -> void:
	"""Set up initial NPC relationships"""
	# Core family
	if not relationships.has("mother"):
		relationships["mother"] = 20
	
	# Common contacts
	relationships["taxi_driver"] = 0
	relationships["neighbor"] = 10
	relationships["social_worker"] = 0
	relationships["gang_contact"] = 0

# ============= STAT MANAGEMENT =============

func add_hunger(amount: int) -> void:
	"""Increase hunger"""
	hunger = clamp(hunger + amount, 0, 100)
	stats_changed.emit()
	
	if hunger > 80:
		stress = clamp(stress + 5, 0, 100)

func reduce_hunger(amount: int) -> void:
	"""Eat food to reduce hunger"""
	hunger = clamp(hunger - amount, 0, 100)
	stats_changed.emit()

func add_stress(amount: int) -> void:
	"""Increase stress"""
	stress = clamp(stress + amount, 0, 100)
	stats_changed.emit()
	
	if stress > 80:
		decision_quality_penalty = 0.7
		energy = clamp(energy - 5, 0, 100)

func reduce_stress(amount: int) -> void:
	"""Reduce stress through rest/relaxation"""
	stress = clamp(stress - amount, 0, 100)
	decision_quality_penalty = 1.0
	stats_changed.emit()

func take_damage(amount: int) -> void:
	"""Reduce health"""
	health = clamp(health - amount, 0, 100)
	health_status_changed.emit()
	
	if health <= 0:
		death_occurred.emit()

func heal(amount: int) -> void:
	"""Increase health"""
	health = clamp(health + amount, 0, 100)
	health_status_changed.emit()

func add_energy(amount: int) -> void:
	"""Increase energy (reduce tiredness)"""
	energy = clamp(energy + amount, 0, 100)
	stats_changed.emit()

func reduce_energy(amount: int) -> void:
	"""Reduce energy (from activities)"""
	energy = clamp(energy - amount, 0, 100)
	stats_changed.emit()

func improve_hygiene(amount: int) -> void:
	"""Improve hygiene through bathing/cleaning"""
	hygiene = clamp(hygiene + amount, 0, 100)
	stats_changed.emit()

func add_hope(amount: int) -> void:
	"""Increase hope/morale"""
	hope = clamp(hope + amount, 0, 100)
	decision_quality_penalty = 1.0
	stats_changed.emit()

func reduce_hope(amount: int) -> void:
	"""Reduce hope"""
	hope = clamp(hope - amount, 0, 100)
	if hope < 50:
		decision_quality_penalty = 0.9
	stats_changed.emit()

# ============= MONEY MANAGEMENT =============

func add_money(amount: int) -> void:
	"""Add money to player"""
	money = clamp(money + amount, 0, 99999)
	money_changed.emit()

func spend_money(amount: int) -> bool:
	"""Spend money, return success"""
	if money >= amount:
		money -= amount
		money_changed.emit()
		return true
	return false

func add_debt(amount: int) -> void:
	"""Increase debt (borrow money)"""
	debt = clamp(debt + amount, 0, 99999)
	stress = clamp(stress + 10, 0, 100)
	debt_changed.emit()

func reduce_debt(amount: int) -> void:
	"""Pay down debt"""
	if money >= amount:
		debt = clamp(debt - amount, 0, 99999)
		money -= amount
		debt_changed.emit()
		money_changed.emit()

func apply_debt_interest() -> void:
	"""Apply daily interest on debt"""
	if debt > 0:
		var daily_interest = int(debt * 0.08 / 30)  # 8% annual
		debt += daily_interest
		debt_changed.emit()

# ============= SKILL IMPROVEMENT =============

func improve_skill(skill_name: String, amount: int) -> void:
	"""Improve a skill"""
	match skill_name:
		"education":
			education = clamp(education + amount, 0, 100)
		"street_smart":
			street_smart = clamp(street_smart + amount, 0, 100)
		"social":
			social_skill = clamp(social_skill + amount, 0, 100)
		"farming":
			farming_level = clamp(farming_level + amount, 0, 100)
		"health":
			health_skill = clamp(health_skill + amount, 0, 100)
		"tech":
			tech_skill = clamp(tech_skill + amount, 0, 100)
	
	stats_changed.emit()

# ============= RELATIONSHIP MANAGEMENT =============

func change_relationship(npc_name: String, change: int) -> void:
	"""Modify relationship with an NPC"""
	if npc_name not in relationships:
		relationships[npc_name] = 0
	
	relationships[npc_name] = clamp(relationships[npc_name] + change, -100, 100)
	stats_changed.emit()

func get_relationship(npc_name: String) -> int:
	"""Get current relationship with NPC"""
	return relationships.get(npc_name, 0)

# ============= DAILY DECAY =============

func apply_daily_decay() -> void:
	"""Apply stat decay at end of each day"""
	hunger = clamp(hunger + 8, 0, 100)
	energy = clamp(energy + 10, 0, 100)
	health = clamp(health - 3, 0, 100)
	stress = clamp(stress + 5, 0, 100)
	hygiene = clamp(hygiene - 6, 0, 100)
	hope = clamp(hope - 2, 0, 100)
	
	# Relationships decay slowly
	for npc in relationships:
		relationships[npc] = clamp(relationships[npc] - 1, -100, 100)
	
	# Phone battery drains
	phone_battery = clamp(phone_battery - 20, 0, 100)
	
	stats_changed.emit()

# ============= MONTHLY EXPENSES =============

func charge_monthly_expenses() -> void:
	"""Charge player monthly fixed costs"""
	var monthly_rent = 150
	var utilities = 60
	var base_food = 750
	var phone = 30
	var transport = 120
	var misc = 100
	
	var total_monthly = monthly_rent + utilities + base_food + phone + transport + misc
	
	if money >= total_monthly:
		money -= total_monthly
		monthly_expenses = total_monthly
	else:
		money = 0
		debt += total_monthly
		stress = clamp(stress + 20, 0, 100)
		hope = clamp(hope - 10, 0, 100)
	
	money_changed.emit()
	debt_changed.emit()

# ============= STATUS CHECKS =============

func is_hungry() -> bool:
	return hunger > 75

func is_tired() -> bool:
	return energy < 25

func is_stressed() -> bool:
	return stress > 75

func is_sick() -> bool:
	return current_illness != ""

func is_healthy() -> bool:
	return health > 50 and current_illness == ""

func can_work() -> bool:
	return energy > 20 and health > 20 and not is_imprisoned

# ============= SERIALIZATION =============

func to_dict() -> Dictionary:
	"""Convert player state to dictionary for saving"""
	return {
		"name": character_name,
		"age": age,
		"background": starting_background,
		"hunger": hunger,
		"health": health,
		"energy": energy,
		"stress": stress,
		"hygiene": hygiene,
		"hope": hope,
		"reputation": reputation,
		"education": education,
		"street_smart": street_smart,
		"social_skill": social_skill,
		"farming_level": farming_level,
		"health_skill": health_skill,
		"tech_skill": tech_skill,
		"money": money,
		"debt": debt,
		"phone_battery": phone_battery,
		"employment_status": employment_status,
		"current_job": current_job,
		"salary": salary,
		"days_employed": days_employed,
		"boss_reputation": boss_reputation,
		"relationships": relationships,
		"inventory": inventory,
		"owns_farm": owns_farm,
		"crops": crops,
		"livestock": livestock,
		"current_illness": current_illness,
		"is_imprisoned": is_imprisoned,
		"monthly_income": monthly_income,
		"monthly_expenses": monthly_expenses,
	}

func from_dict(data: Dictionary) -> void:
	"""Load player state from dictionary"""
	character_name = data.get("name", "")
	age = data.get("age", 25)
	starting_background = data.get("background", "")
	hunger = data.get("hunger", 50)
	health = data.get("health", 70)
	energy = data.get("energy", 100)
	stress = data.get("stress", 30)
	hygiene = data.get("hygiene", 60)
	hope = data.get("hope", 70)
	reputation = data.get("reputation", 0)
	education = data.get("education", 0)
	street_smart = data.get("street_smart", 0)
	social_skill = data.get("social_skill", 0)
	farming_level = data.get("farming_level", 0)
	health_skill = data.get("health_skill", 0)
	tech_skill = data.get("tech_skill", 0)
	money = data.get("money", 100)
	debt = data.get("debt", 0)
	phone_battery = data.get("phone_battery", 100)
	employment_status = data.get("employment_status", "unemployed")
	current_job = data.get("current_job", "")
	salary = data.get("salary", 0)
	days_employed = data.get("days_employed", 0)
	boss_reputation = data.get("boss_reputation", 0)
	relationships = data.get("relationships", {})
	inventory = data.get("inventory", {})
	owns_farm = data.get("owns_farm", false)
	crops = data.get("crops", {})
	livestock = data.get("livestock", {})
	current_illness = data.get("current_illness", "")
	is_imprisoned = data.get("is_imprisoned", false)
	monthly_income = data.get("monthly_income", 0)
	monthly_expenses = data.get("monthly_expenses", 0)
	
	stats_changed.emit()
