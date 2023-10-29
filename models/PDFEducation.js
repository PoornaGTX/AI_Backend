import mongoose from "mongoose";

const PDFEduSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, "Please provide year"],
      maxlength: 4,
      minlength: 4,
    },
    age: {
      type: Number,
      required: [true, "Please provide age"],
      maxlength: 10,
      minlength: 1,
    },
    type: {
      type: String,
      enum: ["Education", "Occupation"],
      default: "Reason",
    },
    educationAllDeathCount: {
      type: Array,
    },
    education: {
      type: String,
    },
    GenratedDate: {
      type: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("PdfEdu", PDFEduSchema);
