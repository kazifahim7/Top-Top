import AppError from "../../Error/AppError.js";
import { roundCurrencyAmount } from "../../utils/stripeAmount.js";
import { CountryModel } from "../Country/country.model.js";
import { CountryService } from "../Country/country.service.js";
import { LobbyModel } from "../Lobby/lobby.model.js";
import { TournamentModel } from "../Tournament/Tournament.model.js";
import { TransactionFeeSettingModel } from "./transactionFee.model.js";
import type { TransactionFeeQuote } from "./transactionFee.interface.js";

const GLOBAL_KEY = "global" as const;

const normalizePercentage = (value: unknown) => {
     if (value === undefined || value === null || value === "") return 0;
     const numericValue = typeof value === "number" ? value : Number(value);
     if (!Number.isFinite(numericValue) || numericValue < 0) {
          throw new AppError(400, "percentage must be a non-negative number");
     }
     return numericValue;
};

const getGlobalSetting = async () => {
     return TransactionFeeSettingModel.findOne({ key: GLOBAL_KEY });
};

const createGlobalSetting = async (payload: Record<string, unknown>) => {
     const existing = await getGlobalSetting();
     if (existing) throw new AppError(409, "Transaction fee setting already exists");

     return TransactionFeeSettingModel.create({
          key: GLOBAL_KEY,
          percentage: normalizePercentage(payload.percentage),
     });
};

const updateGlobalSetting = async (payload: Record<string, unknown>) => {
     return TransactionFeeSettingModel.findOneAndUpdate(
          { key: GLOBAL_KEY },
          { percentage: normalizePercentage(payload.percentage) },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
     );
};

const getCountryFees = async (includeInactive = true) => {
     await CountryService.ensureDefaultCountry();
     return CountryModel.find(includeInactive ? {} : { isActive: true })
          .select("countryCode name currencyCode fixedTransactionFee isActive")
          .sort({ name: 1 });
};

const updateCountryFixedFee = async (countryCode: string, payload: Record<string, unknown>) => {
     await CountryService.ensureDefaultCountry();
     const normalizedCode = CountryService.normalizeCountryCode(countryCode);
     const fixedTransactionFee = CountryService.normalizeMoneyAmount(payload.fixedTransactionFee);

     const result = await CountryModel.findOneAndUpdate(
          { countryCode: normalizedCode },
          { fixedTransactionFee },
          { new: true, runValidators: true }
     ).select("countryCode name currencyCode fixedTransactionFee isActive");

     if (!result) throw new AppError(404, "Country not found");
     return result;
};

const resolveQuoteSource = async (payload: Record<string, unknown>) => {
     const paymentType = payload.paymentType;

     if (paymentType === "team fee") {
          const lobbyId = payload.lobbyId;
          if (!lobbyId) throw new AppError(400, "lobbyId is required for team fee quotes");
          const lobby = await LobbyModel.findById(lobbyId).select("price countryCode currencyCode");
          if (!lobby) throw new AppError(404, "Lobby not found");
          return {
               originalPrice: lobby.price,
               countryCode: CountryService.normalizeCountryCode(lobby.countryCode),
               currencyCode: CountryService.normalizeCurrencyCode(lobby.currencyCode),
          };
     }

     if (paymentType === "tournament fee") {
          const tournamentId = payload.tournamentId;
          if (!tournamentId) throw new AppError(400, "tournamentId is required for tournament fee quotes");
          const tournament = await TournamentModel.findById(tournamentId).select("price countryCode currencyCode");
          if (!tournament) throw new AppError(404, "Tournament not found");
          return {
               originalPrice: tournament.price,
               countryCode: CountryService.normalizeCountryCode(tournament.countryCode),
               currencyCode: CountryService.normalizeCurrencyCode(tournament.currencyCode),
          };
     }

     throw new AppError(400, "paymentType must be team fee or tournament fee");
};

const buildQuote = async (payload: Record<string, unknown>): Promise<TransactionFeeQuote> => {
     const source = await resolveQuoteSource(payload);
     const setting = await getGlobalSetting();
     const country = await CountryService.getCountryByCode(source.countryCode, true);
     const feePercentage = setting?.percentage ?? 0;
     const fixedTransactionFee = country?.fixedTransactionFee ?? 0;
     const percentageFee = (source.originalPrice * feePercentage) / 100;
     const transactionFee = roundCurrencyAmount(percentageFee + fixedTransactionFee, source.currencyCode);
     const originalPrice = roundCurrencyAmount(source.originalPrice, source.currencyCode);
     const totalPrice = roundCurrencyAmount(originalPrice + transactionFee, source.currencyCode);

     return {
          originalPrice,
          transactionFee,
          totalPrice,
          feePercentage,
          fixedTransactionFee,
          currencyCode: source.currencyCode,
          countryCode: source.countryCode,
     };
};

export const TransactionFeeService = {
     getGlobalSetting,
     createGlobalSetting,
     updateGlobalSetting,
     getCountryFees,
     updateCountryFixedFee,
     buildQuote,
};
