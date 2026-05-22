# SURVIVING SOUTH AAH!!! - UI System Structure

## UI Architecture Overview

### Design Principles

1. **Mobile-First**: All UI optimized for touch
2. **Immersive**: UI feels like actual phone/device
3. **Information-Dense**: All important info visible
4. **Accessible**: Large targets, high contrast
5. **Responsive**: Adapts to different screen sizes

---

## Screen Hierarchy

### Level 1: Primary Game Loop Screens (Critical)

These screens are essential and used daily:

#### 1. **Home Screen / Morning Wake-Up**
**Purpose**: Daily entry point, status overview

**Layout**:
```
┌──────────────────────────┐
│ DAY 47 | SPRING          │ (header: time info)
│ 06:45 AM                 │ (time display)
├──────────────────────────┤
│ YOU WAKE UP               │ (narrative flavor)
│ Another day.              │
│ Another chance.           │
├──────────────────────────┤
│ CURRENT STATUS            │ (stats display)
│ ❤️ Hunger     65/100     │ (color-coded bars)
│ 💪 Health     45/100     │ (red if critical)
│ ⚡ Energy     40/100     │ (green if good)
│ 😰 Stress     72/100     │
│ 💰 Money      R342       │
│ 📊 Reputation +15        │
├──────────────────────────┤
│ OVERNIGHT EVENTS          │ (notifications)
│ • Mom called              │
│ • Found R50 on street     │
│ • Electricity bill due     │
├──────────────────────────┤
│ [REVIEW STATS] [PLAN DAY] │ (action buttons)
└──────────────────────────┘
```

**Functionality**:
- Display all primary stats with visual bars
- Show overnight events/messages
- Quick access to stats screen
- Navigate to activity selection
- Time display (day, month, season)
- Brief inspirational/somber text based on hope level

**Interactive Elements**:
- Tap stats to see details
- Swipe for quick info panels
- Bottom buttons for major actions

---

#### 2. **Activity Selection Screen**
**Purpose**: Choose daily activity

**Layout**:
```
┌──────────────────────────┐
│ TODAY'S OPTIONS           │
│                           │
│ ⬚ WORK ACTIVITIES         │
│ ✓ Formal Job (400R)      │ (available)
│ ✓ Informal (80-150R)     │
│ × Farming (too cold)     │ (unavailable + reason)
│ ✓ Odd Jobs (50-100R)     │
│                           │
│ ⬚ PERSONAL CARE           │
│ ✓ Eat (reduce hunger)    │
│ ✓ Rest (restore energy)  │
│ ✓ Study (improve skill)  │
│ × Work out (too tired)   │
│                           │
│ ⬚ TRAVEL & SOCIAL         │
│ ✓ Visit location         │
│ ✓ See NPC                │
│ × Family (after 5pm)     │
│                           │
│ [BACK] [SELECT ACTIVITY] │
└──────────────────────────┘
```

**Functionality**:
- List all available activities
- Show requirements/restrictions
- Explain why unavailable items are grayed
- Display likely outcomes/rewards
- Select and confirm activity

**Categories**:
1. Work Activities (income)
2. Personal Care (stat management)
3. Travel & Social (movement, relationships)
4. Learning (skill building)
5. Financial (loans, bills)

---

#### 3. **Activity Execution Screen**
**Purpose**: Show activity in progress

**Layout**:
```
┌──────────────────────────┐
│ WORK: Office Duty         │
│ 7:00 AM - 5:00 PM        │
├──────────────────────────┤
│ [=========........] 40%  │ (progress bar)
│                           │
│ NARRATIVE TEXT            │
│ Typing documents.         │
│ Boss seems happy today.   │
│ Coffee helps keep you     │
│ focused but you're        │
│ getting hungry.           │
├──────────────────────────┤
│ RUNNING EFFECTS           │
│ Energy: 45 → 25          │ (red: decreasing)
│ Hunger: 65 → 78          │ (red: increasing)
│ Stress: 72 → 68          │ (green: decreasing)
│                           │
│ [CONTINUE] [TAKE BREAK]  │ (choices)
│ [QUIT JOB]               │ (consequence action)
└──────────────────────────┘
```

