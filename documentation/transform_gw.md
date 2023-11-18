# GW-Transformation

## Sources

### Source T.GW_MODEL (Remote)

| Spaltename | Metadata |
| --- | --- |
| MODELL | - |

### Source T.ABSATZ (Remote)

| Spaltename | Metadata |
| --- | --- |
| EBENE | - |
| ORGAID | - |
| REGION | - |
| GEBIET | - |
| KETTE | - |
| PARTNER | - |
| JAHR | - |
| MONAT | - |
| MARKE | - |
| MODELL | - |
| GESCHAEFTSART | - |
| ABSATZ | - |

### Source T.ABSATZ_B2B (Remote)

| Spaltename | Metadata |
| --- | --- |
| JAHR | - |
| MONAT | - |
| MARKE | - |
| ABSATZ | - |
| ABSATZB2B | - |

### Source T.GW_ABSATZ_TAB (Local)

#### Column Definition

| Spaltename | Metadata |
| --- | --- |
| TREE_1 | - |
| TREE_2 | - |
| TREE_3 | - |
| GESAMT | { "TRANS_NAME": "TC_ABSATZ","AGG_COL": "ABSATZ", "COL_FLT": []},<br>{ "TRANS_NAME": "TC_ABSATZ_B2B","AGG_COL": "ABSATZB2B", "COL_FLT": []} |
| M1 | { "TRANS_NAME": "TC_ABSATZ","AGG_COL": "ABSATZ", "COL_FLT": [{ "FLT_COL": "MONAT", "FLT_VALUE": "1" }]},<br>{ "TRANS_NAME": "TC_ABSATZ_B2B","AGG_COL": "ABSATZB2B", "COL_FLT": [{ "FLT_COL": "MONAT", "FLT_VALUE": "1" }]} |
| ... | ... |
| M12 | { "TRANS_NAME": "TC_ABSATZ","AGG_COL": "ABSATZ", "COL_FLT": [{ "FLT_COL": "MONAT", "FLT_VALUE": "12" }]},<br>{ "TRANS_NAME": "TC_ABSATZ_B2B","AGG_COL": "ABSATZB2B", "COL_FLT": [{ "FLT_COL": "MONAT", "FLT_VALUE": "12" }]}|

#### Table Content 

| SORT | TREE_1 |TREE_2 |TREE_3 | Metadata |
| --- | --- | --- | --- | --- |
| 1 | Gesamt | Gesamt | ALLE | { "TRANS_NAME": "TC_ABSATZ" } |
| 2 | Gesamt | Audi | ALLE | "TRANS_NAME": "TC_ABSATZ",<br>"COL_FLT": [{ "FLT_COL": "MARKE", "FLT_VALUE": "Audi" }] |
| 3 | Gesamt | Gesamt | ALLE | { "TRANS_NAME": "BLOWUP_MOD",<br>"COLUMN": "TREE_3",<br>"TARGET_COLUMN": "MODELL"},<br>{"TRANS_NAME": "TC_ABSATZ",<br>"COL_FLT": [<br>{ "FLT_COL": "MARKE", "FLT_VALUE": "Audi" },<br>{ "FLT_COL": "MODELL", "FLT_VALUE_COLUMN": "TREE_3"}]} |
| 4 | Gesamt | davon Audi jGW | ALLE | "TRANS_NAME": "TC_ABSATZ",<br>"COL_FLT": [<br>{ "FLT_COL": "MARKE", "FLT_VALUE": "Audi" },<br>{ "FLT_COL": "GESCHAEFTSART", "FLT_VALUE": "Zukauf Audi jGW"}] |
| 5 | Gesamt | Andere Marken | ALLE | {"TRANS_NAME": "TC_ABSATZ",<br>"COL_FLT": [{ "FLT_COL": "MARKE", "FLT_VALUE": "Andere" }]} |
| 6 | B2B | B2B | ALLE | "TRANS_NAME": "TC_ABSATZ_B2B" |
| 7 | B2B | Audi | ALLE | "TRANS_NAME": "TC_ABSATZ_B2B",<br>"COL_FLT": [{ "FLT_COL": "MARKE", "FLT_VALUE": "Audi" }] |
| 8 | B2B | Andere Marken | ALLE | "TRANS_NAME": "TC_ABSATZ_B2B",<br>"COL_FLT": [{ "FLT_COL": "MARKE", "FLT_VALUE": "Andere" }] |
| 9 | B2B in % | B2B in % | ALLE | - |
| 10 | B2B in % | Audi | ALLE | - |
| 11 | B2B in % | Andere Marken | ALLE | - |

## Transformation Gruppierung

T.ABSATZ_GROUP_MON_MOD_GES:

| MONAT | MARKE | MODELL | GESCHAEFTSART | ABSATZ |
| --- | --- | ---  | --- | --- |
| 1 | Andere | A1 | Inzahlungnahme | 0 |
| 1 | Andere | Q5 | Inzahlungnahme | 2 |
| 1 | Audi | A1 | Leasingrückkläufer | 4 |
...

## Transformation Blowup

T.GW_ABSATZ_TAB_2

| SORT | TREE_1 | TREE_2 | TREE_3 | GESAMT | M1 | M2 | ... | M12 |
| --- | --- | ---  | --- | --- | --- | --- | --- | --- |
| 1 | Gesamt | Gesamt | ALLE | | | | | |
| 1 | Gesamt | Audi | ALLE | | | | | |
| 3 | Gesamt | Audi | 100 Avant | | | | | |
| 3 | Gesamt | Audi | A1 | | | | | |
| 3 | Gesamt | Audi | A1 Sportback | | | | | |
| 3 | Gesamt | Audi | A2 | | | | | |
...

## Transformation TreeCon

T.GW_ABSATZ_TAB_2 + T.ABSATZ_GROUP_MON_MOD_GES -> T.GW_ABSATZ_TAB_3

| SORT | TREE_1 | TREE_2 | TREE_3 | GESAMT | M1 | M2 | ... | M12 |
| --- | --- | ---  | --- | --- | --- | --- | --- | --- |
| 1 | Gesamt | Gesamt | ALLE | 212453 | 15115 | 19039 | | 0 |
| 1 | Gesamt | Audi | ALLE | 137333 | 9812 | 2 | | 0 |
| 3 | Gesamt | Audi | 100 Avant | 10 | 0 | 2 | | 0 |
| 3 | Gesamt | Audi | A1 | 2 | 1 | 0 | | 0 |
| 3 | Gesamt | Audi | A1 Sportback | 28 | 4 | 3 | | 0 |
| 3 | Gesamt | Audi | A2 | 14 | 2 | 1 | | 0 |
...
