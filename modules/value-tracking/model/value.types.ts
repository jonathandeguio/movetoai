export type ValueMetricPoint = {
  id: string;
  name: string;
  value: number;
  capturedAt: Date | null;
};

export type ValueSummary = {
  totalExpectedValue: number;
  totalRealizedValue: number;
  adoptionOverview: number | null;
};

export type ValueTableItem = {
  id: string;
  initiativeName: string;
  opportunityId: string | null;
  opportunityTitle: string | null;
  expectedValue: number;
  realizedValue: number;
  expectedRoi: number | null;
  realizedRoi: number | null;
  adoption: number | null;
  status: string;
  currencyCode: string;
};
