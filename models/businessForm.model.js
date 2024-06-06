import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema({
  instagram: { type: String, default: "" },
  whatsapp: { type: String, default: "" },
  facebook: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  youtube: { type: String, default: "" },
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const businessFormSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  companyMessage: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String },
  address: { type: String },
  website: { type: String },
  socialMedia: socialMediaSchema,
  businessLogo: { type: String },
  services: [serviceSchema],
});

const BusinessFormModel = mongoose.model("BusinessForm", businessFormSchema);

export default BusinessFormModel;
