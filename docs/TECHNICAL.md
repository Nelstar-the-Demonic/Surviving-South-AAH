# Technical Architecture

## 1. Engine & Framework

**Primary Engine**: Godot 4.x (open-source, lightweight, mobile-optimized)

**Why Godot**:
- Free and open-source
- Excellent 2D performance
- Mobile optimization built-in
- GDScript is Python-like and readable
- Supports both Android and iOS with same codebase
- Low resource footprint for low-end devices
- Active community with game dev focus

**Alternative**: MonoGame/FNA for C# developers

---

## 2. Project Structure

```
surviving-south-aah/
├── src/
│   ├── scenes/
│   │   ├── MainMenu/
│   │   ├── GameScreen/
│   │   ├── CharacterCreation/
│   │   ├── DayStart/
│   │   ├── EventScreen/
│   │   ├── ChoiceDialog/
│   │   ├── Stats/
│   │   ├── Map/
│   │   ├── Inventory/
│   │   ├── Relationships/
│   │   └── Ending/
│   ├── scripts/
│   │   ├── managers/
│   │   │   ├── GameManager.gd
│   │   │   ├── EventManager.gd
│   │   │   ├── SaveManager.gd
│   │   │   ├── AudioManager.gd
│   │   │   └── NPCManager.gd
│   │   ├── systems/
│   │   │   ├── Stats.gd
│   │   │   ├── Economy.gd
│   │   │   ├── Work.gd
│   │   │   ├── Farming.gd
│   │   │   ├── Health.gd
│   │   │   ├── Stress.gd
│   │   │   ├── Relationships.gd
│   │   │   ├── Time.gd
│   │   │   └── Inventory.gd
│   │   ├── data/
│   │   │   ├── JobData.gd
│   │   │   ├── EventData.gd
│   │   │   ├── NPCData.gd
│   │   │   ├── ItemData.gd
│   │   │   └── LocationData.gd
│   │   ├── events/
│   │   │   ├── RandomEvents.gd
│   │   │   ├── MajorStoryEvents.gd
│   │   │   ├── EconomyEvents.gd
│   │   │   └── HealthEvents.gd
│   │   └── utils/
│   │       ├── RandomEvent.gd
│   │       ├── Choice.gd
│   │       ├── Outcome.gd
│   │       └── Notification.gd
│   ├── ui/
│   │   ├── themes/
│   │   │   └── default_theme.tres
│   │   ├── panels/
│   │   │   ├── StatsPanel.gd
│   │   │   ├── InventoryPanel.gd
│   │   │   ├── MapPanel.gd
│   │   │   └── RelationshipPanel.gd
│   │   └── prefabs/
│   │       ├── StatBar.tscn
│   │       ├── ChoiceButton.tscn
│   │       ├── NPCCard.tscn
│   │       └── EventPanel.tscn
│   ├── assets/
│   │   ├── audio/
│   │   │   ├── ambient/
│   │   │   ├── music/
│   │   │   └── sfx/
│   │   ├── images/
│   │   │   ├── ui/
│   │   │   ├── backgrounds/
│   │   │   ├── characters/
│   │   │   └── icons/
│   │   └── fonts/
│   │       └── fonts/
│   └── data/
│       ├── jobs.json
│       ├── events.json
│       ├── npcs.json
│       ├── locations.json
│       └── dialogue.json
├── build/
│   ├── android/
│   ├── ios/
│   └── web/
├── tests/
│   ├── test_stats.gd
│   ├── test_economy.gd
│   ├── test_events.gd
│   └── test_relationships.gd
├── project.godot
├── export_presets.cfg
└─��� README.md
```

---

## 3. Core Systems Architecture

### 3.1 Game Manager (Singleton)

Handles:
- Game state transitions
- Day/time progression
- Save/load operations
- Scene management
- Global event signals

### 3.2 Stats System

**Class: PlayerStats**

```
Properties:
- hunger: int (0-100)
- health: int (0-100)
- stress: int (0-100)
- energy: int (0-100)
- hygiene: int (0-100)
- hope: int (0-100)
- money: float
- reputation: int (-100 to +100)

Methods:
- add_stat(stat_name, amount)
- remove_stat(stat_name, amount)
- get_stat_percentage(stat_name)
- check_critical_thresholds()
- daily_decay()
```

