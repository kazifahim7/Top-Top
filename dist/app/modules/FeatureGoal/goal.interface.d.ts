export interface IGoal {
    goalTitle: string;
    goalLink: string;
    isScheduled: boolean;
    scheduledDate?: Date | null;
    status: "pending" | "active" | "completed";
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=goal.interface.d.ts.map