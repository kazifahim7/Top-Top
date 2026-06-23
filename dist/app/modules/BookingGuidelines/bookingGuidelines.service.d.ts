export declare const BookingGuidelinesService: {
    getGlobalGuidelines: () => Promise<(import("mongoose").Document<unknown, {}, import("./bookingGuidelines.interface.js").IBookingGuidelines, {}, {}> & import("./bookingGuidelines.interface.js").IBookingGuidelines & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | {
        key: "global";
        content: string;
        isDefault: boolean;
        createdAt: null;
        updatedAt: null;
    }>;
    createGlobalGuidelines: (payload: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("./bookingGuidelines.interface.js").IBookingGuidelines, {}, {}> & import("./bookingGuidelines.interface.js").IBookingGuidelines & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateGlobalGuidelines: (payload: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("./bookingGuidelines.interface.js").IBookingGuidelines, {}, {}> & import("./bookingGuidelines.interface.js").IBookingGuidelines & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
};
//# sourceMappingURL=bookingGuidelines.service.d.ts.map