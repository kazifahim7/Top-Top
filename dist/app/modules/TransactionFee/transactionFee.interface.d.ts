export interface ITransactionFeeSetting {
    key: "global";
    percentage: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface TransactionFeeQuote {
    originalPrice: number;
    transactionFee: number;
    totalPrice: number;
    feePercentage: number;
    fixedTransactionFee: number;
    currencyCode: string;
    countryCode: string;
}
//# sourceMappingURL=transactionFee.interface.d.ts.map