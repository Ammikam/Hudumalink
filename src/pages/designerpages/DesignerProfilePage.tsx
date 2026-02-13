// src/pages/designerpages/DesignerProfilePage.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Clock, Sparkles, CheckCircle2, Loader2,
  Settings, Eye, BarChart3, MessageSquare, Briefcase,
  AlertCircle, Instagram, Globe, Link as LinkIcon, DollarSign,
  Calendar, Images, X, ChevronLeft, ChevronRight, ZoomIn,
  CheckCircle, Circle, PlayCircle, Check, Pencil, Plus,
  Camera, Upload, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout/Layout';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectStatus = 'open' | 'in_progress' | 'completed';

interface CompletedProject {
  _id: string; title: string; description: string; location: string;
  budget: number; timeline: string; styles: string[]; photos: string[];
  thumbnail: string; completedAt: string; clientName: string; status?: ProjectStatus;
}
interface Review {
  _id?: string; clientName: string; clientAvatar?: string;
  rating: number; comment: string; date?: string; projectImage?: string;
}
interface Designer {
  _id: string; clerkId: string; name: string; email: string; phone?: string;
  avatar: string; coverImage?: string; tagline?: string; location: string;
  verified: boolean; superVerified: boolean; rating: number; reviewCount: number;
  responseTime: string; startingPrice: number; about: string; styles: string[];
  projectsCompleted: number; portfolioImages: string[]; completedProjects: CompletedProject[];
  reviews: Review[]; calendlyLink?: string;
  socialLinks?: { instagram?: string; pinterest?: string; website?: string };
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string; icon: React.ReactNode }> = {
  open:        { label: 'Open',        className: 'bg-emerald-100 text-emerald-800 border border-emerald-200', icon: <Circle      className="w-3 h-3 fill-emerald-500 text-emerald-500" /> },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border border-blue-200',         icon: <PlayCircle  className="w-3 h-3 fill-blue-500 text-blue-500" /> },
  completed:   { label: 'Completed',   className: 'bg-violet-100 text-violet-800 border border-violet-200',    icon: <CheckCircle className="w-3 h-3 fill-violet-500 text-violet-500" /> },
};

