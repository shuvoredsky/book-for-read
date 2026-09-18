"use client";

import * as React from "react";
import { Check, X, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  approvePaymentAction,
  rejectPaymentAction,
} from "@/server/actions/admin-payment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PaymentItem {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  senderNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: {
    name: string;
    username: string;
    email: string;
  };
}

interface PaymentActionsDialogProps {
  payment: PaymentItem | null;
  mode: "approve" | "reject" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PaymentActionsDialog({
  payment,
  mode,
  open,
  onOpenChange,
  onSuccess,
}: PaymentActionsDialogProps) {
  const [adminNote, setAdminNote] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setAdminNote("");
      setErrorMessage(null);
    }
  }, [open]);

  if (!payment || !mode) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await approvePaymentAction(payment.id);
      if (!res.success) {
        setErrorMessage(res.error || "অনুমোদন ব্যর্থ হয়েছে");
        toast.error("অনুমোদন ব্যর্থ হয়েছে");
      } else {
        toast.success(res.message || "পেমেন্ট অনুমোদিত হয়েছে!");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err: unknown) {
      console.error("Approval error:", err);
      setErrorMessage("সার্ভারে ত্রুটি হয়েছে");
      toast.error("ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim() || adminNote.trim().length < 3) {
      setErrorMessage("বাতিল করার কারণ বা নোট লিখুন (কমপক্ষে ৩ অক্ষর)");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await rejectPaymentAction(payment.id, adminNote.trim());
      if (!res.success) {
        setErrorMessage(res.error || "বাতিলকরণ ব্যর্থ হয়েছে");
        toast.error("বাতিলকরণ ব্যর্থ হয়েছে");
      } else {
        toast.success(res.message || "পেমেন্ট বাতিল করা হয়েছে!");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err: unknown) {
      console.error("Rejection error:", err);
      setErrorMessage("সার্ভারে ত্রুটি হয়েছে");
      toast.error("ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "approve" ? (
              <>
                <Check className="h-5 w-5 text-emerald-500" />
                <span>পেমেন্ট অনুমোদন নিশ্চিতকরণ</span>
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-rose-500" />
                <span>পেমেন্ট বাতিল নিশ্চিতকরণ</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "approve"
              ? "এই পেমেন্টটি অনুমোদন করলে ব্যবহারকারীর একাউন্টে বইয়ের আজীবন এক্সেস চালু হয়ে যাবে।"
              : "বাতিল করলে ব্যবহারকারী বইয়ের এক্সেস পাবেন না এবং বাতিল করার কারণ প্রদর্শিত হবে।"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Target Payment Summary */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ব্যবহারকারী:</span>
              <span className="font-semibold text-foreground">
                {payment.user.name} (@{payment.user.username})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
              <span className="font-semibold">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ট্রানজেকশন আইডি:</span>
              <span className="font-mono font-bold text-primary">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">প্রেরক নম্বর:</span>
              <span className="font-mono">{payment.senderNumber}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/50">
              <span className="text-muted-foreground">পরিমাণ:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{payment.amount} BDT</span>
            </div>
          </div>

          {/* Admin Note input for rejection */}
          {mode === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="adminNote" className="text-xs font-semibold text-foreground">
                বাতিল করার কারণ / এডমিন নোট (Admin Note) *
              </Label>
              <textarea
                id="adminNote"
                rows={3}
                placeholder="যেমন: ভুল TxID দেওয়া হয়েছে অথবা একাউন্টে টাকা জমা পড়েনি।"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            বাতিল
          </Button>

          {mode === "approve" ? (
            <Button
              variant="gradient"
              size="sm"
              onClick={handleApprove}
              disabled={isLoading}
              className="gap-1.5 shadow-md shadow-teal-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  অনুমোদন হচ্ছে...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  অনুমোদন নিশ্চিত করুন
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
              className="gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  বাতিল হচ্ছে...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  পেমেন্ট বাতিল করুন
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
