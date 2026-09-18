"use client";

import * as React from "react";
import { Check, X, Loader2, AlertCircle, KeyRound, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  grantAccessAction,
  revokeAccessAction,
  grantAccessByIdentifierAction,
} from "@/server/actions/admin-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccessItem {
  id: string;
  userId: string;
  bookId: string;
  status: "ACTIVE" | "REVOKED";
  grantedAt: Date;
  revokedAt: Date | null;
  user: {
    name: string;
    username: string;
    email: string;
  };
}

interface AccessActionsDialogProps {
  access: AccessItem | null;
  mode: "grant" | "revoke" | "manual" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AccessActionsDialog({
  access,
  mode,
  open,
  onOpenChange,
  onSuccess,
}: AccessActionsDialogProps) {
  const [reason, setReason] = React.useState("");
  const [userIdentifier, setUserIdentifier] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setReason("");
      setUserIdentifier("");
      setErrorMessage(null);
    }
  }, [open]);

  if (!mode) return null;

  const handleGrant = async () => {
    if (!access) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await grantAccessAction(access.userId, access.bookId);
      if (!res.success) {
        setErrorMessage(res.error || "এক্সেস প্রদান ব্যর্থ হয়েছে");
        toast.error("এক্সেস প্রদান ব্যর্থ হয়েছে");
      } else {
        toast.success(res.message || "বইয়ের এক্সেস সক্রিয় করা হয়েছে!");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("সার্ভারে ত্রুটি হয়েছে");
      toast.error("ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!access) return;
    if (!reason.trim() || reason.trim().length < 2) {
      setErrorMessage("বাতিল করার কারণ লিখুন (কমপক্ষে ২ অক্ষর)");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await revokeAccessAction(access.userId, access.bookId, reason.trim());
      if (!res.success) {
        setErrorMessage(res.error || "এক্সেস বাতিল ব্যর্থ হয়েছে");
        toast.error("এক্সেস বাতিল ব্যর্থ হয়েছে");
      } else {
        toast.success(res.message || "বইয়ের এক্সেস বাতিল করা হয়েছে!");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("সার্ভারে ত্রুটি হয়েছে");
      toast.error("ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdentifier.trim()) {
      setErrorMessage("ইমেইল অথবা ইউজারনেম দিন");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await grantAccessByIdentifierAction(userIdentifier.trim());
      if (!res.success) {
        setErrorMessage(res.error || "ব্যবহারকারী খুঁজে পাওয়া যায়নি");
        toast.error("ব্যর্থ হয়েছে");
      } else {
        toast.success(res.message || "এক্সেস সফলভাবে প্রদান করা হয়েছে!");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("সার্ভারে ত্রুটি হয়েছে");
      toast.error("ত্রুটি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "manual" ? (
          <form onSubmit={handleManualGrant}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>ম্যানুয়ালি নতুন এক্সেস দিন</span>
              </DialogTitle>
              <DialogDescription>
                যেকোনো নিবন্ধিত ব্যবহারকারীর ইউজারনেম বা ইমেইল দিয়ে সরাসরি বইয়ের ফুল এক্সেস সক্রিয় করুন।
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-xs font-semibold">
                  ইউজারনেম অথবা ইমেইল এড্রেস *
                </Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="identifier"
                    placeholder="যেমন: rafiq_doc বা rafiq@example.com"
                    value={userIdentifier}
                    onChange={(e) => setUserIdentifier(e.target.value)}
                    className="pl-10 text-xs"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-row items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                variant="gradient"
                size="sm"
                disabled={isLoading}
                className="gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    খোঁজা হচ্ছে...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    এক্সেস প্রদান করুন
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {mode === "grant" ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span>এক্সেস সক্রিয় নিশ্চিতকরণ</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-rose-500" />
                    <span>এক্সেস বাতিল নিশ্চিতকরণ (Revoke Access)</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {mode === "grant"
                  ? "এই ব্যবহারকারীকে বই পড়ার পূর্ণ এক্সেস প্রদান করা হবে।"
                  : "এক্সেস বাতিল করলে ব্যবহারকারী রিডারে প্রবেশ করতে পারবেন না।"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {access && (
                <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">নাম:</span>
                    <span className="font-semibold text-foreground">{access.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ইউজারনেম:</span>
                    <span className="font-mono text-primary">@{access.user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ইমেইল:</span>
                    <span className="font-mono">{access.user.email}</span>
                  </div>
                </div>
              )}

              {mode === "revoke" && (
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-xs font-semibold">
                    বাতিল করার কারণ (Revocation Reason) *
                  </Label>
                  <textarea
                    id="reason"
                    rows={2}
                    placeholder="যেমন: অননুমোদিত শেয়ারিং বা রিফান্ড প্রদান।"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
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

              {mode === "grant" ? (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleGrant}
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      প্রক্রিয়াধীন...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      এক্সেস সক্রিয় করুন
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRevoke}
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
                      এক্সেস বাতিল করুন
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