### 3.3 Event System

**Architecture**: Signal-based event propagation

```
EventManager signals:
- event_triggered(event: Event)
- choice_selected(choice: Choice)
- outcome_applied(outcome: Outcome)
- day_changed(new_day: int)
```

**Event Data Structure**:
```gdscript
class_name Event
var id: String
var category: String  # random, story, economy, health, etc.
var title: String
var description: String
var choices: Array[Choice]
var triggers: Dictionary  # conditions to trigger
var probability: float  # 0.0 to 1.0
```

### 3.4 Choice & Outcome System

**Choice Structure**:
```gdscript
class_name Choice
var id: String
var text: String
var outcome: Outcome
var consequences: Dictionary  # stat changes, etc.
var flags: Array[String]  # story flags affected
```

**Outcome Structure**:
```gdscript
class_name Outcome
var stat_changes: Dictionary  # {"hunger": 10, "stress": -5}
var money_change: float
var relationship_changes: Dictionary  # {npc_id: amount}
var follow_up_event: String  # optional
var story_flag: String  # track major decisions
```

### 3.5 Time System

**Class: TimeManager**

```
Properties:
- current_day: int
- current_hour: int (0-23)
- current_season: String
- game_started_date: String

Methods:
- advance_hour(amount)
- advance_day()
- get_time_of_day() -> String
- is_nighttime() -> bool
- get_day_phase() -> String (morning/midday/evening/night)
```

### 3.6 Economy System

**Class: EconomySystem**

```
Properties:
- base_prices: Dictionary  # item: price
- inflation_rate: float (default: 0.01)
- last_price_update: int (day)

Methods:
- get_item_price(item_id) -> float
- apply_inflation()
- trigger_price_spike(percentage)
- get_available_jobs() -> Array[Job]
- get_local_economy_status() -> String
```

### 3.7 Work System

**Class: WorkSystem**

```
Methods:
- search_for_job(difficulty) -> Array[Job]
- apply_for_job(job)
- work_day(job) -> Outcome
- get_hustle_opportunities() -> Array[Hustle]
- perform_hustle(hustle_type) -> Outcome
- get_employment_status() -> String
```

### 3.8 Farming System

**Class: FarmingSystem**

```
Properties:
- crops: Array[Crop]
- livestock: Array[Livestock]
- farm_size: float
- soil_health: int (0-100)
- water_access: bool

Methods:
- plant_crop(crop_type, amount)
- water_crops()
- harvest_crop(crop_id) -> int (yield)
- manage_livestock(animal_id) -> bool
- sell_produce(crop_id, amount) -> float
- check_crop_health() -> Array[String] (warnings)
```

### 3.9 NPC & Relationship System

**Class: NPC**

```
Properties:
- id: String
- name: String
- role: String (family, worker, criminal, etc.)
- relationship: int (-100 to +100)
- needs: Array[String]
- dialogue_trees: Dictionary
- schedule: Dictionary

Methods:
- interact(player) -> String (dialogue)
- give_help(help_type)
- ask_for_favor()
- decay_relationship()
```

**Class: RelationshipManager**

```
Methods:
- get_relationship(npc_id) -> int
- modify_relationship(npc_id, amount)
- get_unfulfilled_needs() -> Array[String]
- trigger_family_pressure()
- get_available_npcs() -> Array[NPC]
```

### 3.10 Save/Load System

**Save Format**: JSON

```json
{
  "version": "1.0",
  "save_date": "2026-05-22T18:30:00Z",
  "play_time_hours": 2.5,
  "player_stats": {
    "hunger": 45,
    "health": 75,
    "stress": 60,
    "energy": 50,
    "hygiene": 40,
    "hope": 55,
    "money": 325.50,
    "reputation": 15
  },
  "game_state": {
    "current_day": 12,
    "current_hour": 14,
    "starting_background": "unemployed_graduate",
    "story_flags": ["helped_neighbor", "police_warning"]
  },
  "relationships": {
    "npc_001": 35,
    "npc_002": -10,
    "npc_003": 70
  },
  "inventory": [...],
  "location": "township_center"
}
```

