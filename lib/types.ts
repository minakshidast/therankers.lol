export type Entry = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  amount: number;
  clicks: number;
  created_at: string;
  approved_at: string | null;
};

export type PendingEntry = Entry & {
  email: string;
  payment_ref: string | null;
  screenshot_url: string | null;
  status: "pending" | "approved" | "rejected";
  payment_method: "upi" | "paypal";
  payment_currency: "INR" | "USD";
  payment_amount: number;
  payment_fx_rate: number;
};
