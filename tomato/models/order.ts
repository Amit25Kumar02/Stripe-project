import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  items: [
    {
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
    },
  ],
  amount: {
    type: Number,
    required: true
  },
  // Update the enum to include 'in process'
  orderStatus: {
    type: String,
    enum: ["ordered", "in process", "delivered"],
    default: "ordered",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);