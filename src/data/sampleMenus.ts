export interface SampleMenuPreset {
  id: string;
  title: string;
  hostelTag: string;
  description: string;
  rawText: string;
}

export const SAMPLE_MENUS: SampleMenuPreset[] = [
  {
    id: 'iiit_prayagraj_weekly',
    title: 'IIIT Prayagraj: BH-2 & BH-3 Full Weekly Mess Menu',
    hostelTag: 'IIIT Prayagraj (Weekly Schedule)',
    description: 'Complete 7-day hostel timetable (Mon to Sun) with daily eggs/milk, litti chokha, kadhi pakora, egg curry, chicken curry, soya aloo.',
    rawText: `KMK GLOBAL LIMITED: IIIT PRAYAGRAJ BH-2 & 3 MESS MENU

MON:
Breakfast: Chola Samosa, Meethi Chutney, Hari Chutney, Dalia, Bread, Butter, Milk, 2 Boiled Eggs
Lunch: Punjabi Kadhi-Pakode, Aloo-Shimlamirch, Pineapple Raita, Jeera Rice, 4 Roti, Green Salad
Dinner: Egg Curry / Kadhai Paneer, Moong Daal, Rice, 4 Roti, Gulab Jamun, Green Salad

TUE:
Breakfast: Uttapam, Sambhar, Coconut Chutney, Cornflakes with Milk, Bread Butter
Lunch: Litti Chokha, Arhar Daal, Rice, Lassi, Sambhar, Green Salad
Dinner: Veg Kofta Curry, Arhar Daal Tadka, Rice, 4 Roti, Fruit Custard, Green Salad

WED:
Breakfast: Pav Bhaji, Dalia, Sprouted Moong Salad, Tea, Bread Butter
Lunch: Kali Masoor Daal, Kaddu Sabzi, Plain Dahi, Rice, Puri, Sambhar, Green Salad
Dinner: Chana Masala, 4 Roti, Arhar Daal, Veg Fried Rice, Sooji Halwa, Green Salad

THU:
Breakfast: Medu Vada, Sambhar, Coconut Chutney, Cornflakes with Milk, 2 Boiled Eggs
Lunch: Safed Matar Masala, Dal Makhni, Veg Pulao, Chaach, Sambhar, 4 Roti, Green Salad
Dinner: Aloo-Pattagobhi, 4 Roti, Rajma Curry, Rice, Milk Cake, Green Salad

FRI:
Breakfast: Poha + Haldiram Bhujiya, Jalebi, Dalia, Bread Butter, Milk
Lunch: Aloo Bhujiya Sabzi, Chana Daal Tadka, Rice, 4 Roti, Plain Dahi, Green Salad
Dinner: Chicken Curry / Paneer-Pyaaz Paratha, Moong Dal, Rice, Kaju Katli, Green Salad

SAT:
Breakfast: Masala Dosa, Coconut Chutney, Sambhar, Cornflakes with Milk, 2 Boiled Eggs
Lunch: Chole Bhature, Rice, Boondi Raita, Sambhar, Green Salad
Dinner: Soya Chunks Curry (Nutrela), Arhar Dal Tadka, Veg Pulao, 4 Roti, Ice-Cream, Green Salad

SUN:
Breakfast: Aloo-Pyaaz Paratha, Plain Dahi, Chutney, Cornflakes with Milk
Lunch: Aloo Jhol, Arhar Dal Tadka, Mix Veg Raita, Veg Biriyani, 4 Roti, Green Salad
Dinner: Veg Chowmein, Veg Manchurian Gravy, Mix Daal, Rice, 4 Roti, Sewai Kheer, Green Salad

DAILY SERVED:
Breakfast: Bread, Butter, Jam, Egg / Banana, Tea, Coffee, and Milk served daily.
Lunch & Dinner: Salad (Carrot, Beetroot, Tomato, Cucumber, Onion) and Mix Achaar served daily.`,
  },
  {
    id: 'north_mess_rajma_day',
    title: 'Monday: Classic Rajma-Chawal Mess Day',
    hostelTag: 'North Indian Hostel (IIT/NIT)',
    description: 'Typical heavy carb mess day: Poha breakfast, Rajma Chawal lunch, Dal Tadka + Aloo Gobhi dinner.',
    rawText: `MONDAY MESS MENU:
Breakfast: Poha, Boiled Kala Chana Chaat, Chai, Bread Jam
Lunch: Rajma Curry, Steamed White Rice, Dahi (Plain Curd), 3 Roti, Cucumber Salad
Snacks: Samosa (1 pc), Chai
Dinner: Dal Tadka, Aloo Gobhi, 4 Chapati, Steamed White Rice, Gulab Jamun`,
  },
  {
    id: 'nonveg_egg_curry_day',
    title: 'Wednesday: Egg Curry & Matar Paneer Night',
    hostelTag: 'Engineering Hostel Special',
    description: 'Mid-week special: Idli sambar breakfast, Chole chawal lunch, Egg Curry / Matar Paneer dinner.',
    rawText: `WEDNESDAY MESS MENU:
Breakfast: 2 Idli, Sambar, Bread Butter, Milk
Lunch: Chole Masala, Jeera Rice, Boondi Raita, 3 Roti, Green Salad
Snacks: Bread Pakora, Tea
Dinner: Egg Curry (2 eggs) OR Matar Paneer, Dal Fry, 4 Roti, Steamed Rice, Suji Halwa`,
  },
  {
    id: 'sunday_chicken_biryani_day',
    title: 'Sunday: Chicken / Veg Biryani Feast',
    hostelTag: 'Weekend Feast',
    description: 'High calorie Sunday feast: Aloo Paratha breakfast, Chicken / Veg Biryani lunch, Light Dal Khichdi dinner.',
    rawText: `SUNDAY MESS SPECIAL:
Breakfast: Aloo Paratha (2 pcs), Plain Dahi, Chai
Lunch: Chicken Biryani (or Veg Biryani), Boondi Raita, Green Salad
Snacks: Tea, Biscuits
Dinner: Moong Dal Khichdi, Kadhi Pakora, 2 Roti, Papad`,
  },
  {
    id: 'budget_watery_dal_day',
    title: 'Typical Budget Mess (The Harsh Reality)',
    hostelTag: 'Budget College Mess',
    description: 'Shows why lifters fail: Upma breakfast, Lauki Sabzi + thin Dal lunch, Bhindi Masala dinner (Total protein ~38g!).',
    rawText: `FRIDAY DAILY ROSTER:
Breakfast: Upma, Chai, 2 Bread Jam
Lunch: Lauki Sabzi, Dal Tadka, Steamed Rice, 3 Roti, Onion Salad
Snacks: Tea
Dinner: Bhindi Masala, Dal Fry, 4 Roti, Plain Rice, Kheer`,
  },
];
