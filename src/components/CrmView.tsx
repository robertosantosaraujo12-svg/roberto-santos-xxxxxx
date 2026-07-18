import React, { useState } from 'react';
import { Language, CrmContact, CrmActivity } from '../types';
import { CHANNELS_LANG } from '../data';
import { 
  HeartHandshake, Plus, Phone, Mail, UserCheck, 
  MessageSquare, Calendar, Trash2, Send, Bookmark, Briefcase
} from 'lucide-react';

interface CrmViewProps {
  language: Language;
  contacts: CrmContact[];
  activities: CrmActivity[];
  onAddContact: (contact: CrmContact) => void;
  onAddActivity: (activity: CrmActivity) => void;
}

export default function CrmView({
  language,
  contacts,
  activities,
  onAddContact,
  onAddActivity
}: CrmViewProps) {
  const t = CHANNELS_LANG[language];
  const [isAddingContact, setIsAddingContact] = useState(false);
  
  // Contact Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'negotiating'>('active');

  // Logs note fields
  const [logTitle, setLogTitle] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [logType, setLogType] = useState<'call' | 'email' | 'meeting'>('meeting');

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    const newContact: CrmContact = {
      id: `cont-${Date.now()}`,
      name,
      role: role || (language === 'PT' ? 'Representante de Qualidade' : 'Quality Representative'),
      company,
      phone,
      email,
      status
    };

    onAddContact(newContact);
    setIsAddingContact(false);

    // Reset
    setName('');
    setRole('');
    setCompany('');
    setPhone('');
    setEmail('');
  };

  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle || !logDesc) return;

    const newActivity: CrmActivity = {
      id: `act-${Date.now()}`,
      date: new Date().toISOString(),
      type: logType,
      title: logTitle,
      description: logDesc,
      user: 'Renato Mendes (Master QA/QC)'
    };

    onAddActivity(newActivity);
    setLogTitle('');
    setLogDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Intro section */}
      <section className="bg-gray-900/40 p-4 border border-gray-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-blue-500 animate-pulse" />
            {t.crmTitle}
          </h2>
          <p className="text-xs text-gray-400">
            {language === 'PT' 
              ? 'Acompanhe contatos e fluxos de comunicação técnica com as empresas contratantes.' 
              : 'Keep track of correspondence and validation reviews with clients and external inspection agencies.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddingContact(!isAddingContact)}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-black text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          {t.crmAddContact}
        </button>
      </section>

      {/* Grid: Left Contacts directory list | Right Log histories */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CONTACT SHEET SECTION */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Add contact Form */}
          {isAddingContact && (
            <form onSubmit={handleAddContactSubmit} className="bg-gray-900/60 border border-blue-500/50 p-5 rounded-lg space-y-4">
              <h3 className="text-xs font-bold text-blue-500 font-mono uppercase">
                {language === 'PT' ? 'Novo Registro de Contato CRM' : 'Register New CRM Stakeholder'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase">{t.crmName} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded px-2 text-xs py-1.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase">{t.crmRole}</label>
                  <input
                    type="text"
                    placeholder="Ex: Coordenador QA/QC"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded px-2 text-xs py-1.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase">{language === 'PT' ? 'Empresa / Organização *' : 'Company *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cliente S.A."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded px-2 text-xs py-1.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase">{t.crmPhone}</label>
                  <input
                    type="text"
                    placeholder="+55 21 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded px-2 text-xs py-1.5 text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] text-gray-400 font-mono uppercase">{t.crmEmail}</label>
                  <input
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded px-2 text-xs py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-black font-semibold animate-pulse"
                >
                  {language === 'PT' ? 'Salvar Contato' : 'Save Contact'}
                </button>
              </div>

            </form>
          )}

          {/* Contacts Directory Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="bg-[#111827]/40 border border-gray-800 rounded-lg p-4 font-mono space-y-3 hover:border-gray-700 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans">{contact.name}</h4>
                    <p className="text-[10px] text-blue-500/90 mt-0.5 flex items-center gap-1 font-sans">
                      <Briefcase className="w-3 h-3" />
                      {contact.role}
                    </p>
                  </div>
                  <UserCheck className="w-4 h-4 text-teal-400" />
                </div>

                <div className="text-[10px] text-gray-400 border-t border-gray-800/80 pt-2.5 space-y-1.5">
                  <p className="font-semibold text-gray-200">
                    🏢 {contact.company}
                  </p>
                  
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition">
                      <Phone className="w-3 h-3 text-blue-500" />
                      <span>{contact.phone}</span>
                    </a>
                  )}

                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition truncate">
                      <Mail className="w-3 h-3 text-blue-500" />
                      <span className="truncate">{contact.email}</span>
                    </a>
                  )}
                </div>

                <div className="flex justify-between items-center text-[9px] text-gray-500 pt-1">
                  <span>ID Code: {contact.id.toUpperCase()}</span>
                  <span className="bg-teal-950/40 text-teal-400 border border-teal-900/40 px-1 py-0.2 rounded font-sans">
                    CONEXÃO OK
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* LOG HISTORY SESSIONS NOTES */}
        <div className="lg:col-span-5 bg-gray-900/20 border border-gray-850 p-5 rounded-lg space-y-4">
          
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-800 pb-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            {t.crmLogs}
          </h3>

          {/* Quick logger action input form */}
          <form onSubmit={handleAddActivitySubmit} className="space-y-3 bg-[#111827]/60 p-3.5 border border-gray-800 rounded-lg">
            
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase">{language === 'PT' ? 'Título do Evento' : 'Event Title'}</label>
              <input
                type="text"
                required
                placeholder="Ex: Auditoria do Selo ASME"
                value={logTitle}
                onChange={(e) => setLogTitle(e.target.value)}
                className="w-full bg-[#0a0f18] border border-gray-800 rounded px-2.5 py-1 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase">{language === 'PT' ? 'Descrição / Relato Técnico' : 'Technical Note'}</label>
              <textarea
                rows={2}
                required
                placeholder={t.crmLogPlaceholder}
                value={logDesc}
                onChange={(e) => setLogDesc(e.target.value)}
                className="w-full bg-[#0a0f18] border border-gray-800 rounded px-2.5 py-1 text-xs text-white"
              />
            </div>

            <div className="flex justify-between items-center gap-2 pt-1.5">
              <div className="flex border border-gray-850 rounded overflow-hidden text-[10px] font-mono bg-[#0a0f18]">
                {[
                  { id: 'meeting', label: 'Reunião' },
                  { id: 'call', label: 'Ligação' },
                  { id: 'email', label: 'E-mail' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLogType(type.id as any)}
                    className={`px-2 py-1 ${
                      logType === type.id ? 'bg-blue-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-black text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Send className="w-3 h-3 text-black" />
                <span>{t.addLog}</span>
              </button>
            </div>

          </form>

          {/* Activities List Vertical timeline indicator */}
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div 
                key={act.id} 
                className="relative pl-4 border-l-2 border-gray-800 font-mono text-xs space-y-1"
              >
                {/* Node dot sign */}
                <span className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border border-[#0a0f18] animate-pulse" />
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-200">{act.title}</span>
                  <span className="text-[9px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(act.date).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-400 text-xs font-sans leading-relaxed">{act.description}</p>
                
                <p className="text-[9px] text-blue-500/70">
                  ⚡ Ref: {act.user} | Tag: <span className="uppercase font-semibold">{act.type}</span>
                </p>
              </div>
            ))}
          </div>

        </div>

      </section>

    </div>
  );
}
