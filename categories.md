Based on the API structures, here is the complete breakdown of every category (endpoint) and subcategory available in each system.

### **1. Open5e API**

**Philosophy:** "The Spotify of D&D." It has fewer endpoints because it nests related data (like subclasses) inside the main objects. It focuses on *content* over *granular rules*.

#### **Core Content**

* **Monsters** (`/monsters/`): Stat blocks for all creatures.
* **Spells** (`/spells/`): All magic spells.
* **Classes** (`/classes/`): Character classes (Subclasses are nested inside here).
* **Races** (`/races/`): Playable species (Subraces and Traits are nested inside here).
* **Backgrounds** (`/backgrounds/`): Character origins.
* **Feats** (`/feats/`): Optional character abilities.
* **Magic Items** (`/magicitems/`): Enchanted gear.
* **Weapons** (`/weapons/`): Mundane weapons.
* **Armor** (`/armor/`): Mundane armor.

#### **Rules & Reference**

* **Conditions** (`/conditions/`): Status effects (Blinded, Prone).
* **Sections** (`/sections/`): The actual text of the SRD rules (Combat, Movement, etc.).
* **Planes** (`/planes/`): Information on the planes of existence.

#### **Meta**

* **Documents** (`/documents/`): The source books (SRD, Tome of Beasts, etc.) used to filter the other endpoints.
* **Search** (`/search/`): A global search endpoint across all categories.

---

### **2. D&D 5e SRD API (5e-bits)**

**Philosophy:** "The Public Library of D&D." It is highly relational and granular. It breaks data down into the smallest possible pieces, meaning you often have to query multiple endpoints to build a single character.

#### **Character Data**

* **Ability Scores** (`/ability-scores`): STR, DEX, CON, INT, WIS, CHA.
* **Alignments** (`/alignments`): Lawful Good, Chaotic Evil, etc.
* **Backgrounds** (`/backgrounds`): Character origins.
* **Classes** (`/classes`): The main class definitions.
* **Subclasses** (`/subclasses`): Specific archetypes (e.g., Champion) linked to classes.
* **Features** (`/features`): Specific level-up abilities (e.g., Sneak Attack).


* **Races** (`/races`): The main race definitions.
* **Subraces** (`/subraces`): Variations (e.g., High Elf).
* **Traits** (`/traits`): Racial abilities (e.g., Darkvision).


* **Skills** (`/skills`): The 18 skill proficiencies.
* **Languages** (`/languages`): Spoken languages.
* **Proficiencies** (`/proficiencies`): Broad categories (e.g., "Light Armor").

#### **Equipment & Items**

* **Equipment** (`/equipment`): General gear (includes weapons/armor).
* **Equipment Categories** (`/equipment-categories`): Groupings like "Adventuring Gear" or "Tools".
* **Magic Items** (`/magic-items`): Enchanted objects.
* **Weapon Properties** (`/weapon-properties`): Attributes like Finesse or Thrown.

#### **Magic**

* **Spells** (`/spells`): The spell definitions.
* **Magic Schools** (`/magic-schools`): Evocation, Abjuration, etc.

#### **Rules & Mechanics**

* **Conditions** (`/conditions`): Status effects.
* **Damage Types** (`/damage-types`): Fire, Slashing, etc.
* **Rules** (`/rules`): Top-level rule categories (Combat, Adventuring).
* **Rule Sections** (`/rule-sections`): Specific text blocks from the rules.

#### **Creatures**

* **Monsters** (`/monsters`): Stat blocks for creatures.

### **Key Comparison for Your Schema**

* **If you want easy data entry:** Use **Open5e's** approach. It's easier to store "Fireball" as one object with all its details.
* **If you want a complex relational database:** Use **5e-bits'** approach. It separates "Fire Damage" into its own ID so you can programmatically link every spell that deals fire damage.
