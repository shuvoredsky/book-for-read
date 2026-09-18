"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Send,
  Loader2,
  AlertCircle,
  Hash,
  Phone,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { submitPaymentAction } from "@/server/actions/payment";
import { type PaymentMethod } from "@/lib/validations/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentFormProps {
  bookPrice: number;
}

export function PaymentForm({ bookPrice }: PaymentFormProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("bKash");
  const [transactionId, setTransactionId] = React.useState("");
  const [senderNumber, setSenderNumber] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanTxId = transactionId.trim().toUpperCase();
    const cleanNumber = senderNumber.trim();

    if (!cleanTxId || !cleanNumber) {
      toast.error("সবগুলো আবশ্যক তথ্য পূরণ করুন");
      return;
    }

    if (cleanTxId.length < 5) {
      setErrorMessage("সঠিক ট্রানজেকশন আইডি (TxID) প্রদান করুন");
      return;
    }

    if (cleanNumber.length < 11) {
      setErrorMessage("সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন");
      return;
    }

    setIsLoading(true);

    try {
      const res = await submitPaymentAction({
        paymentMethod,
        transactionId: cleanTxId,
        senderNumber: cleanNumber,
        amount: bookPrice,
        note: note.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "পেমেন্ট তথ্য সাবমিট করা সম্ভব হয়নি।");
        toast.error("পেমেন্ট সাবমিশন ব্যর্থ হয়েছে");
      } else {
        toast.success("পেমেন্ট তথ্য সফলভাবে জমা হয়েছে!");
        router.push("/payment/pending");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setErrorMessage("সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
      toast.error("সার্ভার ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card shadow-2xl border-border/80">
      <CardHeader className="space-y-1.5 text-center sm:text-left">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          পেমেন্ট তথ্য ফরম (Submit Payment)
        </CardTitle>
        <CardDescription>
          টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি ও মোবাইল নম্বর নিচে দিন
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              পেমেন্ট মাধ্যম (Select Payment Method) *
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {(["bKash", "Nagad", "Rocket"] as const).map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30 text-primary font-bold shadow-sm"
                        : "border-border bg-card/60 hover:bg-muted/40 text-muted-foreground font-medium"
                    }`}
                  >
                    <span className="text-sm">{method}</span>
                    {isSelected && (
                      <span className="text-[10px] flex items-center gap-1 mt-0.5 text-primary">
                        <CheckCircle2 className="h-3 w-3" /> নির্বাচিত
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="txid" className="text-xs font-semibold text-foreground">
              ট্রানজেকশন আইডি (Transaction ID / TxID) *
            </Label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="txid"
                placeholder="যেমন: BL7A9KX4Q2"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                className="pl-10 font-mono tracking-wider uppercase font-semibold"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              টাকা পাঠানোর পর ফিরতি মেসেজে (SMS) পাওয়া TrxID বা TxID ইংরেজিতে লিখুন।
            </p>
          </div>

          {/* Sender Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="sender" className="text-xs font-semibold text-foreground">
              প্রেরক মোবাইল নম্বর (Sender Number) *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="sender"
                type="tel"
                placeholder="017XXXXXXXX"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="pl-10 font-mono"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              যে বিকাশ/নগদ/রকেট নম্বর থেকে টাকা পাঠানো হয়েছে সেই নম্বরটি দিন।
            </p>
          </div>

          {/* Amount (Fixed to 100 BDT) */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-semibold text-foreground">
              পরিশোধকৃত পরিমাণ (Amount)
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                value={`৳${bookPrice} BDT (এককালীন)`}
                disabled
                className="pl-10 bg-muted/60 font-semibold text-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-medium text-muted-foreground">
              অতিরিক্ত নোট (Optional Note)
            </Label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="note"
                rows={2}
                placeholder="প্রয়োজনে অতিরিক্ত কোনো তথ্য লিখতে পারেন..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full gap-2 text-base font-semibold shadow-lg shadow-teal-500/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                তথ্য যাচাই ও জমা হচ্ছে...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                পেমেন্ট তথ্য সাবমিট করুন (Submit)
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            তথ্য সাবমিটের পর এডমিন ভেরিফিকেশন সম্পন্ন করে এক্সেস চালু করে দেবেন।
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
