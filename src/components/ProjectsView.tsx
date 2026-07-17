import React, { useState } from 'react';
import { Project, ChecklistStatus, Language, Company } from '../types';
import { CHANNELS_LANG, INITIAL_CHECKLIST_RAW } from '../data';
import { 
  FolderGit2, Plus, Calendar, User, FileSpreadsheet, 
  Layers, Settings2, Trash2, HeartHandshake, Eye, MapPin
} from 'lucide-react';

interface ProjectsViewProps {
  language: Language;
  projects: Project[];
  companies: Company[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onCreateProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectsView({
  language,
  projects,
  companies,
  activeProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject
}: ProjectsViewProps) {
  const t = CHANNELS_LANG[language];
  const [isAdding, setIsAdding] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Inspeção');
  const [client, setClient] = useState('');
  const [contract, setContract] = useState('');
  const [techResponsible, setTechResponsible] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [area, setArea] = useState('');
  const [title, setTitle] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [revision, setRevision] = useState('Rev. 0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !client) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      category,
      client,
      contract,
      techResponsible,
      docNumber: docNumber || `DOC-${Math.floor(Math.random() * 9000 + 1000)}`,
      area,
      title: title || name,
      orderNumber,
      revision,
      createdAt: new Date().toISOString(),
      // Deep copy initial items
      checklist: INITIAL_CHECKLIST_RAW.map(item => ({
        ...item,
        id: item.code,
        category: item.category as 'CAPA' | 'CONTRA_CAPA' | 'SUMARIO',
        status: ChecklistStatus.PENDING,
        emissions: []
      }))
    };

    onCreateProject(newProject);
    setIsAdding(false);
    
    // Reset
    setName('');
    setCategory('Inspeção');
    setClient('');
    setContract('');
    setTechResponsible('');
    setDocNumber('');
    setArea('');
    setTitle('');
    setOrderNumber('');
    setRevision('Rev. 0');
  };

  return (
    <div className="space-y-6">
      
      {/* Tab control header */}
      <div className="flex justify-between items-center bg-gray-900/40 p-4 border border-gray-800 rounded-lg">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-orange-500" />
            {t.projectList}
          </h2>
          <p className="text-xs text-gray-400">{language === 'PT' ? 'Gerencie as capas e contra-capas dos projetos de engenharia' : 'Manage quality sheets of Oil & Gas engineering programs'}</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-black text-xs font-semibold rounded transition flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          {t.newProject}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-900/60 border border-orange-500/50 rounded-lg p-6 space-y-4">
          <div className="border-b border-gray-800 pb-2">
            <h3 className="text-sm font-bold text-orange-500 font-mono uppercase tracking-wide">
              {language === 'PT' ? 'Informações da Ficha (Capa & Contra Capa)' : 'Project Quality Setup Sheet'}
            </h3>
            <p className="text-[11px] text-gray-500">{language === 'PT' ? 'Preencha os dados primários de certificação técnica.' : 'Enter certified quality credentials.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Project Name */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{language === 'PT' ? 'Identificação / Nome do Projeto *' : 'Project ID / Name *'}</label>
              <input
                type="text"
                required
                placeholder="Ex: Refinaria REDUC - Manutenção Setor B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Categorias (Inspeção, Manutenção, Engenharia) */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.category}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Inspeção">{language === 'PT' ? 'Inspeção' : 'Inspection'}</option>
                <option value="Manutenção">{language === 'PT' ? 'Manutenção' : 'Maintenance'}</option>
                <option value="Engenharia">{language === 'PT' ? 'Engenharia da Confiabilidade' : 'Reliability Engineering'}</option>
              </select>
            </div>

            {/* Cliente */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.client}</label>
              <select
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">{language === 'PT' ? '-- Escolha o Cliente --' : '-- Select Client --'}</option>
                {companies.filter(c => c.id !== 'master').map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Contract number */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.contract}</label>
              <input
                type="text"
                placeholder="CTR-OG-8812-B"
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Responsável Técnico */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.techResponsible}</label>
              <input
                type="text"
                placeholder="Nome do Engenheiro (Ex: CREA RJ 124559)"
                value={techResponsible}
                onChange={(e) => setTechResponsible(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Nº do Documento */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.docNumber}</label>
              <input
                type="text"
                placeholder="DOC-REP-QMS-4001"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Área */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.area}</label>
              <input
                type="text"
                placeholder="Ex: Área 42 - Hidrocarbonetos"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Título do Projeto */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.titleLabel}</label>
              <input
                type="text"
                placeholder="Dossier Geral de Qualidade de Spools"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Ordem de Serviço */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.orderNumber}</label>
              <input
                type="text"
                placeholder="OS-7001229"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Revisão */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">{t.revisionLabel}</label>
              <input
                type="text"
                placeholder="Rev. 0"
                value={revision}
                onChange={(e) => setRevision(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black text-xs font-semibold rounded transition"
            >
              {t.createProjectBtn}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Projects cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const totalItems = proj.checklist.length;
          const approvedCount = proj.checklist.filter(c => c.status === ChecklistStatus.APPROVED).length;
          const activePercentage = totalItems > 0 ? Math.round((approvedCount / totalItems) * 100) : 0;
          
          return (
            <div 
              key={proj.id}
              className={`bg-gray-905 bg-gray-900/60 border rounded-xl overflow-hidden shadow-lg transition-all ${
                activeProject?.id === proj.id ? 'border-orange-500 ring-1 ring-orange-500/25' : 'border-gray-800'
              }`}
            >
              
              {/* Header card banner */}
              <div className="bg-[#111827] p-4 border-b border-gray-800 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                    {proj.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5 leading-tight">{proj.name}</h3>
                </div>
                
                {/* Delete button (only let users delete created ones to protect initial simulation data) */}
                <button
                  onClick={() => {
                    if (confirm(language === 'PT' ? 'Deseja excluir este projeto?' : 'Are you sure you want to delete this project?')) {
                      onDeleteProject(proj.id);
                    }
                  }}
                  className="p-1 hover:bg-red-950/20 text-gray-500 hover:text-red-400 rounded transition"
                  title="Excluir Projeto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Specs grid */}
              <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-gray-300 font-mono">
                <div className="flex items-center gap-1.5 text-gray-400 truncate">
                  <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="text-gray-500">Cliente:</span>
                  <span className="text-gray-300 select-all font-sans">{proj.client}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-gray-400 truncate">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="text-gray-500">CONTR:</span>
                  <span className="text-gray-300">{proj.contract || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 truncate col-span-2">
                  <Layers className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="text-gray-500">Doc Ref:</span>
                  <span className="text-gray-300 select-all">{proj.docNumber}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 truncate col-span-2 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="text-gray-500">Área:</span>
                  <span className="text-gray-300 truncate">{proj.area || 'N/A'}</span>
                </div>

                <div className="col-span-2 border-t border-gray-800/80 pt-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">{language === 'PT' ? 'Fevereiro Progress' : 'Inspection Goal'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{activePercentage}%</span>
                      <span className="text-gray-600 text-[10px]">({approvedCount}/{totalItems} aprovados)</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onSelectProject(proj)}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-black text-[11px] font-bold rounded-md flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-black" />
                    {t.details}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </section>

    </div>
  );
}
