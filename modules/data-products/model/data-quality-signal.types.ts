import type {
  DataQualitySignalStatus,
  DataQualitySignalType,
} from "../domain/data-product.enums.ts";

export interface DataQualitySignal {
  id: string;
  label: string;
  signalType: DataQualitySignalType;
  status: DataQualitySignalStatus;
  value: string | null;
  measuredAt: Date | null;
  notes: string | null;
}
