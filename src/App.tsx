import React, { useState, useEffect } from 'react';
import { 
  Project, Company, ChecklistStatus, DocumentEmission, 
  Language, CrmContact, CrmActivity, Invoice
} from './types';
import { 
  INITIAL_PROJECTS, INITIAL_COMPANIES, INITIAL_CONTACTS, 
  INITIAL_CRM_ACTIVITIES, CHANNELS_LANG 
} from './data';
import {
  loadCompanies, saveCompaniesState,
  loadProjects, saveProjectsState,
  loadContacts, saveContactsState,
  loadActivities, saveActivitiesState
} from './lib/db';
import { isFirebaseConfigured } from './lib/firebase';

// Component imports
import Login from './components/Login';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import ChecklistView from './components/ChecklistView';
import CrmView from './components/CrmView';
import PowerBiView from './components/PowerBiView';
import DatabookView from './components/DatabookView';
import SaaSExpansionHubView from './components/SaaSExpansionHubView';

import { 
  FolderGit2, Cpu, BarChart3, Database, HeartHandshake, 
  BookOpen, LogOut, CheckSquare, Globe, ArrowRight, ShieldCheck, UserCheck, Sparkles, RefreshCw
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('PT');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<{ companyId: string; isAdmin: boolean } | null>(null);
  
  // Domain data state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'checklist' | 'crm' | 'powerbi' | 'databook' | 'saashub'>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Initialize and load persistent data
  useEffect(() => {
    const initData = async () => {
      try {
        const loadedCompanies = await loadCompanies(INITIAL_COMPANIES);
        setCompanies(loadedCompanies);
        
        const loadedProjects = await loadProjects(INITIAL_PROJECTS);
        setProjects(loadedProjects);
        
        const loadedContacts = await loadContacts(INITIAL_CONTACTS);
        setContacts(loadedContacts);
        
        const loadedActivities = await loadActivities(INITIAL_CRM_ACTIVITIES);
        setActivities(loadedActivities);

        const cachedInvoices = localStorage.getItem('piramidy_invoices');
        if (cachedInvoices) {
          const invList: Invoice[] = JSON.parse(cachedInvoices);
          setInvoices(invList.filter(inv => inv.companyId !== 'cliente-demo'));
        } else {
          setInvoices([]);
          localStorage.setItem('piramidy_invoices', JSON.stringify([]));
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    initData();

    const cachedUser = localStorage.getItem('piramidy_user');
    const cachedLang = localStorage.getItem('piramidy_lang');

    if (cachedLang) setLanguage(cachedLang as Language);
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }
  }, []);

  // Save changes helper (syncs with database/localStorage)
  const updateProjectsInStateAndCache = (newProjects: Project[]) => {
    setProjects(newProjects);
    saveProjectsState(newProjects);
  };

  const handleLoginSuccess = (companyId: string, isAdmin: boolean) => {
    const user = { companyId, isAdmin };
    setCurrentUser(user);
    localStorage.setItem('piramidy_user', JSON.stringify(user));
    
    // Choose sensible default project based on who logged in
    const userCompany = companies.find(c => c.id === companyId);
    const available = getFilteredProjects(companyId, isAdmin);
    if (available.length > 0) {
      setActiveProjectId(available[0].id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('piramidy_user');
    setActiveProjectId(null);
    setActiveTab('dashboard');
  };

  const handleSystemReset = () => {
    if (window.confirm(language === 'PT' ? 'Deseja realmente redefinir a base de dados local? Todos os dados customizados e caches serão restaurados de fábrica.' : 'Do you want to reset the local database? All custom progress will be restored to factory defaults.')) {
      localStorage.removeItem('piramidy_companies');
      localStorage.removeItem('piramidy_projects');
      localStorage.removeItem('piramidy_contacts');
      localStorage.removeItem('piramidy_activities');
      localStorage.removeItem('piramidy_user');
      window.location.reload();
    }
  };

  const handleRegisterCompany = (name: string, email: string, logo?: string) => {
    const newComp: Company = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      email,
      logoUrl: logo,
      createdAt: new Date().toISOString(),
      isRegistered: true
    };
    const updated = [...companies, newComp];
    setCompanies(updated);
    saveCompaniesState(updated);
  };

  // Helper to filter projects based on tenant identity
  const getFilteredProjects = (compId: string, isAdmin: boolean) => {
    if (isAdmin || compId === 'master') return projects;
    
    // Non-admin users see projects that match their registered company name
    const companyObj = companies.find(c => c.id === compId);
    if (!companyObj) return [];
    
    // Filter projects where client matches the company name
    return projects.filter(p => p.client.toLowerCase().includes(companyObj.name.toLowerCase()) || companyObj.name.toLowerCase().includes(p.client.toLowerCase()));
  };

  const currentFilteredProjects = currentUser ? getFilteredProjects(currentUser.companyId, currentUser.isAdmin) : [];
  const selectedProject = currentFilteredProjects.find(p => p.id === activeProjectId) || (currentFilteredProjects.length > 0 ? currentFilteredProjects[0] : null);

  // Update Checklist item status action
  const handleUpdateChecklistItemStatus = (itemId: string, status: ChecklistStatus) => {
    if (!selectedProject) return;

    const updatedProjects = projects.map((p) => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          checklist: p.checklist.map((item) => {
            if (item.id === itemId) {
              return { ...item, status };
            }
            return item;
          })
        };
      }
      return p;
    });

    updateProjectsInStateAndCache(updatedProjects);
  };

  // Add saving emission to project checklist items
  const handleAddDocumentEmission = (itemId: string, emission: DocumentEmission) => {
    if (!selectedProject) return;

    const updatedProjects = projects.map((p) => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          checklist: p.checklist.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                emissions: [...item.emissions, emission]
              };
            }
            return item;
          })
        };
      }
      return p;
    });

    updateProjectsInStateAndCache(updatedProjects);
  };

  // Delete emission from checklist item
  const handleDeleteDocumentEmission = (itemId: string, emissionId: string) => {
    if (!selectedProject) return;

    const updatedProjects = projects.map((p) => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          checklist: p.checklist.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                emissions: item.emissions.filter((em) => em.id !== emissionId)
              };
            }
            return item;
          })
        };
      }
      return p;
    });

    updateProjectsInStateAndCache(updatedProjects);
  };

  // Create brand new project dynamically
  const handleCreateProject = (newProj: Project) => {
    const updated = [...projects, newProj];
    updateProjectsInStateAndCache(updated);
    setActiveProjectId(newProj.id);
  };

  // Exclude a project
  const handleDeleteProject = (projId: string) => {
    const updated = projects.filter(p => p.id !== projId);
    updateProjectsInStateAndCache(updated);
    if (activeProjectId === projId) {
      setActiveProjectId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // CRM Contact Actions
  const handleAddContact = (contact: CrmContact) => {
    const updated = [...contacts, contact];
    setContacts(updated);
    saveContactsState(updated);
  };

  const handleAddActivity = (activity: CrmActivity) => {
    const updated = [...activities, activity];
    setActivities(updated);
    saveActivitiesState(updated);
  };

  const handleLanguageSwitch = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('piramidy_lang', lang);
  };

  const getDaysPastDue = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    if (today <= due) return 0;
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const checkCompanyBlocked = (companyId: string) => {
    if (companyId === 'master' || companyId === 'admin') {
      return { blocked: false, reason: '' };
    }
    const comp = companies.find(c => c.id === companyId);
    if (comp?.isManualBlock) {
      return { blocked: true, reason: comp.blockReason || 'Bloqueio administrativo manual ativo.' };
    }
    
    // Find any pending invoice overdue by more than 10 days
    const pendingOverdueInvoice = invoices.find(inv => {
      if (inv.companyId === companyId && inv.status === 'PENDING') {
        const days = getDaysPastDue(inv.dueDate);
        return days > 10;
      }
      return false;
    });
    
    if (pendingOverdueInvoice) {
      const days = getDaysPastDue(pendingOverdueInvoice.dueDate);
      return {
        blocked: true,
        reason: `Bloqueio automático de segurança: Fatura ${pendingOverdueInvoice.id} em aberto há ${days} dias (limite de 10 dias de vencimento ultrapassado).`
      };
    }
    
    return { blocked: false, reason: '' };
  };

  const isCurrentProjectBlocked = (() => {
    if (!selectedProject) return { blocked: false, reason: '' };
    // Find company of selected project
    const comp = companies.find(c => 
      selectedProject.client.toLowerCase().includes(c.name.toLowerCase()) || 
      c.name.toLowerCase().includes(selectedProject.client.toLowerCase())
    );
    if (!comp) return { blocked: false, reason: '' };
    return checkCompanyBlocked(comp.id);
  })();

  const handleToggleManualBlock = (companyId: string) => {
    const updated = companies.map(c => {
      if (c.id === companyId) {
        const nextManual = !c.isManualBlock;
        return {
          ...c,
          isManualBlock: nextManual,
          isBlocked: nextManual,
          blockReason: nextManual ? 'Bloqueio administrativo manual ativado no portal de controle.' : ''
        };
      }
      return c;
    });
    setCompanies(updated);
    saveCompaniesState(updated);
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: 'PAID' | 'PENDING') => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status };
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem('piramidy_invoices', JSON.stringify(updated));
  };

  const handleSendInvoiceAlert = (invoiceId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          emailAlertsSent: inv.emailAlertsSent + 1,
          lastAlertSentAt: new Date().toISOString()
        };
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem('piramidy_invoices', JSON.stringify(updated));

    // Also add to CRM activities so it logs in the history! Very professional!
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      const newActivity: CrmActivity = {
        id: `act-email-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'email',
        title: `Alerta de Cobrança: Fatura ${invoice.id}`,
        description: `Notificação automática enviada para o e-mail financeiro do cliente ${invoice.companyName} referente ao vencimento da fatura ${invoice.id} (${invoice.dueDate}) no valor de R$ ${invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
        user: 'Portal Financeiro (Auto)'
      };
      
      handleAddActivity(newActivity);
    }
  };

  const t = CHANNELS_LANG[language];

  // If not logged in, render Login wrapper
  if (!currentUser) {
    return (
      <Login
        language={language}
        setLanguage={handleLanguageSwitch}
        companies={companies}
        onRegisterCompany={handleRegisterCompany}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const currentUserCompany = companies.find(c => c.id === currentUser.companyId);

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black print:bg-white print:text-black">
      
      {/* GLOBAL SYSTEM APP BAR */}
      <header className="bg-[#0b0f19] border-b border-gray-800/80 sticky top-0 z-40 px-4 sm:px-6 py-4 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-orange-400 p-[1.5px] rounded-md shadow-lg shadow-orange-500/5">
              <div className="w-full h-full bg-[#07090e] flex items-center justify-center rounded-md">
                <span className="font-mono text-xl font-bold tracking-tighter text-orange-500">▲</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-white tracking-tight text-base sm:text-lg">
                  PIRAMID <span className="text-orange-500 text-xs border border-orange-500/30 px-1 py-0.2 rounded font-mono uppercase">ENERGY GOVERNANCE</span>
                </h1>
                <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.2 rounded font-mono uppercase font-bold tracking-wider">
                  v2.26
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">{t.subtitle}</p>
            </div>
          </div>

          {/* Active Tenant / User Status & Language */}
          <div className="flex items-center flex-wrap gap-3 sm:gap-4 justify-center">
            
            {/* Display Active Company Tenant */}
            <div className="flex items-center gap-2 bg-gray-950/60 px-3 py-1.5 border border-gray-850 rounded-lg text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <div className="leading-none text-left">
                <span className="text-[10px] text-gray-500 block">ORGANIZAÇÃO ATIVA:</span>
                <span className="text-white font-bold truncate max-w-[120px] block">
                  {currentUser.isAdmin ? 'SISTEMA ADMINISTRATIVO' : (currentUserCompany?.name || 'Empresa Logada')}
                </span>
              </div>
            </div>

            {/* Language switch inline triggers */}
            <div className="flex gap-0.5 bg-gray-950 border border-gray-800 rounded p-0.5 text-xs font-mono">
              {(['PT', 'EN', 'ES'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSwitch(lang)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === lang ? 'bg-orange-500 text-black font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* System Reset Button */}
            <button
              onClick={handleSystemReset}
              className="px-2.5 py-1.5 border border-orange-500/20 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-black rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
              title={language === 'PT' ? 'Limpar Cache e Redefinir Sandbox' : 'Reset Sandbox Data'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{language === 'PT' ? 'Zerar Sandbox' : 'Reset Sandbox'}</span>
            </button>

            {/* Logout anchor */}
            <button
              onClick={handleLogout}
              className="p-2 border border-gray-800/80 hover:bg-orange-950/10 text-gray-400 hover:text-orange-400 rounded-lg transition"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* PRIMARY CONSOLE NAVIGATION CHROME */}
      <nav className="bg-[#0a0e16]/80 backdrop-blur-md border-b border-gray-900 sticky top-[72px] z-30 px-3 print:hidden">
        <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-1.5 sm:space-x-2 py-2 pr-2 scrollbar-none">
          {[
            { id: 'dashboard', label: t.dashboard, icon: BarChart3 },
            { id: 'projects', label: t.projects, icon: FolderGit2 },
            { id: 'checklist', label: t.checklist, icon: CheckSquare },
            { id: 'crm', label: t.crm, icon: HeartHandshake },
            { id: 'powerbi', label: t.powerBi, icon: Cpu },
            { id: 'databook', label: t.databook, icon: BookOpen },
            { id: 'saashub', label: currentUser?.isAdmin ? t.saasHub : t.clientHub, icon: Sparkles }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 px-3 sm:px-4 rounded-md text-xs font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-black font-extrabold shadow-md shadow-orange-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-850'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN SCREEN GRID WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 print:p-0">
        
        {/* Dynamic Project Quick Access Banner (Only shown if we are on Tab segments that require an active project) */}
        {['checklist', 'databook'].includes(activeTab) && (
          <div className="mb-4 bg-gray-950/60 p-2 border border-gray-800 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:hidden">
            <div className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
              <span>Selecione o Projeto Ativo:</span>
              <select
                value={activeProjectId || ''}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-[#111827] border border-gray-700 text-gray-200 p-1 text-xs rounded font-bold focus:outline-none cursor-pointer"
              >
                {currentFilteredProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedProject && (
              <span className="text-[10px] text-gray-500 font-mono">
                Cliente correspondente: <span className="text-orange-500 font-bold">{selectedProject.client}</span>
              </span>
            )}
          </div>
        )}

        {/* COMPONENT OUTLINE DELEGATIONS */}
        {activeTab === 'dashboard' && (
          <DashboardView
            language={language}
            projects={currentFilteredProjects}
            activeProject={selectedProject}
            currentUser={currentUser}
            companies={companies}
            onSelectProject={(p) => {
              setActiveProjectId(p.id);
              setActiveTab('checklist');
            }}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            language={language}
            projects={currentFilteredProjects}
            companies={companies}
            activeProject={selectedProject}
            onSelectProject={(p) => {
              setActiveProjectId(p.id);
              setActiveTab('checklist');
            }}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {activeTab === 'checklist' && (
          selectedProject ? (
            <ChecklistView
              language={language}
              project={selectedProject}
              currentUser={currentUser}
              isBlocked={isCurrentProjectBlocked.blocked}
              blockReason={isCurrentProjectBlocked.reason}
              onUpdateChecklistItemStatus={handleUpdateChecklistItemStatus}
              onAddDocumentEmission={handleAddDocumentEmission}
              onDeleteDocumentEmission={handleDeleteDocumentEmission}
            />
          ) : (
            <div className="bg-gray-900/40 p-8 rounded border border-gray-800 text-center font-mono">
              <p>Por favor, crie um projeto na aba "Projetos" antes de auditar documentos.</p>
            </div>
          )
        )}

        {activeTab === 'crm' && (
          <CrmView
            language={language}
            contacts={contacts}
            activities={activities}
            onAddContact={handleAddContact}
            onAddActivity={handleAddActivity}
          />
        )}

        {activeTab === 'powerbi' && (
          <PowerBiView
            language={language}
            projects={currentFilteredProjects}
          />
        )}

        {activeTab === 'databook' && (
          selectedProject ? (
            <DatabookView
              language={language}
              project={selectedProject}
              isBlocked={isCurrentProjectBlocked.blocked}
              blockReason={isCurrentProjectBlocked.reason}
            />
          ) : (
            <div className="bg-gray-900/40 p-8 rounded border border-gray-800 text-center font-mono">
              <p>Por favor, crie um projeto antes de compilar o seu databook técnico.</p>
            </div>
          )
        )}

        {activeTab === 'saashub' && (
          <SaaSExpansionHubView
            language={language}
            isAdmin={currentUser?.isAdmin === true}
            companies={companies}
            projects={projects}
            invoices={invoices}
            onToggleManualBlock={handleToggleManualBlock}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onSendInvoiceAlert={handleSendInvoiceAlert}
          />
        )}

      </main>

      {/* CONSOLE STATUS FOOTER BAR */}
      <footer className="bg-gray-950 border-t border-gray-900 p-4 shrink-0 text-center text-[10px] text-gray-500 font-mono tracking-wider mt-auto print:hidden">
        <p>PIRAMID ENERGY GOVERNANCE QUALITY ASSURANCE CONTROL PANEL © 2026</p>
        <p className="text-gray-650 opacity-55 mt-0.5">SHA256 STABILITY CHECK FOR ENTERPRISE AUDITS CERTIFIED ACTIVE</p>
      </footer>

    </div>
  );
}
