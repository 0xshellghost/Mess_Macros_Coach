*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

Mess Macro Coach is a protein tracker for hostel food, built for my friend Jatin.

Jatin is 72 kg and goes to the campus gym 5 days a week. A lifter his size aiming for 2 g of protein per kg needs **144 g a day**. He eats at our hostel mess like the rest of us, and I wanted to know what that food actually gives him.

You paste the week's mess menu, or upload a photo of the noticeboard, and the app shows the protein for every meal and every day, then suggests cheap canteen add-ons to close the gap.

For our hostel's weekly menu (BH-2 and BH-3), mess food alone averages **81 g a day**. That is about 63 g short of his target. His best day is 96.6 g and his worst is 64.7 g.

The reason is dal. Mess dal is watery, and in my food table a katori of moong dal gives about 5 g of protein, not the 15 g people tend to assume.

## Demo

Live app (hosted on Google Cloud Run): https://mess-macro-coach-341031291694.asia-southeast1.run.app

Select the "IIIT Prayagraj weekly schedule" menu, press **Analyze Menu Nutrition**, and click any day to see its meals.

![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/kxqeo61iqolog8zv1zzk.png)

## Code

`{% embed https://github.com/0xshellghost/Mess_Macros_Coach %}`

## How I Built It

The main design decision is that **the model reads and the code calculates**.

```
Mess menu (text or noticeboard photo)
        │
        ▼
Gemini 3.8 Flash (or local Gemma 2 / Qwen2-VL) reads the menu → a clean list of dish names, no numbers
        │
        ▼
Deterministic engine: looks up each dish in a table of 65+ Indian foods
(IFCT 2017 + USDA values) and does the math
        │
        ▼
Daily protein totals + budget canteen add-ons
```

- **The model never writes a nutrition number.** Asking a model to "estimate the protein in this plate" invents numbers, so I only let it turn messy menu text into dish names.
- **The code does all the math** from a table of 65+ Indian foods based on the ICMR-NIN Indian Food Composition Tables (IFCT 2017) and USDA FoodData Central.
- **Unknown dishes count as 0 g and are flagged**, so Jatin doesn't get false comfort from a dish the table can't match.

The portion sizes (a 150 g katori, a 35 g roti) are my own estimates, and so are items like mess milk (6.8 g / 190 ml). You can change the quantity of any item in the app with portion multipliers.

Tech stack: React 19, TypeScript, Vite, Tailwind CSS v4, Node.js (Express server), and the `@google/genai` SDK.

While building the parser, I noticed menu entries like `"Egg Curry / Kadhai Paneer"`. The slash represents an "either/or" mess option, so the parser was tuned to handle mutual exclusions rather than double-counting both proteins.

## Why Does Open Innovation Matter?

- **I can swap the model.** Because the model is strictly limited to vision OCR and returns structured JSON strings, swapping between Gemini 3.8 Flash in the cloud and open models like Gemma 2 or Qwen2-VL locally via Ollama is a one-setting change. A messy noticeboard photo taken under poor hostel corridor lighting is a niche input, so having open vision models available is essential.
- **The food table is open and auditable.** Commercial calorie apps lock their food databases behind paywalls. Mine is an open TypeScript table (`messFoods.ts`) that anyone can read. A student at IIT or NIT can check the exact grams, adjust the katori bowl size for their specific mess contractor, or submit a pull request with regional recipes (like Litti Chokha or Medu Vada).
- **Runs locally with Ollama.** The live demo is hosted on Google Cloud Run for convenience, but the codebase supports running fully offline with Ollama and Docker, ensuring Jatin's eating logs and timetable photos never leave his machine.

## Results

These numbers are **calculated from the menu, not logged intake**. I haven't measured what Jatin actually ate.

| | Day 1 | Day 2 | Day 3 | Average |
|---|---|---|---|---|
| Mess food only | 87.8 g | 64.7 g | 66.3 g | 73.0 g |
| With canteen add-ons | 172.8 g | 159.7 g | 154.3 g | 162.3 g |
| Add-on spend | ₹24 | ₹45 | ₹45 | ~₹38/day |

The add-ons overshoot the 144 g target, so Jatin would only need about half of them. The cheapest ones:

- 2 boiled eggs: ₹14, +13 g
- 50 g soya chunks boiled in a hostel kettle: ₹10, +26 g
- Roasted chana (50 g): ₹15, +10 g
- Egg bhurji or omelette: ₹30, +14 g

## What Jatin Said

I showed Jatin the app in our hostel room yesterday evening and ran our actual IIIT Prayagraj BH-2/3 menu through it right in front of him. When Tuesday's total showed just 64.7 g against his 144 g target, he stared at the screen for a moment and said:

> *"Wait, are you telling me I've been forcing down three katoris of yellow water every single afternoon thinking I was hitting my macros? That is depressing, man. But honestly, knowing I can just boil a ₹10 pack of soya chunks in my electric kettle and dump it into the dal fixes the whole gap for less than what I spend on tapri chai. I'm keeping a packet in my room from tomorrow."*

## What's Next

- More regional dishes in the open table (especially regional South Indian and North-Eastern hostel staples)
- Editable portion sizes per hostel contractor
- Step-by-step local setup with Ollama and Docker Compose in the README
