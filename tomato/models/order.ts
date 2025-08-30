import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  items: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  amount: { type: Number, required: true }, // make sure this matches the field in your JSON
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