**Functionality**:
- Progress bar showing activity completion
- Narrative description (immersion)
- Real-time stat changes
- Optional choices (skip, push harder, take break)
- Auto-progress or player-controlled

---

#### 4. **Result Screen**
**Purpose**: Show what happened during activity

**Layout**:
```
┌──────────────────────────┐
│ DAY 47 COMPLETE           │
│                           │
│ EARNINGS: +R400          │ (income section)
│ Formal job completed      │
│                           │
│ STAT CHANGES              │ (effects)
│ • Energy -50              │ (red)
│ • Hunger +15              │ (red)
│ • Stress -10              │ (green)
│ • Reputation +5           │ (green)
│                           │
│ EVENTS DURING DAY         │ (incidents)
│ • Boss praised your work  │
│ • Taxi broke down (late)  │
│ • Feeling tired           │
│                           │
│ RELATIONSHIPS             │ (social impact)
│ • Mom: +40 → +38 (decay) │
│ • Jake: +15 → +20 (help) │
│                           │
│ [EVENING] [SLEEP]        │ (continue)
└──────────────────────────┘
```

**Functionality**:
- Show all stat changes
- Display income/expenses
- Notable events that occurred
- Relationship changes
- Navigate to evening activities or sleep

---

#### 5. **Evening/Sleep Screen**
**Purpose**: End-of-day activities and sleep

**Layout**:
```
┌──────────────────────────┐
│ EVENING (6:00 PM)         │
│                           │
│ RETURN HOME               │
│ You arrive back at your   │
│ place. It's getting dark. │
│                           │
│ CHOICES                   │
│ [EAT DINNER]             │ (meal choice)
│ ├─ Cook (cheap, time)    │
│ ├─ Buy prepared (fast)   │
│ └─ Skip (save money)     │
│                           │
│ [SOCIAL TIME]            │ (evening activity)
│ ├─ Call family           │
│ ├─ Relax alone           │
│ └─ Rest for tomorrow     │
│                           │
│ BILLS TO PAY              │ (monthly reminder)
│ • Rent: R150 due soon    │
│ • Phone: R30              │
│                           │
│ [GO TO SLEEP]            │ (end day)
└──────────────────────────┘
```

**Functionality**:
- Evening meal selection
- Social/relaxation choices
- Bill/payment reminders
- Sleep to end day
- Optional tasks before bed

---

### Level 2: Secondary Game Screens (Important)

#### 6. **Stats & Details Screen**
**Purpose**: Deep character info

**Layout**:
```
┌──────────────────────────┐
│ CHARACTER STATS           │
│                           │
│ ⬛ PRIMARY STATS          │
│                           │
│ Hunger: [████░░░░░] 40   │
│ Status: Moderate need    │
│ Tip: Eat soon            │
│                           │
│ Health: [██░░░░░░░] 20   │
│ Status: CONCERNING       │
│ Action: Rest, see doctor │
│                           │
│ ⬛ SKILLS                  │
│                           │
│ Education: 65 (Advanced) │
│ Street Smart: 35 (Basic) │
│ Social: 42 (Average)     │
│                           │
│ ⬛ FINANCIAL               │
│                           │
│ Money: R342              │
│ Debt: -R500              │
│ Interest Accruing: R1.50 │
│                           │
│ [DETAILS] [BACK]         │
└──────────────────────────┘
```

---

#### 7. **Relationships Screen**
**Purpose**: NPC relationship tracking

**Layout**:
```
┌──────────────────────────┐
│ RELATIONSHIPS             │
│                           │
│ FAMILY (2)                │
│ 👤 Mom: +40 (Close)      │
│    Status: Worried about │
│    you, wants help       │
│                           │
│ 👤 Brother: +10 (Friend) │
│    Status: Haven't seen  │
│    in 2 weeks            │
│                           │
│ FRIENDS (3)               │
│ 👤 Jake: +15 (Friend)    │
│ 👤 Thabo: +30 (Close)    │
│ 👤 Sarah: -5 (Neutral)   │
│                           │
│ [TAP TO INTERACT]        │
│ [BACK]                   │
└──────────────────────────┘
```

---

#### 8. **Map/Travel Screen**
**Purpose**: Location navigation

