import { model, Schema } from "mongoose";
import type { CountryCity, ICountry } from "./country.interface.js";

const CountryCitySchema = new Schema<CountryCity>(
     {
          id: { type: Number, required: true },
          city: { type: String, required: true, trim: true },
          slug: { type: String, required: true, trim: true, lowercase: true },
          areas: { type: [String], default: [] },
     },
     { _id: false }
);

const CountrySchema = new Schema<ICountry>(
     {
          countryCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
          name: { type: String, required: true, trim: true },
          dialCode: { type: String, required: true, trim: true },
          currencyCode: { type: String, required: true, trim: true, uppercase: true },
          merchantCountryCode: { type: String, required: true, trim: true, uppercase: true },
          isActive: { type: Boolean, default: true },
          cities: { type: [CountryCitySchema], default: [] },
     },
     { timestamps: true }
);

CountrySchema.index({ isActive: 1, name: 1 });

export const CountryModel = model<ICountry>("Country", CountrySchema);
