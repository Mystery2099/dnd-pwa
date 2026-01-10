To access these specific sources via the Open5e API, you use the **`document__slug`** filter. This parameter tells the API to only return content from the specific book or source you want.

You can verify the exact slug by looking at the small "badge" next to the name in your screenshot (e.g., the badge `TOB` corresponds to the slug `tob`).

### **The Filter**

Append `?document__slug=[slug]` to your API request.

*OC **Single Source:** `https://api.open5e.com/monsters/?document__slug=tob`
* **Multiple Sources:** You can often chain them or make separate requests (depending on your implementation), but standard practice is one request per filter or filtering the results on your end.

### **Slug Mapping**

Here are the specific slugs for every item in your image (based on the badges shown):

| Publisher | Source Name | API Slug |
| --- | --- | --- |
| **Open5e** | Open5e Original Content | `o5e` |
| **WotC** | 5e Core Rules (SRD) | `wotc-srd` (sometimes `5esrd`) |
| **Kobold Press** | Tome of Beasts | `tob` |
|  | Creature Codex | `cc` |
|  | Tome of Beasts 2 | `tob2` |
|  | Deep Magic 5e | `dmag` |
|  | Tome of Beasts 3 | `tob3` |
|  | Kobold Press Compilation | `kp` |
|  | Deep Magic Extended | `dmag-e` |
|  | Warlock Archives | `warlock` |
|  | Vault of Magic | `vom` |
|  | Tome of Heroes | `toh` |
|  | Black Flag SRD | `blackflag` |
|  | Tome of Beasts 2023 | `tob-2023` |
| **EN Publishing** | Level Up Advanced 5e Monstrous Menagerie | `menagerie` |
|  | Level Up Advanced 5e | `a5e` |
| **Green Ronin** | Critical Role: Tal’Dorei Campaign Setting | `taldorei` |

### **Example Usage**

**1. Get only monsters from "Tome of Beasts 2":**

```http
GET https://api.open5e.com/monsters/?document__slug=tob2

```

**2. Get spells from "Deep Magic":**

```http
GET https://api.open5e.com/spells/?document__slug=dmag

```

**3. Get magic items from "Vault of Magic":**

```http
GET https://api.open5e.com/magicitems/?document__slug=vom

```

### **Important Note on Content Types**

Not every source has every type of content.

* **`menagerie`**, **`tob`**, **`cc`**, and **`tob-2023`** will mostly work on the **`/monsters/`** endpoint.
* **`vom`** will mostly work on the **`/magicitems/`** endpoint.
* **`dmag`** will mostly work on the **`/spells/`** endpoint.
* **`wotc-srd`**, **`a5e`**, and **`blackflag`** are full systems, so they will return data for almost every endpoint (Classes, Races, Monsters, Spells, etc.).