**Layout**:
```
┌──────────────────────────┐
│ LOCATIONS                 │
│                           │
│ 🏠 HOME (current)         │
│    Safe, private space    │
│    Can rest, eat, think   │
│                           │
│ 🚕 TAXI RANK (1km)        │
│    Travel hub             │
│    Meet NPCs, get info    │
│    R5 to travel           │
│                           │
│ 🏢 CBD (8km)              │
│    Formal employment      │
│    Professional area      │
│    R12 taxi cost          │
│                           │
│ 👨‍🌾 FARM (20km)            │
│    Agricultural work      │
│    Rural, peaceful        │
│    R20 taxi cost          │
│                           │
│ [SELECT] [BACK]          │
└──────────────────────────┘
```

---

#### 9. **Inventory/Items Screen**
**Purpose**: What player owns

**Layout**:
```
┌──────────────────────────┐
│ INVENTORY                 │
│                           │
│ CASH: R342                │
│                           │
│ ITEMS:                    │
│ • Phone (battery 40%)    │
│ • ID Document            │
│ • Bank Card              │
│ • Medical Certificate    │
│                           │
│ INVENTORY VALUE: R200    │
│ (Can be sold if needed)  │
│                           │
│ [SELL ITEM] [BACK]       │
└──────────────────────────┘
```

---

#### 10. **Jobs Board**
**Purpose**: Employment opportunities

**Layout**:
```
┌──────────────────────────┐
│ AVAILABLE WORK            │
│                           │
│ FORMAL POSITIONS:         │
│ • Office Clerk            │
│   Pay: R200/day           │
│   Requirements: Education │
│   Status: Available       │
│                           │
│ • Security Guard          │
│   Pay: R150/day           │
│   Requirements: Health 40 │
│   Status: Available       │
│                           │
│ INFORMAL WORK:            │
│ • Street Vending          │
│   Pay: R50-80/day         │
│   Status: Available today │
│                           │
│ [VIEW DETAILS] [APPLY]   │
│ [BACK]                    │
└──────────────────────────┘
```

---

### Level 3: Tertiary Screens (Supportive)

#### 11. **NPC Dialogue Screen**
**Purpose**: Conversations

```
┌──────────────────────────┐
│ 👤 JAKE DLAMINI           │
│ Taxi Driver (+15 rep)    │
│                           │
│ "Ay, what's happening!"  │
│ "Where you heading       │
│  today, my guy?"         │
│                           │
│ [GREET FRIENDLY]         │
│ [ASK FOR HELP]           │
│ [ASK FOR WORK]           │
│ [GIVE GIFT]              │
│ [LEAVE]                  │
└──────────────────────────┘
```

---

#### 12. **Event/Choice Dialog**
**Purpose**: Critical decision moments

```
┌──────────────────────────┐
│ ⚠️ MORAL DECISION          │
│                           │
│ "Your friend needs R100  │
│  for an emergency."      │
│                           │
│ "You have R200 left."    │
│                           │
│ [GIVE THE MONEY]         │
│  Relationship +20        │
│  Hunger increases        │
│                           │
│ [PROMISE LATER]          │
│  Relationship -10        │
│  Stress +5               │
│                           │
│ [SAY NO]                 │
│  Relationship -25        │
│  Guilt (stress +15)      │
│                           │
│ [BACK]                   │
└──────────────────────────┘
```

---

#### 13. **Menu/Settings**
**Purpose**: Game options

```
┌──────────────────────────┐
│ MENU                      │
│                           │
│ [CONTINUE GAME]          │
│ [NEW GAME]               │
│ [LOAD GAME]              │
│ [SETTINGS]               │
│ [ACHIEVEMENTS]           │
│ [CREDITS]                │
│ [QUIT]                   │
└──────────────────────────┘
```

**Settings Include**:
- Volume control (music, SFX, ambience)
- Difficulty level
- Save slot management
- Text size/accessibility
- Performance settings
- Language (future)

---

#### 14. **Game Over / Ending Screen**
**Purpose**: Campaign conclusion

```
┌──────────────────────────┐
│ GAME OVER                 │
│                           │
│ YOU SURVIVED 365 DAYS     │
│                           │
│ ENDING: CAREER SUCCESS   │
│                           │
│ "You've built a stable   │
│  career. Tomorrow feels  │
│  less uncertain."        │
│                           │
│ STATS:                    │
│ • Money Saved: R8,400    │
│ • Debt: R0               │
│ • Relationships: Strong  │
│ • Skills: Advanced       │
│                           │
│ [NEW GAME] [MAIN MENU]   │
└──────────────────────────┘
```

