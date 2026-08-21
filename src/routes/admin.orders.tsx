import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  Eye,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAdmin } from "@/lib/admin-context";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Order Tracking — Hunza & Co." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  product_id: string;
  slug?: string;
  name: string;
  qty: number;
  unit_price?: number;
  line_total?: number;
  images?: string[];
}

interface Contact {
  name?: string;
  email?: string;
  phone?: string;
}

interface Shipping {
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}

interface OrderRequest {
  id: string;
  order_id: string;
  user_id?: string | null;
  user_email?: string | null;
  contact?: Contact | null;
  shipping?: Shipping | null;
  payment_method?: string | null;
  items?: OrderItem[];
  subtotal?: number;
  shipping_cost?: number;
  discount?: number;
  total?: number;
  status: OrderStatus;
  admin_notes?: string | null;
  created_at: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending:    { label: "Pending",    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",   Icon: Clock },
  processing: { label: "Processing", badgeClass: "bg-blue-50 text-blue-700 border-blue-200",      Icon: Package },
  shipped:    { label: "Shipped",    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200", Icon: Truck },
  delivered:  { label: "Delivered",  badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle },
  cancelled:  { label: "Cancelled",  badgeClass: "bg-red-50 text-red-600 border-red-200",          Icon: X },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as OrderStatus[];

function pkr(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function getWhatsAppLink(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `92${digits.slice(1)}` : digits.startsWith("92") ? digits : digits;
  return `https://wa.me/${normalized}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, badgeClass, Icon } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <Badge variant="outline" className={`gap-1 rounded-full text-xs font-medium ${badgeClass}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card className="border border-border/60 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
          <div className={`shrink-0 rounded-xl p-2.5 ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Order detail drawer ──────────────────────────────────────────────────────

function OrderDetailSheet({
  order,
  open,
  onClose,
  onSave,
}: {
  order: OrderRequest | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, status: OrderStatus, adminNotes: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (order && order.id !== prevId.current) {
      setStatus((order.status as OrderStatus) ?? "pending");
      setAdminNotes(order.admin_notes ?? "");
      prevId.current = order.id;
    }
  }, [order]);

  if (!order) return null;

  const contact = order.contact ?? {};
  const ship = order.shipping ?? {};
  const displayName = contact.name ?? order.user_email ?? "Guest";
  const addrParts = [ship.address, ship.city, ship.province, ship.country].filter(Boolean);
  const items = order.items ?? [];
  const subtotal = order.subtotal ?? 0;
  const shippingCost = order.shipping_cost ?? 0;
  const total = order.total ?? subtotal + shippingCost;
  const whatsappLink = getWhatsAppLink(contact.phone);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(order.id, status, adminNotes);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[520px]">
        <SheetHeader className="border-b border-border px-6 pb-4 pt-6">
          <SheetTitle className="text-base">
            Order{" "}
            <span className="font-mono text-muted-foreground">
              #{order.order_id}
            </span>
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Placed {format(new Date(order.created_at), "dd MMM yyyy · HH:mm")}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-5">

            {/* Status panel */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current status
                </span>
                <StatusBadge status={(order.status as OrderStatus) ?? "pending"} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Update status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                  <SelectTrigger className="bg-background text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-sm">
                        {STATUS_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Admin note (tracking number, internal comment)
                </Label>
                <Textarea
                  rows={2}
                  className="resize-none bg-background text-sm"
                  placeholder="e.g. TCS tracking: 1234567890"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>

            {/* Customer */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Customer
              </p>
              <p className="text-sm font-medium">{displayName}</p>
              {contact.email && (
                <p className="mt-0.5 text-sm text-muted-foreground">{contact.email}</p>
              )}
              {contact.phone && (
                <p className="mt-0.5 text-sm text-muted-foreground">{contact.phone}</p>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat on WhatsApp
                </a>
              )}
              {order.payment_method && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Payment: {order.payment_method}
                </p>
              )}
            </div>

            {addrParts.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Shipping address
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {addrParts.join(", ")}
                  </p>
                </div>
              </>
            )}

            {items.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Items ({items.length})
                  </p>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty {item.qty}
                            {item.unit_price ? ` × ${pkr(item.unit_price)}` : ""}
                          </p>
                        </div>
                        {item.line_total != null && (
                          <p className="shrink-0 text-sm font-semibold">
                            {pkr(item.line_total)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{subtotal ? pkr(subtotal) : "—"}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "Free" : pkr(shippingCost)}</span>
              </div>
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>− {pkr(order.discount!)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{total ? pkr(total) : "—"}</span>
              </div>
            </div>

            {order.admin_notes && order.admin_notes !== adminNotes && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Saved admin note
                  </p>
                  <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                    {order.admin_notes}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function OrdersPage() {
  const { isAdmin } = useAdmin();
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<OrderRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isSupabaseConfigured) {
          if (!active) return;
          setOrders([]);
          setTotal(0);
          return;
        }

        const { supabase } = await import("@/integrations/supabase/client");
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q = (supabase as any)
          .from("order_requests")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(start, end);
        if (search.trim()) {
          const s = `%${search.trim()}%`;
          q = q.or(`order_id.ilike.${s},user_email.ilike.${s}`);
        }
        const { data, count, error: err } = await q;
        if (!active) return;
        if (err) {
          const msg = err.message ?? "";
          if (msg.includes("Invalid API key") || msg.includes("JWT") || msg.includes("Unauthorized")) {
            setOrders([]);
            setTotal(0);
            return;
          }
          setError(msg);
        } else {
          setOrders((data ?? []) as OrderRequest[]);
          setTotal(count ?? null);
        }
      } catch (e) {
        if (active) {
          const message = e instanceof Error ? e.message : String(e);
          if (message.includes("Invalid API key") || message.includes("Unauthorized")) {
            setOrders([]);
            setTotal(0);
            return;
          }
          setError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [isAdmin, page, search]);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? orders
        : orders.filter((o) => (o.status ?? "pending") === statusFilter),
    [orders, statusFilter],
  );

  const stats = useMemo(
    () => ({
      total: total ?? orders.length,
      pending:   orders.filter((o) => (o.status ?? "pending") === "pending").length,
      inProgress: orders.filter((o) => ["processing", "shipped"].includes(o.status ?? "pending")).length,
      delivered:  orders.filter((o) => (o.status ?? "pending") === "delivered").length,
    }),
    [orders, total],
  );

  const handleSave = async (id: string, status: OrderStatus, adminNotes: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase as any)
        .from("order_requests")
        .update({ status, admin_notes: adminNotes })
        .eq("id", id);
      if (err) throw err;
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, admin_notes: adminNotes } : o)),
      );
      setSelected((prev) => (prev?.id === id ? { ...prev, status, admin_notes: adminNotes } : prev));
      toast.success("Order updated");
    } catch (e) {
      toast.error("Failed to update order");
      console.error(e);
    }
  };

  const openDetail = (o: OrderRequest) => {
    setSelected(o);
    setSheetOpen(true);
  };

  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  return (
    <SiteLayout>
      {/* Page header */}
      <section className="container-x pt-12 md:pt-16">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Admin</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Order Tracking</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Track, update, and manage all customer orders.
        </p>
      </section>

      <section className="container-x mt-10 pb-24 md:mt-14 space-y-6">
        {!isAdmin ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Sign in as admin to view orders.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Total orders"  value={stats.total}      Icon={ShoppingBag}   accent="bg-muted text-muted-foreground" />
              <StatCard label="Pending"       value={stats.pending}    Icon={Clock}         accent="bg-amber-50 text-amber-600" />
              <StatCard label="In progress"   value={stats.inProgress} Icon={Truck}         accent="bg-blue-50 text-blue-600" />
              <StatCard label="Delivered"     value={stats.delivered}  Icon={CheckCircle}   accent="bg-emerald-50 text-emerald-600" />
            </div>

            {/* Filter bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
              <div className="flex flex-wrap gap-1.5">
                {(["all", ...ALL_STATUSES] as const).map((s) => {
                  const active = statusFilter === s;
                  const count =
                    s === "all"
                      ? orders.length
                      : orders.filter((o) => (o.status ?? "pending") === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted"
                      }`}
                    >
                      {s === "all" ? "All" : STATUS_CONFIG[s].label}
                      <span className={`ml-1.5 ${active ? "opacity-60" : "opacity-50"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8 text-sm"
                  placeholder="Search by order ID or email…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Table */}
            {error ? (
              <div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">
                Couldn't load orders: {error}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                      <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Total</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp</TableHead>
                      <TableHead className="w-[52px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 animate-pulse rounded bg-muted" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-16 text-center">
                          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            {search || statusFilter !== "all"
                              ? "No orders match your filters."
                              : "No orders yet."}
                          </p>
                          {(search || statusFilter !== "all") && (
                            <button
                              className="mt-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                              onClick={() => { setSearch(""); setStatusFilter("all"); }}
                            >
                              Clear filters
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((o) => {
                        const whatsappLink = getWhatsAppLink(o.contact?.phone);
                        return (
                          <TableRow
                            key={o.id}
                            className="cursor-pointer"
                            onClick={() => openDetail(o)}
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {o.order_id}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium">
                                {o.contact?.name ?? "Guest"}
                              </p>
                              <p className="text-xs text-muted-foreground">{o.user_email}</p>
                            </TableCell>
                            <TableCell className="hidden text-sm font-medium md:table-cell">
                              {o.total ? pkr(o.total) : "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={(o.status ?? "pending") as OrderStatus} />
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                              {format(new Date(o.created_at), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell>
                              {whatsappLink ? (
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                                  title={o.contact?.phone ?? "WhatsApp contact"}
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  Chat
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => { e.stopPropagation(); openDetail(o); }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="sr-only">View order</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {!loading && filtered.length > 0 && (
                  <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      Showing {filtered.length} of {total ?? orders.length} orders
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full text-xs"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full text-xs"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Order detail drawer */}
      <OrderDetailSheet
        order={selected}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
      />
    </SiteLayout>
  );
}
