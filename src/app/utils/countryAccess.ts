import AppError from "../Error/AppError.js";
import { userModel } from "../modules/auth/auth.model.js";
import { CountryService } from "../modules/Country/country.service.js";

export const getUserCountryCode = async (userId: string) => {
     const user = await userModel.findById(userId).select("countryCode");
     if (!user) throw new AppError(404, "This user Not Found");
     return CountryService.normalizeCountryCode(user.countryCode || CountryService.DEFAULT_COUNTRY_CODE);
};

export const assertSameCountry = (requestedCountryCode: unknown, userCountryCode: string) => {
     const normalizedRequested = CountryService.normalizeCountryCode(requestedCountryCode);
     const normalizedUser = CountryService.normalizeCountryCode(userCountryCode);
     const filter = CountryService.buildLegacyCountryFilter(normalizedUser);

     if (normalizedUser === CountryService.DEFAULT_COUNTRY_CODE) {
          const values = (filter as any).$or?.map((item: any) => item.countryCode).filter((value: unknown) => typeof value === "string");
          const isLegacyDefault = requestedCountryCode === undefined || requestedCountryCode === null || requestedCountryCode === "";
          if (isLegacyDefault || values?.includes(normalizedRequested)) return;
     }

     if (normalizedRequested !== normalizedUser) {
          throw new AppError(403, "This content is not available in your country");
     }
};