---

## UI Components

### Reusable UI Widgets

#### 1. **Stat Bar**
```gdscript
# Component: StatBar.gd
extends Control

@export var stat_name: String = "Hunger"
@export var max_value: int = 100
@export var warning_threshold: int = 70
@export var critical_threshold: int = 90

var current_value: int = 50:
	set(value):
		current_value = clamp(value, 0, max_value)
		update_display()

func update_display():
	# Change colors based on value
	if current_value >= critical_threshold:
		bar_color = Color.RED
	elif current_value >= warning_threshold:
		bar_color = Color.YELLOW
	else:
		bar_color = Color.GREEN
	
	# Update bar width
	bar.size.x = (current_value / float(max_value)) * max_width
```

#### 2. **Money Display**
```gdscript
# Component: MoneyDisplay.gd
extends HBoxContainer

@onready var money_label = Label.new()
@onready var debt_label = Label.new()

func _ready():
	add_child(money_label)
	add_child(debt_label)
	GameManager.instance.player_manager.money_changed.connect(_on_money_changed)

func _on_money_changed():
	var player = GameManager.instance.player_manager
	money_label.text = "R%d" % player.money
	debt_label.text = "Debt: -R%d" % player.debt if player.debt > 0 else ""
	
	# Color coded
	money_label.add_theme_color_override("font_color", Color.GREEN if player.money > 100 else Color.RED)
```

#### 3. **Choice Button**
```gdscript
# Component: ChoiceButton.gd
extends Button

@export var choice_text: String = ""
@export var choice_consequence: String = ""
@export var is_available: bool = true

func _ready():
	text = choice_text
	disabled = !is_available
	if not is_available:
		add_theme_color_override("font_disabled_color", Color.GRAY)
	
	if choice_consequence:
		tooltip_text = choice_consequence
```

#### 4. **Notification Panel**
```gdscript
# Component: Notification.gd
extends PanelContainer

@export var title: String = ""
@export var message: String = ""
@export var duration: float = 3.0

func _ready():
	$VBoxContainer/Title.text = title
	$VBoxContainer/Message.text = message
	
	await get_tree().create_timer(duration).timeout
	animate_out()

func animate_out():
	# Fade and slide out
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 0.0, 0.3)
	await tween.finished
	queue_free()
```

---

## UI Flow Diagram

```
START
  ↓
CHARACTER CREATION
  ↓
HOME SCREEN (Daily)
  ↓
ACTIVITY SELECTION
  ↓
ACTIVITY EXECUTION (+ random events)
  ↓
RESULT SCREEN
  ↓
EVENING/SLEEP
  ↓
NEXT DAY or END CONDITIONS?
  ├─ New day → HOME SCREEN
  └─ Game Over → ENDING SCREEN

SIDEBAR (Accessible Anytime):
  ├─ STATS
  ├─ RELATIONSHIPS
  ├─ MAP
  ├─ INVENTORY
  ├─ JOBS
  └─ SETTINGS
```

---

## Mobile Optimization

### Touch Controls

**Button Targets**:
- Minimum size: 44x44 pixels
- Padding: 8px between buttons
- Feedback: Visual + haptic

**Gestures**:
- Tap: Select/interact
- Swipe: Navigate screens/panels
- Long press: Details/tooltips
- Pinch: Zoom (future)

### Screen Adaptation

**Portrait (Primary)**:
- 1080x1920 minimum
- Full vertical scrolling
- Bottom-aligned buttons (thumb reach)

**Landscape (Secondary)**:
- 1920x1080 support
- Two-column layout possible
- Reflow stats panels

### Performance

**Target Frame Rate**: 60 FPS
**Memory Budget**: <200MB UI assets
**Load Time**: <1 second per screen

---

## Accessibility Features

- High contrast (WCAG AA minimum)
- Text scaling (font size adjustable)
- Color not only indicator (icons + text)
- Haptic feedback option
- Screen reader support (future)
- No rapid flashing (epilepsy-safe)

---

**Document Version**: 1.0
**Status**: Complete & Ready for Implementation