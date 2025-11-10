declare module "web-vitals" {
  interface Metric {
    name: string;
    value: number;
    id: string;
    rating?: string;
  }

  type ReportCallback = (metric: Metric) => void;

  export const onCLS: (cb: ReportCallback) => void;
  export const onFID: (cb: ReportCallback) => void;
  export const onLCP: (cb: ReportCallback) => void;
  export const onINP: (cb: ReportCallback) => void;
  export const onTTFB: (cb: ReportCallback) => void;
  export const onFCP: (cb: ReportCallback) => void;
}

declare module "next/dist/compiled/web-vitals" {
  export * from "web-vitals";
}
