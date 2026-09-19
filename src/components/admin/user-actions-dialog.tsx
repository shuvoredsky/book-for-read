"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle,
  Loader2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { banUserAction, unbanUserAction, type AdminUserListItem } from "@/server/actions/admin-users";

interface UserActionsDialogProps {
  user: AdminUserListItem | null;
  mode: "ban" | "unban" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UserActionsDialog({
  user,
  mode,
  open,
  onOpenChange,
  onSuccess,
}: UserActionsDialogProps) {
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!user || !mode) return null;

  const handleBan = async () => {
    setLoading(true);
    try {
      const res = await banUserAction(user.id, reason || "Administrative suspension");
      if (res.success) {
        toast.success(res.message || "ব্যবহারকারীকে সাসপেন্ড করা হয়েছে");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(res.error || "ব্যান করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    setLoading(true);
    try {
      const res = await unbanUserAction(user.id);
      if (res.success) {
        toast.success(res.message || "ব্যবহারকারীকে সক্রিয় করা হয়েছে");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(res.error || "আনব্যান করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "ban" && (
          <>
            <DialogHeader>
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
                <Ban className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                ব্যবহারকারীকে ব্যান / সাসপেন্ড করুন
              </DialogTitle>
              <DialogDescription className="text-xs">
                @{user.username} ({user.email}) এর একাউন্ট সাময়িকভাবে সাসপেন্ড হবে। সে আর সিস্টেমে লগইন করতে বা বই পড়তে পারবে না।
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-2.5 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  ব্যান করলেও তার পূর্ববর্তী পেমেন্ট বা BookAccess রেকর্ড মুছে যাবে না। পরবর্তীতে আনব্যান করলে তার আগের এক্সেস পুনরায় ফিরে আসবে।
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ban-reason" className="text-xs font-medium">
                  সাসপেন্ড করার কারণ (ঐচ্ছিক)
                </Label>
                <Input
                  id="ban-reason"
                  placeholder="যেমন: পাইরেসি বা নিয়ম লঙ্ঘনের চেষ্টা"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-xs"
                  disabled={loading}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="text-xs"
              >
                বাতিল
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBan}
                disabled={loading}
                className="text-xs gap-1.5"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                নিশ্চিত সাসপেন্ড করুন
              </Button>
            </DialogFooter>
          </>
        )}

        {mode === "unban" && (
          <>
            <DialogHeader>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
                <UserCheck className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                ব্যবহারকারীকে আনব্যান / সক্রিয় করুন
              </DialogTitle>
              <DialogDescription className="text-xs">
                @{user.username} ({user.email}) এর একাউন্ট পুনরায় সক্রিয় (ACTIVE) করা হবে।
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 text-xs text-muted-foreground">
              <p>
                একাউন্ট সক্রিয় হলে ব্যবহারকারী স্বাভাবিকভাবে লগইন করতে পারবে এবং তার পূর্বের BookAccess স্ট্যাটাস অনুসারে রিডারে প্রবেশাধিকার পাবে।
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="text-xs"
              >
                বাতিল
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleUnban}
                disabled={loading}
                className="text-xs gap-1.5"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                নিশ্চিত সক্রিয় করুন
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
