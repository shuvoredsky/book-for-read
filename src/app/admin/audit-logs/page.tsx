import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "সিস্টেম অডিট লগ (Audit Logs)",
  description: "এডমিনদের অনুমোদন, বাতিল ও অ্যাক্সেস পরিবর্তনের সম্পূর্ণ হিস্ট্রি",
};

interface AdminAuditLogsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminAuditLogsPage({
  searchParams,
}: AdminAuditLogsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const [totalCount, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: { name: true, email: true, username: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            সিস্টেম অডিট লগ (Audit Logs)
          </h1>
          <p className="text-sm text-muted-foreground">
            এডমিনদের অনুমোদন, বাতিলকরণ ও এক্সেস পরিবর্তনের প্রতিটি পদক্ষেপের স্থায়ী রেকর্ড
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          মোট {totalCount} টি এন্ট্রি
        </Badge>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">সময় (Timestamp)</th>
                <th className="px-4 py-3.5">অ্যাকশন (Action)</th>
                <th className="px-4 py-3.5">টার্গেট (Target)</th>
                <th className="px-4 py-3.5">এডমিন (Performed By)</th>
                <th className="px-4 py-3.5">মেটাডাটা (Metadata)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    এখনও কোনো অডিট লগ জমা হয়নি।
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          log.action.includes("APPROVED") || log.action.includes("GRANTED")
                            ? "success"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      {log.target}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {log.admin?.name ? (
                        <span>
                          {log.admin.name}{" "}
                          <span className="text-muted-foreground text-[10px]">
                            (@{log.admin.username})
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
