'use client';

import React, { useMemo, useState } from 'react';
import { BellRing, CheckCircle2, ChevronDown, LockKeyhole, Plus, Search, ShieldCheck, Trash2, Zap } from 'lucide-react';

const providers = [
  ['TWILIO','Twilio','SMS / WhatsApp'],['MSG91','MSG91','SMS'],['2FACTOR','2Factor','SMS'],['FAST2SMS','Fast2SMS','SMS'],['GUPSHUP','Gupshup','SMS / WhatsApp'],['KALEYRA','Kaleyra','SMS / WhatsApp'],['ROUTE_MOBILE','Route Mobile','SMS / WhatsApp'],['EXOTEL','Exotel','SMS'],['KARIX','Karix','SMS / WhatsApp'],['TEXTLOCAL','Textlocal','SMS'],['SINCH','Sinch','SMS / WhatsApp'],['VONAGE','Vonage','SMS / WhatsApp'],['PLIVO','Plivo','SMS'],['INFOBIP','Infobip','SMS / WhatsApp'],['MESSAGEBIRD','Bird / MessageBird','SMS / WhatsApp'],['AWS_SNS','Amazon SNS','SMS'],['AZURE_COMMUNICATION','Azure Communication Services','SMS'],['SENDGRID','SendGrid','Email'],['MAILGUN','Mailgun','Email'],['POSTMARK','Postmark','Email'],['AMAZON_SES','Amazon SES','Email'],['BREVO','Brevo','Email / SMS'],['RESEND','Resend','Email'],['SMTP','Custom SMTP','Email'],['META_WHATSAPP_CLOUD','Meta WhatsApp Cloud API','WhatsApp'],['GUPSHUP_WHATSAPP','Gupshup WhatsApp','WhatsApp'],['INTERAKT','Interakt','WhatsApp'],['AISENSY','AiSensy','WhatsApp'],['WATI','WATI','WhatsApp'],['FIREBASE_FCM','Firebase Cloud Messaging','Push'],['ONESIGNAL','OneSignal','Push'],['WEB_PUSH','Web Push (VAPID)','Push'],
] as const;

export default function NotificationGatewaysPage() {
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('ALL');
  const filtered = useMemo(() => providers.filter(([key,name,type]) =>
    (channel === 'ALL' || type.toUpperCase().includes(channel)) && `${key} ${name}`.toLowerCase().includes(search.toLowerCase())
  ), [search, channel]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary mb-2"><ShieldCheck className="w-4 h-4"/> Enterprise Messaging</div>
          <h1 className="text-3xl font-black text-text-primary">Communication Gateways</h1>
          <p className="text-text-secondary mt-1 max-w-2xl">Connect school-specific SMS, WhatsApp, email and push providers with encrypted credentials and controlled defaults.</p>
        </div>
        <button className="bg-primary text-white px-5 py-3 rounded-button font-bold flex items-center gap-2 shadow-md"><Plus className="w-4 h-4"/> Add Gateway</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          ['32','Supported provider profiles',Zap],['0','Credentials exposed to UI',LockKeyhole],['4','Channel families',BellRing],
        ].map(([value,label,Icon]) => <div key={label as string} className="bg-white border border-surface-border rounded-card p-5 shadow-card"><div className="flex items-center justify-between"><div><p className="text-3xl font-black text-text-primary">{value as string}</p><p className="text-xs font-bold text-text-muted mt-1">{label as string}</p></div><Icon className="w-6 h-6 text-primary"/></div></div>)}
      </div>

      <div className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-surface-border flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search providers..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-border outline-none text-sm"/></div>
          <select value={channel} onChange={e=>setChannel(e.target.value)} className="px-3 py-2.5 rounded-lg border border-surface-border text-sm font-semibold"><option value="ALL">All channels</option><option value="SMS">SMS</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option><option value="PUSH">Push</option></select>
        </div>
        <div className="divide-y divide-surface-border">
          {filtered.map(([key,name,type]) => <div key={key} className="p-5 flex flex-col md:flex-row md:items-center gap-4 md:justify-between hover:bg-surface-background/60"><div className="flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{name.slice(0,1)}</div><div><p className="font-bold text-text-primary">{name}</p><p className="text-xs text-text-muted mt-1">{type} · {key}</p></div></div><div className="flex items-center gap-3"><span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="w-3.5 h-3.5"/> Provider profile</span><button className="p-2 rounded-lg border border-surface-border text-text-muted hover:text-primary" aria-label={`Configure ${name}`}><ChevronDown className="w-4 h-4"/></button><button className="p-2 rounded-lg border border-surface-border text-text-muted hover:text-red-600" aria-label={`Remove ${name}`}><Trash2 className="w-4 h-4"/></button></div></div>)}
        </div>
      </div>
    </div>
  );
}
