import { useState, useEffect, useCallback } from "react";
import { Search, Building2, Eye, Trash2, Power } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const PLATFORM_LABELS = { airbnb: "Airbnb", booking: "Booking", gatherin: "Gatherin", other: "Other" };

export default function AdminProperties() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("adminOperations", { action: "list_all_properties", limit: 500 });
      setProperties(res.data?.properties || []);
      setUserMap(res.data?.userMap || {});
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id, current) => {
    setActionLoading(id);
    try {
      await base44.functions.invoke("adminOperations", { action: "toggle_property_active", property_id: id, is_active: !current });
      toast({ title: !current ? t("تم التفعيل", "Activated") : t("تم التعطيل", "Deactivated") });
      load();
    } catch (err) {
      toast({ title: err.response?.data?.error || t("حدث خطأ", "Error"), variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProp = async (id, name) => {
    if (!confirm(t(`حذف ${name || "العقار"}؟`, `Delete ${name || "property"}?`))) return;
    setActionLoading(id);
    try {
      await base44.functions.invoke("adminOperations", { action: "delete_property", property_id: id });
      toast({ title: t("تم الحذف", "Deleted") });
      load();
    } catch (err) {
      toast({ title: err.response?.data?.error || t("حدث خطأ", "Error"), variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = properties.filter((p) => {
    const matchesSearch = !search ||
      p.property_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.property_url?.toLowerCase().includes(search.toLowerCase());
    const matchesActive = filterActive === "all" || (filterActive === "active" ? p.is_active : !p.is_active);
    return matchesSearch && matchesActive;
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-light mb-1 flex items-center gap-2">
            <Building2 size={22} strokeWidth={1.5} className="text-accent" />
            {t("عقارات المستخدمين", "User Properties")}
          </h1>
          <p className="font-body text-sm text-muted-foreground">{properties.length} {t("عقار", "properties")}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("بحث...", "Search...")}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent w-56"
            />
          </div>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-background">
            <option value="all">{t("الكل", "All")}</option>
            <option value="active">{t("نشط", "Active")}</option>
            <option value="inactive">{t("غير نشط", "Inactive")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left">
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("العقار", "Property")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("المالك", "Owner")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("المنصة", "Platform")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("السعر", "Price")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("الحالة", "Status")}</th>
              <th className="px-4 py-3 font-body text-xs text-muted-foreground font-medium">{t("إجراءات", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const owner = userMap[p.created_by_id];
              return (
                <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.featured_image ? (
                        <img src={p.featured_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-body text-sm text-foreground truncate">{p.property_name || p.city}</p>
                        <p className="font-body text-xs text-muted-foreground truncate">{p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-body text-xs text-foreground">{owner?.full_name || "—"}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{owner?.email || p.created_by_id?.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-[10px] bg-muted text-muted-foreground">{PLATFORM_LABELS[p.platform] || p.platform || "—"}</span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm" dir="ltr">{p.price ? `${p.price.toLocaleString()} SAR` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${p.is_active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                      {p.is_active ? t("نشط", "Active") : t("متوقف", "Inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleActive(p.id, p.is_active)}
                        disabled={actionLoading === p.id}
                        title={p.is_active ? t("تعطيل", "Deactivate") : t("تفعيل", "Activate")}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted transition-all disabled:opacity-50"
                      >
                        <Power size={13} className={p.is_active ? "text-emerald-500" : "text-muted-foreground"} />
                      </button>
                      <button
                        onClick={() => deleteProp(p.id, p.property_name)}
                        disabled={actionLoading === p.id}
                        title={t("حذف", "Delete")}
                        className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("لا توجد عقارات", "No properties")}</p>}
      </div>
    </div>
  );
}