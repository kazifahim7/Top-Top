import AppError from "../../Error/AppError.js";
import { BookingGuidelinesModel } from "./bookingGuidelines.model.js";

const GLOBAL_KEY = "global" as const;

const DEFAULT_CONTENT = `1. 🔴 Non-attendance = ban. Failing to show up without cancelling in advance will result in a temporary or permanent ban from TopTop.
2. 🟡 Cancel 12 hours before kickoff to remove your name and receive a full refund. Cancellations after this window are not eligible for a refund.
3. 🟢 Player confirms they have reviewed the match location shown on the lobby overview and are able to attend.
4. 🔵 Can't make it? Remove your name as early as possible — even if past the refund window. This lets another player take the spot.
5. ⚫ Respectful conduct required. Abusive behaviour toward players, organizers, or referees — on or off the pitch — may result in removal from the platform.`;

const normalizeContent = (value: unknown) => {
     if (typeof value !== "string" || value.trim().length === 0) {
          throw new AppError(400, "content is required");
     }

     return value.replace(/\r\n/g, "\n");
};

const getGlobalGuidelines = async () => {
     const guidelines = await BookingGuidelinesModel.findOne({ key: GLOBAL_KEY });
     if (guidelines) return guidelines;

     return {
          key: GLOBAL_KEY,
          content: DEFAULT_CONTENT,
          isDefault: true,
          createdAt: null,
          updatedAt: null,
     };
};

const createGlobalGuidelines = async (payload: Record<string, unknown>) => {
     const existing = await BookingGuidelinesModel.findOne({ key: GLOBAL_KEY });
     if (existing) throw new AppError(409, "Booking guidelines already exist");

     return BookingGuidelinesModel.create({
          key: GLOBAL_KEY,
          content: normalizeContent(payload.content),
     });
};

const updateGlobalGuidelines = async (payload: Record<string, unknown>) => {
     return BookingGuidelinesModel.findOneAndUpdate(
          { key: GLOBAL_KEY },
          { content: normalizeContent(payload.content) },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
     );
};

export const BookingGuidelinesService = {
     getGlobalGuidelines,
     createGlobalGuidelines,
     updateGlobalGuidelines,
};
