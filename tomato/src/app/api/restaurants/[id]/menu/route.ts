import { NextRequest, NextResponse } from "next/server";

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

// Dummy menus
const mockMenus: { [key: string]: MenuItem[] } = {
  res1: [
    { id: "m1", name: "Paneer Tikka", price: 20 },
    { id: "m2", name: "Veg Hakka Noodles", price: 18 },
    { id: "m3", name: "Mushroom Manchurian", price: 22 },
    { id: "m4", name: "Butter Naan", price: 5 },
    { id: "m5", name: "Veg Biryani", price: 21 },
    { id: "m6", name: "Dal Makhani", price: 20 },
    { id: "m7", name: "Gulab Jamun", price: 9 },
    { id: "m8", name: "Paneer Butter Masala", price: 25 },
    { id: "m9", name: "Jeera Rice", price: 12 },
  ],
  res2: [
    { id: "m10", name: "Veg Burger", price: 12 },
    { id: "m11", name: "French Fries", price: 8 },
    { id: "m12", name: "Cheese Pizza", price: 25 },
    { id: "m13", name: "Coke / Pepsi", price: 5 },
    { id: "m14", name: "Veg Sandwich", price: 15 },
    { id: "m15", name: "Chicken Burger", price: 18 },
    { id: "m16", name: "Chicken Nuggets", price: 20 },
    { id: "m17", name: "Garlic Bread", price: 10 },
    { id: "m18", name: "Cold Coffee", price: 12 },
  ],
  res3: [
    { id: "m19", name: "Chicken Biryani", price: 25 },
    { id: "m20", name: "Tandoori Roti", price: 3 },
    { id: "m21", name: "Butter Chicken", price: 28 },
    { id: "m22", name: "Dal Makhani", price: 20 },
    { id: "m23", name: "Gulab Jamun", price: 9 },
    { id: "m24", name: "Paneer Tikka Masala", price: 25 },
    { id: "m25", name: "Jeera Rice", price: 12 },
    { id: "m26", name: "Naan Basket", price: 15 },
    { id: "m27", name: "Raita", price: 5 },
  ],
  res4: [
    { id: "m28", name: "Veg Sub Sandwich", price: 15 },
    { id: "m29", name: "Chicken Sub Sandwich", price: 20 },
    { id: "m30", name: "Cold Coffee", price: 12 },
    { id: "m31", name: "Choco Brownie", price: 9 },
    { id: "m32", name: "Veggie Wrap", price: 16 },
    { id: "m33", name: "Grilled Chicken Wrap", price: 21 },
    { id: "m34", name: "French Fries", price: 8 },
    { id: "m35", name: "Cheese Corn Toast", price: 11 },
    { id: "m36", name: "Pepsi / Coke", price: 5 },
  ],
  res5: [
    { id: "m37", name: "Grilled Chicken", price: 30 },
    { id: "m38", name: "Barbeque Platter", price: 45 },
    { id: "m39", name: "Veg Starter Platter", price: 25 },
    { id: "m40", name: "Tandoori Prawns", price: 40 },
    { id: "m41", name: "Paneer Tikka", price: 22 },
    { id: "m42", name: "Mutton Seekh Kebab", price: 35 },
    { id: "m43", name: "Garlic Naan", price: 8 },
    { id: "m44", name: "Butter Roti", price: 5 },
    { id: "m45", name: "Chocolate Mousse", price: 12 },
  ],
  res6: [
    { id: "m46", name: "Quinoa Salad", price: 18 },
    { id: "m47", name: "Grilled Veg Sandwich", price: 15 },
    { id: "m48", name: "Protein Smoothie", price: 12 },
    { id: "m49", name: "Fruit Bowl", price: 10 },
    { id: "m50", name: "Oats Pancake", price: 15 },
    { id: "m51", name: "Veggie Wrap", price: 16 },
    { id: "m52", name: "Detox Juice", price: 12 },
    { id: "m53", name: "Hummus & Pita", price: 13 },
    { id: "m54", name: "Greek Salad", price: 20 },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  const { id } = await params;
  const menu = mockMenus[id];

  if (!menu) {
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }

  return NextResponse.json(menu);
}