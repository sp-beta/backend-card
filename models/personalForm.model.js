// models/personalForm.model.js
import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema({
  instagram: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  facebook: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  youtube: { type: String, default: '' },
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const personalFormSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  jobTitle: { type: String, required: true },
  socialMedia: socialMediaSchema,
  personPhoto: { type: String, required: true },
  services: [serviceSchema],
  website :{type: String,required: true},
});

const PersonalFormModel = mongoose.model("PersonalForm", personalFormSchema);

export default PersonalFormModel;
