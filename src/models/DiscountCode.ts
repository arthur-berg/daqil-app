import mongoose from "mongoose";

const Schema = mongoose.Schema;

const discountCode = new Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    firstTimeUserOnly: {
      type: Boolean,
      default: false,
    },
    limitPerUser: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { collection: "discount_codes" }
);

export default mongoose.models?.DiscountCode ||
  mongoose.model("DiscountCode", discountCode);
