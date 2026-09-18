import { User, Mail, Shield, Calendar, AtSign, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { SafeUser } from "@/types";

interface UserProfileCardProps {
  user: SafeUser;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-primary/30 text-primary">
            প্রোফাইল তথ্য (Account Info)
          </Badge>
          <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
            {user.status}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-foreground pt-1">
          {user.name}
        </CardTitle>
        <CardDescription>
          আপনার একাউন্টের তথ্য ও ওয়াটারমার্ক আইডেন্টিফায়ার
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between py-1.5 border-b border-border/50">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <AtSign className="h-3.5 w-3.5 text-primary" />
            ইউজারনেম:
          </span>
          <span className="font-mono font-semibold text-foreground">@{user.username}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-border/50">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            ইমেইল:
          </span>
          <span className="font-semibold text-foreground truncate max-w-[180px]">{user.email}</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-border/50">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            একাউন্ট রোল:
          </span>
          <span className="font-semibold text-foreground">{user.role}</span>
        </div>

        <div className="flex items-center justify-between py-1.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            নিবন্ধন তারিখ:
          </span>
          <span className="text-muted-foreground">{formatDate(user.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
