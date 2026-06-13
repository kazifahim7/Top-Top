import { model, Schema } from "mongoose";
const CountryCitySchema = new Schema({
    id: { type: Number, required: true },
    city: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    areas: { type: [String], default: [] },
}, { _id: false });
const CountrySchema = new Schema({
    countryCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    dialCode: { type: String, required: true, trim: true },
    currencyCode: { type: String, required: true, trim: true, uppercase: true },
    merchantCountryCode: { type: String, required: true, trim: true, uppercase: true },
    isActive: { type: Boolean, default: true },
    cities: { type: [CountryCitySchema], default: [] },
}, { timestamps: true });
CountrySchema.index({ isActive: 1, name: 1 });
export const CountryModel = model("Country", CountrySchema);
//# sourceMappingURL=country.model.js.map