const STYLE_OPTIONS = ['Modern','African Fusion','Minimalist','Luxury','Bohemian','Coastal','Budget-Friendly','Industrial','Scandinavian','Art Deco'];
const RESPONSE_OPTIONS = ['Within 1 hour','Within 2 hours','Within 4 hours','Same day','Within 24 hours','Within 48 hours'];

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, initialIndex, title, onClose }: {
  images: string[]; initialIndex: number; title: string; onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key==='Escape') onClose(); if (e.key==='ArrowLeft') prev(); if (e.key==='ArrowRight') next(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, prev, next]);
  useEffect(() => { document.body.style.overflow='hidden'; return () => { document.body.style.overflow=''; }; }, []);
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm" onClick={onClose}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e=>e.stopPropagation()}>
          <div><p className="text-white font-semibold text-lg truncate max-w-xs lg:max-w-lg">{title}</p>
            <p className="text-white/50 text-sm">{current+1} / {images.length}</p></div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"><X className="w-5 h-5 text-white"/></button>
        </div>
        <div className="flex-1 flex items-center justify-center relative px-16 min-h-0" onClick={e=>e.stopPropagation()}>
          <AnimatePresence mode="wait">
            <motion.img key={current} src={images[current]} alt={`${title} — photo ${current+1}`}
              initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} transition={{duration:0.2}}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none" draggable={false}/>
          </AnimatePresence>
          {images.length>1 && (<>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition backdrop-blur-sm"><ChevronLeft className="w-6 h-6 text-white"/></button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition backdrop-blur-sm"><ChevronRight className="w-6 h-6 text-white"/></button>
          </>)}
        </div>
        {images.length>1 && (
          <div className="flex gap-2 px-6 py-4 overflow-x-auto flex-shrink-0 justify-center" onClick={e=>e.stopPropagation()}>
            {images.map((url,i) => (
              <button key={i} onClick={()=>setCurrent(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${i===current?'ring-2 ring-white scale-110':'opacity-50 hover:opacity-80'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" draggable={false}/>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Inline editable field ────────────────────────────────────────────────────

function InlineEdit({ value, onSave, placeholder, className = '', multiline = false, type = 'text' }: {
  value: string; onSave: (v: string) => Promise<void>; placeholder?: string;
  className?: string; multiline?: boolean; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const [saving, setSaving]   = useState(false);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  const save = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`group relative text-left w-full rounded-lg transition-all hover:bg-primary/5 px-2 py-1 -mx-2 -my-1 ${className}`}
      >
        <span className={value ? '' : 'text-muted-foreground/60 italic'}>{value || placeholder || 'Click to edit'}</span>
        <Pencil className="w-3.5 h-3.5 ml-2 inline opacity-0 group-hover:opacity-60 transition-opacity text-primary" />
      </button>
    );
  }

  return (
    <div className="relative">
      {multiline ? (
        <textarea ref={ref as any} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key==='Escape') cancel(); }}
          rows={4}
          className={`w-full px-3 py-2 border-2 border-primary rounded-lg bg-background resize-none focus:outline-none text-sm ${className}`}
          placeholder={placeholder}/>
      ) : (
        <input ref={ref as any} type={type} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter') save(); if (e.key==='Escape') cancel(); }}
          className={`w-full px-3 py-2 border-2 border-primary rounded-lg bg-background focus:outline-none text-sm ${className}`}
          placeholder={placeholder}/>
      )}
      <div className="flex gap-2 mt-2">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50">
          {saving ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>} Save
        </button>
        <button onClick={cancel} className="px-3 py-1.5 border rounded-md text-xs hover:bg-muted transition">Cancel</button>
      </div>
    </div>
  );
}

// ─── Price inline editor ──────────────────────────────────────────────────────

function PriceEdit({ value, onSave }: { value: number; onSave: (v: number) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(String(value));
  const [saving, setSaving]   = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const save = async () => {
    const num = parseInt(draft.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) { setEditing(false); return; }
    setSaving(true);
    await onSave(num);
    setSaving(false);
    setEditing(false);
  };

  if (!editing) return (
    <button onClick={() => setEditing(true)} className="group flex items-center gap-2 hover:bg-primary/5 px-2 py-1 rounded-lg transition -mx-2 -my-1">
      <span className="text-3xl font-bold text-blue-500">
        {value ? `KSh ${value.toLocaleString()}` : <span className="text-muted-foreground/60 italic text-lg">Set starting price</span>}
      </span>
      <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition text-primary"/>
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground font-semibold text-sm">KSh</span>
      <input ref={ref} type="number" value={draft} onChange={e=>setDraft(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter')save();if(e.key==='Escape'){setDraft(String(value));setEditing(false);}}}
        className="w-36 px-3 py-2 border-2 border-primary rounded-lg bg-background focus:outline-none text-sm font-bold"/>
      <button onClick={save} disabled={saving} className="p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-50">
        {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>}
      </button>
      <button onClick={()=>{setDraft(String(value));setEditing(false);}} className="p-2 border rounded-md hover:bg-muted transition"><X className="w-4 h-4"/></button>
    </div>
  );
}

// ─── Dropdown inline editor ───────────────────────────────────────────────────

function DropdownEdit({ value, options, onSave, placeholder }: {
  value: string; options: string[]; onSave: (v: string) => Promise<void>; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);

  const pick = async (opt: string) => {
    setSaving(true);
    await onSave(opt);
    setSaving(false);
    setEditing(false);
  };

  if (!editing) return (
    <button onClick={()=>setEditing(true)} className="group flex items-center gap-2 hover:bg-primary/5 px-2 py-1 rounded-lg transition -mx-2 -my-1 text-left">
      <span className={value ? 'text-3xl font-bold text-blue-500' : 'text-muted-foreground/60 italic text-lg'}>
        {value || placeholder || 'Click to set'}
      </span>
      <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition text-primary"/>
    </button>
  );

  return (
    <div className="relative">
      <div className="bg-background border-2 border-primary rounded-xl shadow-lg overflow-hidden">
        {options.map(opt => (
          <button key={opt} onClick={()=>pick(opt)} disabled={saving}
            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition flex items-center justify-between ${value===opt?'bg-primary/10 font-semibold text-primary':''}`}>
            {opt}
            {value===opt && <Check className="w-4 h-4 text-primary"/>}
          </button>
        ))}
      </div>
      <button onClick={()=>setEditing(false)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
    </div>
  );
}

// ─── Styles tag editor ────────────────────────────────────────────────────────

function StylesEditor({ value, onSave }: { value: string[]; onSave: (v: string[]) => Promise<void> }) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState<string|null>(null);

  const toggle = async (style: string) => {
    setSaving(style);
    const next = value.includes(style) ? value.filter(s=>s!==style) : [...value, style];
    await onSave(next);
    setSaving(null);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {value.map(style => (
        <button key={style} onClick={()=>toggle(style)} disabled={saving===style}
          className="group flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition">
          {saving===style ? <Loader2 className="w-3 h-3 animate-spin"/> : <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition"/>}
          {style}
        </button>
      ))}
      {adding ? (
        <div className="flex flex-wrap gap-1.5 p-2 border-2 border-dashed border-primary rounded-xl">
          {STYLE_OPTIONS.filter(s=>!value.includes(s)).map(style=>(
            <button key={style} onClick={()=>{toggle(style);setAdding(false);}}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-sm rounded-full transition font-medium">
              {style}
            </button>
          ))}
          <button onClick={()=>setAdding(false)} className="px-3 py-1.5 text-muted-foreground text-sm hover:text-foreground">Done</button>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-muted-foreground/30 rounded-full text-sm text-muted-foreground hover:border-primary hover:text-primary transition">
          <Plus className="w-3.5 h-3.5"/>Add style
        </button>
      )}
    </div>
  );
}

// ─── Social Links Modal ───────────────────────────────────────────────────────

function SocialLinksModal({ value, onSave, onClose }: {
  value: Designer['socialLinks']; onSave: (v: Designer['socialLinks']) => Promise<void>; onClose: () => void;
}) {
  const [draft, setDraft] = useState({ instagram: value?.instagram||'', pinterest: value?.pinterest||'', website: value?.website||'', calendly: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave({ instagram: draft.instagram, pinterest: draft.pinterest, website: draft.website });
    setSaving(false);
    onClose();
  };

  useEffect(() => { document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow=''; }; }, []);

  const fields = [
    { key: 'instagram', label: 'Instagram', icon: <Instagram className="w-5 h-5"/>, placeholder: 'https://instagram.com/yourhandle', color: 'text-pink-500' },
    { key: 'pinterest', label: 'Pinterest',  icon: <LinkIcon   className="w-5 h-5"/>, placeholder: 'https://pinterest.com/yourhandle',  color: 'text-red-500'  },
    { key: 'website',   label: 'Website',    icon: <Globe      className="w-5 h-5"/>, placeholder: 'https://yourwebsite.com',            color: 'text-blue-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{opacity:0,y:20,scale:0.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.2}}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-bold text-xl">Social & Links</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-1.5 ${f.color}`}>{f.icon}{f.label}</label>
              <input type="url" value={(draft as any)[f.key]} onChange={e=>setDraft(d=>({...d,[f.key]:e.target.value}))}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 border rounded-xl bg-muted/30 focus:outline-none focus:border-primary transition text-sm"/>
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Check className="w-4 h-4 mr-2"/>}Save Links
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Avatar Upload Modal ──────────────────────────────────────────────────────

function AvatarModal({ current, onSave, onClose }: { current: string; onSave: (url: string) => Promise<void>; onClose: () => void }) {
  const [preview, setPreview] = useState(current);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();

  useEffect(() => { document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow=''; }; }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData(); fd.append('avatar', file);
      const res = await fetch('http://localhost:5000/api/users/upload-avatar', {
        method:'POST', headers:{Authorization:`Bearer ${token}`}, body:fd
      });
      const data = await res.json();
      if (data.success) setPreview(data.url);
      else throw new Error(data.error);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (preview === current) { onClose(); return; }
    setSaving(true);
    await onSave(preview);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} transition={{duration:0.2}}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-sm" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-bold text-xl">Update Photo</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-32 h-32 ring-4 ring-border shadow-lg">
              <AvatarImage src={preview}/>
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">P</AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin"/>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" ref={inputRef} className="hidden" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
          <Button variant="outline" className="w-full" onClick={()=>inputRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2"/>Choose Photo
          </Button>
          <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB. Square images work best.</p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving||uploading}>
            {saving?<Loader2 className="w-4 h-4 animate-spin mr-2"/>:<Check className="w-4 h-4 mr-2"/>}Save
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Cover Upload Modal ───────────────────────────────────────────────────────

function CoverModal({ current, onSave, onClose }: { current: string; onSave: (url: string) => Promise<void>; onClose: () => void }) {
  const [preview, setPreview] = useState(current);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();

  useEffect(() => { document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow=''; }; }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData(); fd.append('cover', file);
      const res = await fetch('http://localhost:5000/api/users/upload-cover', {
        method:'POST', headers:{Authorization:`Bearer ${token}`}, body:fd
      });
      const data = await res.json();
      if (data.success) setPreview(data.url);
      else throw new Error(data.error);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (preview === current) { onClose(); return; }
    setSaving(true);
    await onSave(preview);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} transition={{duration:0.2}}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-lg" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-bold text-xl">Cover Image</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Preview */}
          <div className="relative h-40 rounded-xl overflow-hidden bg-muted">
            {preview ? (
              <img src={preview} alt="Cover preview" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Camera className="w-10 h-10"/>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin"/>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" ref={inputRef} className="hidden" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
          <button
            onClick={()=>inputRef.current?.click()} disabled={uploading}
            className="w-full border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition group">
            <Upload className="w-8 h-8"/>
            <span className="text-sm font-medium">Click to upload cover image</span>
            <span className="text-xs">Recommended: 1600×400px or wider</span>
          </button>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save} disabled={saving||uploading}>
            {saving?<Loader2 className="w-4 h-4 animate-spin mr-2"/>:<Check className="w-4 h-4 mr-2"/>}Save Cover
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DesignerProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [designer, setDesigner]   = useState<Designer | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal state
  const [lightbox,       setLightbox]       = useState<{images:string[];index:number;title:string}|null>(null);
  const [showSocial,     setShowSocial]     = useState(false);
  const [showAvatar,     setShowAvatar]     = useState(false);
  const [showCover,      setShowCover]      = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { navigate('/sign-in'); return; }
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const token = await getToken();
        if (!token) throw new Error('No auth token');
        const mr = await fetch(`http://localhost:5000/api/users/mongo-id/${user.id}`, { headers:{ Authorization:`Bearer ${token}` } });
        if (!mr.ok) throw new Error(`Mongo ID failed (${mr.status})`);
        const md = await mr.json();
        if (!md.success || !md.mongoId) throw new Error('No MongoDB ID');
        const pr = await fetch(`http://localhost:5000/api/designers/${md.mongoId}`, { headers:{ Authorization:`Bearer ${token}` } });
        if (!pr.ok) throw new Error(`Profile fetch failed (${pr.status})`);
        const pd = await pr.json();
        if (!pd.success || !pd.designer) throw new Error(pd.error || 'Not found');
        setDesigner(pd.designer);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load';
        setError(msg); toast({ title:'Error', description:msg, variant:'destructive' });
      } finally { setLoading(false); }
    };
    load();
  }, [isLoaded, user, navigate, getToken, toast]);

  // ─── Save helper ────────────────────────────────────────────────────────────
  const saveField = useCallback(async (field: string, value: unknown) => {
    if (!designer) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/designers/${designer._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      // Optimistic update
      setDesigner(d => d ? { ...d, [field]: value } : d);
      toast({ title:'✓ Saved', description:`${field} updated`, duration: 1500 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      toast({ title:'Save failed', description:msg, variant:'destructive' });
    }
  }, [designer, getToken, toast]);

  // ─── Guards ─────────────────────────────────────────────────────────────────
  if (!isLoaded || loading) return (
    <Layout><div className="container mx-auto py-32 text-center">
      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4"/>
      <p className="text-muted-foreground">Loading your designer profile...</p>
    </div></Layout>
  );

  if (error || !designer) return (
    <Layout><div className="container mx-auto py-32 text-center">
      <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4"/>
      <h1 className="text-3xl font-bold mb-4">Profile Not Loaded</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error || "Couldn't load your designer profile."}</p>
      <div className="flex gap-4 justify-center">
        <Button onClick={()=>window.location.reload()}>Retry</Button>
        <Button variant="outline" onClick={()=>navigate('/designer/apply')}>Set Up Profile</Button>
      </div>
    </div></Layout>
  );

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const formatCurrency = (n: number) => `KSh ${n.toLocaleString()}`;
  const formatDate = (ds: string) => new Date(ds).toLocaleDateString('en-KE',{year:'numeric',month:'long',day:'numeric'});
  const getStatusBadge = (status: ProjectStatus = 'completed') => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.completed;
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>{cfg.icon}{cfg.label}</span>;
  };

  return (
    <Layout>
      {/* Modals */}
      {lightbox   && <Lightbox images={lightbox.images} initialIndex={lightbox.index} title={lightbox.title} onClose={()=>setLightbox(null)}/>}
      {showSocial && <SocialLinksModal value={designer.socialLinks} onSave={v=>saveField('socialLinks',v)} onClose={()=>setShowSocial(false)}/>}
      {showAvatar && <AvatarModal current={designer.avatar} onSave={url=>saveField('avatar',url)} onClose={()=>setShowAvatar(false)}/>}
      {showCover  && <CoverModal  current={designer.coverImage||''} onSave={url=>saveField('coverImage',url)} onClose={()=>setShowCover(false)}/>}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={designer.coverImage||'https://images.unsplash.com/photo-1618221195710-dd2dabb60b29?w=1600'}
          alt="Cover" className="w-full h-full object-cover brightness-75"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"/>

        {/* Cover edit button */}
        <button onClick={()=>setShowCover(true)}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-sm rounded-lg border border-white/20 transition">
          <Camera className="w-4 h-4"/>Change Cover
        </button>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">

              {/* Avatar — click to open modal */}
              <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="relative group">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-8 ring-white/50 shadow-2xl cursor-pointer" onClick={()=>setShowAvatar(true)}>
                  <AvatarImage src={designer.avatar||user?.imageUrl} alt={designer.name}/>
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">
                    {designer.name.split(' ').map(n=>n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <button onClick={()=>setShowAvatar(true)}
                  className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Camera className="w-7 h-7 text-white drop-shadow-lg"/>
                </button>
                {designer.verified && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-primary"/>
                  </div>
                )}
              </motion.div>

              {/* Name + inline tagline */}
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3,duration:0.6}} className="flex-1 text-white">
                <div className="flex items-center flex-wrap gap-4 mb-3">
                  <h1 className="font-display text-4xl lg:text-6xl font-bold drop-shadow-lg">{designer.name}</h1>
                  {designer.superVerified && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-4 py-2">
                      <Sparkles className="w-5 h-5 mr-2" fill="black"/>Super Verified
                    </Badge>
                  )}
                </div>

                {/* Tagline — inline editable in hero */}
                <div className="mb-6">
                  <InlineEdit
                    value={designer.tagline||''}
                    placeholder="Click to add your tagline..."
                    onSave={v=>saveField('tagline',v)}
                    className="text-xl lg:text-2xl opacity-90 text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-base mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 flex-shrink-0"/>
                    <InlineEdit value={designer.location||''} placeholder="Add location" onSave={v=>saveField('location',v)} className="text-white"/>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_,i)=>(
                        <Star key={i} className={`w-5 h-5 ${i<Math.floor(designer.rating)?'fill-amber-400 text-amber-400':'text-white/40'}`}/>
                      ))}
                    </div>
                    <span className="font-bold">{designer.rating.toFixed(1)} ({designer.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" variant="secondary" onClick={()=>window.open(`/designer/${designer._id}`,'_blank')}>
                    <Eye className="w-5 h-5 mr-2"/>Preview Public View
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={()=>setActiveTab('settings')}>
                    <Settings className="w-5 h-5 mr-2"/>Settings
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-14">
              <TabsTrigger value="overview"  className="text-base"><BarChart3     className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-base"><Briefcase     className="w-4 h-4 mr-2"/>Portfolio</TabsTrigger>
              <TabsTrigger value="reviews"   className="text-base"><MessageSquare className="w-4 h-4 mr-2"/>Reviews</TabsTrigger>
              <TabsTrigger value="settings"  className="text-base"><Settings      className="w-4 h-4 mr-2"/>Settings</TabsTrigger>
            </TabsList>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-8">
              {/* Stats — response time and price are editable */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground text-sm">Projects Completed</h3>
                    <Briefcase className="w-5 h-5 text-primary"/>
                  </div>
                  <div className="text-4xl font-bold text-primary">{designer.projectsCompleted}</div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-muted-foreground text-sm">Average Rating</h3>
                    <Star className="w-5 h-5 text-accent fill-accent"/>
                  </div>
                  <div className="text-4xl font-bold text-accent">{designer.rating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground mt-1">from {designer.reviewCount} reviews</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-muted-foreground text-sm">Response Time</h3>
                    <Clock className="w-5 h-5 text-blue-500"/>
                  </div>
                  <DropdownEdit value={designer.responseTime} options={RESPONSE_OPTIONS}
                    placeholder="Set response time" onSave={v=>saveField('responseTime',v)}/>
                </Card>
              </div>

              {/* Starting price card */}
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-muted-foreground text-sm">Starting Price</h3>
                  <DollarSign className="w-5 h-5 text-green-500"/>
                </div>
                <PriceEdit value={designer.startingPrice} onSave={v=>saveField('startingPrice',v)}/>
              </Card>

              {/* About — inline rich textarea */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl font-bold">About</h2>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Pencil className="w-3 h-3"/>Click text to edit</span>
                </div>
                <InlineEdit
                  value={designer.about||''}
                  placeholder="Tell clients about yourself — your style, experience, and what makes you unique..."
                  onSave={v=>saveField('about',v)}
                  multiline
                  className="text-base leading-relaxed text-muted-foreground"
                />
              </Card>

              {/* Styles — tag editor */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl font-bold">Design Styles</h2>
                  <span className="text-xs text-muted-foreground">Click a tag to remove · Click + to add</span>
                </div>
                <StylesEditor value={designer.styles||[]} onSave={v=>saveField('styles',v)}/>
              </Card>

              {/* Social links */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">Social & Links</h2>
                  <Button variant="outline" size="sm" onClick={()=>setShowSocial(true)}>
                    <Pencil className="w-4 h-4 mr-2"/>Edit Links
                  </Button>
                </div>
                {designer.socialLinks && Object.values(designer.socialLinks).some(Boolean) ? (
                  <div className="flex flex-wrap gap-3">
                    {designer.socialLinks.instagram && (
                      <a href={designer.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-muted transition text-sm font-medium">
                        <Instagram className="w-4 h-4 text-pink-500"/>Instagram<ExternalLink className="w-3 h-3 text-muted-foreground"/>
                      </a>
                    )}
                    {designer.socialLinks.pinterest && (
                      <a href={designer.socialLinks.pinterest} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-muted transition text-sm font-medium">
                        <LinkIcon className="w-4 h-4 text-red-500"/>Pinterest<ExternalLink className="w-3 h-3 text-muted-foreground"/>
                      </a>
                    )}
                    {designer.socialLinks.website && (
                      <a href={designer.socialLinks.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-muted transition text-sm font-medium">
                        <Globe className="w-4 h-4 text-blue-500"/>Website<ExternalLink className="w-3 h-3 text-muted-foreground"/>
                      </a>
                    )}
                  </div>
                ) : (
                  <button onClick={()=>setShowSocial(true)} className="w-full border-2 border-dashed border-muted-foreground/20 rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition">
                    <Plus className="w-6 h-6"/>
                    <span className="text-sm font-medium">Add your social links</span>
                  </button>
                )}
              </Card>
            </TabsContent>

            {/* ── Portfolio ── */}
            <TabsContent value="portfolio" className="space-y-6">
              <div>
                <h2 className="font-display text-3xl font-bold">Portfolio</h2>
                <p className="text-muted-foreground mt-1">{designer.completedProjects?.length||0} project{designer.completedProjects?.length!==1?'s':''}</p>
              </div>

              {designer.completedProjects?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {designer.completedProjects.map(project => {
                    const imgs = project.photos ?? [];
                    return (
                      <Card key={project._id} className="overflow-hidden group">
                        <div className="relative h-56 overflow-hidden bg-muted cursor-pointer"
                          onClick={()=>imgs.length&&setLightbox({images:imgs,index:0,title:project.title})}>
                          {imgs.length > 0 ? (
                            <>
                              <img src={imgs[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1.5 text-white">
                                  <ZoomIn className="w-8 h-8"/><span className="text-sm font-semibold">{imgs.length>1?`View ${imgs.length} photos`:'View photo'}</span>
                                </div>
                              </div>
                              {imgs.length>1 && <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none"><Images className="w-3.5 h-3.5"/>{imgs.length}</div>}
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                              <Briefcase className="w-12 h-12"/><span className="text-sm">No photos</span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 pointer-events-none">{getStatusBadge((project.status??'completed') as ProjectStatus)}</div>
                          {project.styles?.length>0 && (
                            <div className="absolute top-2 right-2 flex gap-1 pointer-events-none">
                              {project.styles.slice(0,2).map(s=><span key={s} className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">{s}</span>)}
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-1 line-clamp-1">{project.title}</h3>
                          {project.description&&<p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 flex-shrink-0"/><span className="truncate">{project.location||'N/A'}</span></div>
                            <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 flex-shrink-0"/><span>{formatCurrency(project.budget)}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 flex-shrink-0"/><span>{project.timeline}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 flex-shrink-0"/><span>{formatDate(project.completedAt)}</span></div>
                          </div>
                          {imgs.length>1 && (
                            <div className="flex gap-1.5 mt-3">
                              {imgs.slice(0,5).map((photo,i)=>(
                                <button key={i} onClick={()=>setLightbox({images:imgs,index:i,title:project.title})}
                                  className={`relative flex-shrink-0 w-11 h-11 rounded-md overflow-hidden ring-2 transition-all hover:ring-primary ${i===0?'ring-primary':'ring-transparent'}`}>
                                  <img src={photo} alt="" className="w-full h-full object-cover"/>
                                  {i===4&&imgs.length>5&&<div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">+{imgs.length-5}</div>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4"/>
                  <h3 className="text-2xl font-bold mb-2">No completed projects yet</h3>
                  <p className="text-muted-foreground">Projects you complete will appear here automatically</p>
                </Card>
              )}

              {designer.portfolioImages?.length>0 && (
                <Card className="p-6 mt-4">
                  <div className="flex items-center justify-between mb-5">
                    <div><h3 className="font-display text-xl font-bold">Application Portfolio</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{designer.portfolioImages.length} image{designer.portfolioImages.length!==1?'s':''}</p></div>
                    <Badge variant="secondary" className="text-sm px-3 py-1"><Images className="w-4 h-4 mr-1.5"/>{designer.portfolioImages.length}</Badge>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {designer.portfolioImages.map((url,i)=>(
                      <button key={i} onClick={()=>setLightbox({images:designer.portfolioImages,index:i,title:'Application Portfolio'})}
                        className="relative aspect-square rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:shadow-lg">
                        <img src={url} alt={`Portfolio ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition transform scale-75 group-hover:scale-100">
                            <ZoomIn className="w-4 h-4 text-primary"/>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* ── Reviews ── */}
            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold">Client Reviews</h2>
                  <p className="text-muted-foreground mt-2">{designer.reviewCount} total reviews • {designer.rating.toFixed(1)} average</p>
                </div>
                <div className="flex">{[...Array(5)].map((_,i)=><Star key={i} className={`w-6 h-6 ${i<Math.floor(designer.rating)?'fill-primary text-primary':'text-muted'}`}/>)}</div>
              </div>
              {designer.reviews?.length>0 ? (
                <div className="grid gap-6">
                  {designer.reviews.map((review,index)=>(
                    <Card key={review._id||index} className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12"><AvatarImage src={review.clientAvatar}/><AvatarFallback>{review.clientName?.[0]||'?'}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div><h4 className="font-bold">{review.clientName||'Anonymous'}</h4>
                              <p className="text-sm text-muted-foreground">{review.date?formatDate(review.date):'Date not available'}</p></div>
                            <div className="flex">{[...Array(5)].map((_,i)=><Star key={i} className={`w-4 h-4 ${i<review.rating?'fill-yellow-400 text-yellow-400':'text-muted'}`}/>)}</div>
                          </div>
                          <p className="leading-relaxed">{review.comment||'No comment'}</p>
                          {review.projectImage && (
                            <button onClick={()=>setLightbox({images:[review.projectImage!],index:0,title:`${review.clientName}'s project`})}
                              className="mt-4 rounded-lg overflow-hidden border block w-full group">
                              <div className="relative"><img src={review.projectImage} alt="Project" className="w-full h-48 object-cover group-hover:brightness-90 transition"/>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ZoomIn className="w-8 h-8 text-white drop-shadow-lg"/></div>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4"/>
                  <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground">Complete projects to receive client feedback</p>
                </Card>
              )}
            </TabsContent>

            {/* ── Settings ── */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="p-8">
                <h2 className="font-display text-2xl font-bold mb-6">Profile Settings</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Calendly */}
                  <div className="md:col-span-2">
                    <label className="font-semibold mb-2 block text-sm text-muted-foreground">Calendly Booking Link</label>
                    <InlineEdit value={designer.calendlyLink||''} placeholder="https://calendly.com/your-link"
                      onSave={v=>saveField('calendlyLink',v)} className="text-sm"/>
                  </div>
                  {/* Starting price */}
                  <div>
                    <label className="font-semibold mb-2 block text-sm text-muted-foreground">Starting Price</label>
                    <PriceEdit value={designer.startingPrice} onSave={v=>saveField('startingPrice',v)}/>
                  </div>
                  {/* Response time */}
                  <div>
                    <label className="font-semibold mb-2 block text-sm text-muted-foreground">Response Time</label>
                    <DropdownEdit value={designer.responseTime} options={RESPONSE_OPTIONS} placeholder="Set response time" onSave={v=>saveField('responseTime',v)}/>
                  </div>
                  {/* Photos */}
                  <div className="md:col-span-2 flex gap-4 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={()=>setShowAvatar(true)}><Camera className="w-4 h-4 mr-2"/>Update Profile Photo</Button>
                    <Button variant="outline" className="flex-1" onClick={()=>setShowCover(true)}><Upload className="w-4 h-4 mr-2"/>Update Cover Image</Button>
                    <Button variant="outline" className="flex-1" onClick={()=>setShowSocial(true)}><LinkIcon className="w-4 h-4 mr-2"/>Edit Social Links</Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}