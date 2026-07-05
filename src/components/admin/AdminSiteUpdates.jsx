import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, X, Check, Sparkles, Wrench, Bug, Megaphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const TYPE_META = {
  feature: { Icon: Sparkles, ar: "ميزة", en: "Feature", color: "text-emerald-600" },
  improvement: { Icon: Wrench, ar: "تحسين", en: "Improvement", color: "text-blue-600" },
  fix: { Icon: Bug, ar: "إصلاح", en: "Fix", color: "text-orange-600" },
  announcement: { Icon: Megaphone, ar: "إعلان", en: "Announcement", color: "text-purple-600" },
};

const EMPTY = { title_ar: "", title_en: "", description_ar: "", description_en: "", date: new Date().toISOString().slice(0, 10), type: "feature", is_published: true };

export default function AdminSiteUpdates() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const isRTL = lang === "ar";
  const t = (ar, en) => (isRTL ? ar : en);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await base44.entities.SiteUpdate.list("-date", 100);
      setUpdates(rows || []);
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title_ar || !form.title_en || !form.date) {
      toast({ title: t("يرجى ملء الحقول المطلوبة", "Please fill required fields"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await base44.entities.SiteUpdate.update(editingId, form);
        toast({ title: t("تم التحديث", "Updated") });
      } else {
        await base44.entities.SiteUpdate.create(form);
        toast({ title: t("تم الإنشاء", "Created") });
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      toast({ title: err.message || t("حدث خطأ", "Error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm(t("هل أنت متأكد؟", "Are you sure?"))) return;
    try {
      await base44.entities.SiteUpdate.delete(id);
      toast({ title: t("تم الحذف", "Deleted") });
      load();
    } catch (err) {
      toast({ title: err.message || t("حدث خطأ", "Error"), variant: "destructive" });
    }
  };

  const togglePublished = async (item) => {
    try {
      await base44.entities.SiteUpdate.update(item.id, { is_published: !item.is_published });
      load();
    } catch {}
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-light mb-1">{t("تحديثات المنصة", "Site Updates")}</h1>
          <p className="font-body text-sm text-muted-foreground">{updates.length} {t("تحديث", "updates")}</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm hover:bg-accent/90 transition-all"
        >
          <Plus size={15} /> {t("إضافة تحديث", "Add Update")}
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="p-5 rounded-xl border border-border/50 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-body text-sm font-medium">{editingId ? t("تعديل تحديث", "Edit Update") : t("تحديث جديد", "New Update")}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} placeholder={t("العنوان (عربي)", "Title (Arabic)")} className="px-3 py-2 text-sm rounded-lg border border-border bg-background" dir="rtl" />
            <input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder={t("العنوان (إنجليزي)", "Title (English)")} className="px-3 py-2 text-sm rounded-lg border border-border bg-background" dir="ltr" />
            <textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} placeholder={t("الوصف (عربي)", "Description (Arabic)")} className="px-3 py-2 text-sm rounded-lg border border-border bg-background min-h-[70px]" dir="rtl" />
            <textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} placeholder={t("الوصف (إنجليزي)", "Description (English)")} className="px-3 py-2 text-sm rounded-lg border border-border bg-background min-h-[70px]" dir="ltr" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 text-sm rounded-lg border border-border bg-background" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 text-sm rounded-lg border border-border bg-background">
              {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            {t("منشور", "Published")}
          </label>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50">{t("حفظ", "Save")}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">{t("إلغاء", "Cancel")}</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {updates.map((item) => {
          const meta = TYPE_META[item.type] || TYPE_META.feature;
          const Icon = meta.Icon;
          return (
            <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card">
              <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-body text-[10px] uppercase px-2 py-0.5 rounded-full bg-muted ${meta.color}`}>{isRTL ? meta.ar : meta.en}</span>
                  <span className="font-body text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <button onClick={() => togglePublished(item)} className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${item.is_published ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    {item.is_published ? <><Check size={9} /> {t("منشور", "Live")}</> : t("مسودة", "Draft")}
                  </button>
                </div>
                <p className="font-body text-sm font-medium text-foreground">{isRTL ? item.title_ar : item.title_en}</p>
                {(isRTL ? item.description_ar : item.description_en) && (
                  <p className="font-body text-xs text-muted-foreground mt-1">{isRTL ? item.description_ar : item.description_en}</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setForm({ ...item, date: item.date?.slice(0, 10) }); setEditingId(item.id); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-muted"><Edit3 size={14} className="text-muted-foreground" /></button>
                <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 size={14} className="text-destructive" /></button>
              </div>
            </div>
          );
        })}
        {updates.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("لا توجد تحديثات", "No updates")}</p>}
      </div>
    </div>
  );
}