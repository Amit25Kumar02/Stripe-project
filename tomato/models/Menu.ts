import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  price: number;
}

export interface IMenu extends Document {
  restaurantId: mongoose.Types.ObjectId; // link with Restaurant
  items: IMenuItem[];
}

const MenuItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const MenuSchema: Schema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, unique: true },
  items: [MenuItemSchema],
});

const Menu: Model<IMenu> = mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);

export default Menu;