---

## 4. Data Management

### 4.1 JSON Data Files

**jobs.json**: Job definitions with pay, requirements, stress cost
**events.json**: All random and scripted events
**npcs.json**: NPC definitions and relationships
**locations.json**: Map locations with travel costs
**dialogue.json**: All NPC dialogue trees

### 4.2 Data Access Pattern

Use Resource files (.tres) for hot-loadable data:
- Avoids runtime parsing
- Better performance
- Easier debugging

---

## 5. UI/UX Implementation

### 5.1 Screen Management

**Pattern**: Scene-based with persistent UI elements

Main scenes:
- GameScreen (persistent during gameplay)
- HUD (overlaid panels)
- DialogueScreen (modal)
- MenuScreen (persistent bottom menu)

### 5.2 Responsive Design

- 16:9 aspect ratio primary
- Adaptable to 9:16 (portrait)
- Touch-optimized buttons (minimum 48x48px)
- Scalable UI for different screen sizes

### 5.3 Animation & Transitions

- Smooth stat bar fills
- Fade transitions between scenes
- Pop-in notifications
- Subtle menu transitions (no jarring changes)

---

## 6. Audio Implementation

### 6.1 Audio Management

**Class: AudioManager** (Singleton)

```
Methods:
- play_ambient(track_name)
- play_music(track_name, fade_duration)
- play_sfx(effect_name)
- set_volume(channel, volume)
- get_time_appropriate_ambient() -> String
```

### 6.2 Audio Layers

- **Ambient layer**: Always playing
- **Music layer**: Emotional themes
- **SFX layer**: Event sounds
- **UI layer**: Menu clicks, notifications

---

## 7. Performance Optimization

### 7.1 Target Specifications

- Min RAM: 1GB
- Min Storage: 150MB
- Min CPU: Snapdragon 400 equivalent
- Network: Offline-capable

### 7.2 Optimization Techniques

- Object pooling for repeated UI elements
- Lazy-load event data on demand
- Cache frequently accessed data
- Compress audio (AAC 64kbps)
- Optimize images (WebP, max 1080p)
- Frame-rate cap at 30 FPS (60 optional)

### 7.3 Memory Management

- Strict scene cleanup on transitions
- Dispose of large assets between chapters
- Monitor memory usage constantly
- Profile on low-end devices

---

## 8. Testing Strategy

### 8.1 Unit Tests

- Stats calculations
- Economy math
- Outcome application
- Data validation

### 8.2 Integration Tests

- Save/load cycle
- Event triggering chains
- Relationship calculations
- Day progression

### 8.3 Manual Testing

- Playthroughs on target devices
- Stress testing (long sessions)
- Edge case testing (bankruptcy, extreme stress, etc.)
- Accessibility testing

---

## 9. Build & Deployment

### 9.1 Android Build

```
- Target API: 28+
- Arch: ARM64 + ARMv7
- Min SDK: API 21
- APK size target: <100MB
```

### 9.2 iOS Build

```
- Min iOS: 12.0
- Architecture: ARM64
- Code signing required
- App Store guidelines compliance
```

### 9.3 Web Build (Future)

- HTML5 export
- PWA capability
- Responsive design
- Server for cloud saves (optional)

---

## 10. Code Quality Standards

### 10.1 Naming Conventions

- Classes: PascalCase
- Methods/variables: snake_case
- Constants: UPPER_SNAKE_CASE
- Signals: snake_case with past tense (e.g., `player_died`)

### 10.2 Documentation

- Docstrings for all public methods
- Inline comments for complex logic
- Design patterns documented
- API reference maintained

### 10.3 Version Control

- Feature branches for major systems
- Pull requests with code review
- Commit messages: `[Category] Description`
- Semantic versioning (1.0.0)

---

## 11. CI/CD Pipeline (Future)

- Automated tests on every commit
- Build for Android/iOS on release
- Performance benchmarking
- Accessibility scanning
- Automated versioning

---

**End of Technical Architecture Document**
