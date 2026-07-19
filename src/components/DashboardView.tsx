import React, { useState } from 'react';
import { Project, ChecklistStatus, Language, Company } from '../types';
import { CHANNELS_LANG } from '../data';
import { 
  TrendingUp, CheckCircle, Clock, AlertCircle, 
  MinusCircle, Award, Target, HelpCircle, Activity,
  Building2, DollarSign, FileText, Receipt, KeyRound, 
  ShieldAlert, CheckSquare, Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  language: Language;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  currentUser: { companyId: string; isAdmin: boolean } | null;
  companies: Company[];
}

export default function DashboardView({
  language,
  projects,
  activeProject,
  onSelectProject,
  currentUser,
  companies
}: DashboardViewProps) {
  const t = CHANNELS_LANG[language];
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);
  const [selectedInvoiceCompany, setSelectedInvoiceCompany] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoiceSent, setIsInvoiceSent] = useState(false);

  // Companies dictionary for admin billing & contract metrics computed dynamically
  const adminCompanies = companies
    .filter(c => c.id !== 'master')
    .map(c => ({
      id: c.id,
      name: c.name,
      cnpj: c.id === 'cliente-demo' ? '12.345.678/0001-99' : '00.000.000/0001-00',
      address: c.id === 'cliente-demo' ? 'Av. das Nações Unidas, 1000 - São Paulo - SP, 04578-000' : 'Endereço Comercial Cadastrado, s/n',
      email: c.email
    }));

  // Calculate stats for each admin company
  const companyBillingDetails = adminCompanies.map(comp => {
    // Find projects belonging to this company name
    const compProjects = projects.filter(p => 
      p.client.toLowerCase().includes(comp.name.toLowerCase()) || 
      comp.name.toLowerCase().includes(p.client.toLowerCase())
    );

    const osCount = compProjects.length;

    // Sum approved items
    let approvedItems = 0;
    let totalItems = 0;
    compProjects.forEach(p => {
      p.checklist.forEach(item => {
        totalItems++;
        if (item.status === ChecklistStatus.APPROVED) approvedItems++;
      });
    });

    const progress = totalItems > 0 ? Math.round((approvedItems / totalItems) * 100) : 0;

    // Billing metrics
    const basePlatformFee = 2500; // Fixed monthly platform subscription
    const pricePerOS = 2000;      // Value per active Work Order / OS
    const pricePerCertified = 75; // Value per digitally signed metrology item
    const subtotal = basePlatformFee + (osCount * pricePerOS) + (approvedItems * pricePerCertified);
    const tax = subtotal * 0.05;  // 5% ISS Tax
    const total = subtotal + tax;

    return {
      ...comp,
      projects: compProjects,
      osCount,
      osList: compProjects.map(p => ({ title: p.name, os: p.orderNumber || 'OS-N/A' })),
      approvedItems,
      totalItems,
      progress,
      basePlatformFee,
      pricePerOS,
      pricePerCertified,
      subtotal,
      tax,
      total
    };
  });

  // Consolidated admin stats
  const totalAdminActiveCompanies = companyBillingDetails.filter(c => c.osCount > 0).length;
  const totalAdminOSCount = companyBillingDetails.reduce((acc, c) => acc + c.osCount, 0);
  const totalAdminBilling = companyBillingDetails.reduce((acc, c) => acc + c.total, 0);

  // Selected company for billing modal
  const selectedCompData = companyBillingDetails.find(c => c.id === selectedInvoiceCompany);

  // Compute stats across all projects or active projects
  const availableProjects = projects;

  const totalProjects = availableProjects.length;

  // Let's summarize statuses across ALL checklists of all projects
  let approvedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  let naCount = 0;
  let analysisCount = 0;
  let totalItems = 0;

  availableProjects.forEach((p) => {
    p.checklist.forEach((item) => {
      totalItems++;
      if (item.status === ChecklistStatus.APPROVED) approvedCount++;
      else if (item.status === ChecklistStatus.PENDING) pendingCount++;
      else if (item.status === ChecklistStatus.REJECTED) rejectedCount++;
      else if (item.status === ChecklistStatus.NOT_APPLICABLE) naCount++;
      else if (item.status === ChecklistStatus.ANALYSIS) analysisCount++;
    });
  });

  const totalUnderInspection = totalItems - naCount;
  const inspectionProgress = totalUnderInspection > 0 
    ? Math.round((approvedCount / totalUnderInspection) * 100) 
    : 0;

  // Pie chart variables
  const radius = 60;
  const strokeWidth = 14;
  const circ = 2 * Math.PI * radius;
  const approvedPercentage = totalUnderInspection > 0 ? (approvedCount / totalUnderInspection) * 100 : 0;
  const otherPercentage = 100 - approvedPercentage;

  // Trend data representing month-by-month Quality Index (S-Curve simulation)
  const sCurveData = [
    { month: 'Jan', value: 35, compliance: 92 },
    { month: 'Feb', value: 48, compliance: 94 },
    { month: 'Mar', value: 60, compliance: 93 },
    { month: 'Apr', value: 72, compliance: 96 },
    { month: 'May', value: inspectionProgress === 0 ? 82 : inspectionProgress, compliance: 98 }
  ];

  return (
    <div className="space-y-6">
      
      {currentUser?.isAdmin && (
        <section className="bg-gray-950/40 border border-orange-500/20 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20">
                <KeyRound className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                  {language === 'PT' ? 'SISTEMA ADMINISTRATIVO - GESTÃO DE CONTRATOS E COBRANÇAS' : 'ADMIN PLATFORM - WORK ORDERS & CONTRACT BILLING'}
                </h2>
                <p className="text-[11px] text-gray-500 font-mono uppercase">
                  {language === 'PT' ? 'Painel Geral de Ordens de Serviço (OS) Ativas e Simulação de Faturamento' : 'Global management of active work orders (WO) and real-time client billing simulation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] font-mono font-bold text-orange-500">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'PT' ? 'MODO ADMINISTRADOR' : 'ADMIN CONTROL'}</span>
            </div>
          </div>

          {/* Admin KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-mono uppercase">{language === 'PT' ? 'Clientes Ativos no Sistema' : 'Active Client Entities'}</p>
                <p className="text-2xl font-bold font-mono text-white mt-1">{totalAdminActiveCompanies}</p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500/30" />
            </div>

            <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-mono uppercase">{language === 'PT' ? 'Total de Ordens de Serviço (OS)' : 'Total Work Orders (WO)'}</p>
                <p className="text-2xl font-bold font-mono text-white mt-1">{totalAdminOSCount}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500/30" />
            </div>

            <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between bg-gradient-to-r from-orange-950/10 to-orange-950/10 border-orange-500/20">
              <div>
                <p className="text-[10px] text-orange-500 font-mono uppercase">{language === 'PT' ? 'Faturamento Líquido Estimado' : 'Total Estimated Accrued Revenue'}</p>
                <p className="text-2xl font-bold font-mono text-orange-400 mt-1">R$ {totalAdminBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <Receipt className="w-8 h-8 text-orange-500/30" />
            </div>
          </div>

          {/* Companies Work Order & Billing list */}
          <div className="bg-gray-950/80 border border-gray-900 rounded-lg overflow-hidden font-mono">
            <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-800 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
              <span>{language === 'PT' ? 'Empresa Registrada / Cliente' : 'Registered Company / Client'}</span>
              <span>{language === 'PT' ? 'Resumo de Custos & Ações' : 'Costs Overview & Actions'}</span>
            </div>

            <div className="divide-y divide-gray-850">
              {companyBillingDetails.map((comp) => (
                <div key={comp.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-900/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <span className="text-sm font-bold text-white font-sans">{comp.name}</span>
                      <span className="text-[9px] text-gray-500 bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded uppercase">{comp.cnpj}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 font-sans">
                      <span className="font-mono text-[10px] text-orange-500 font-semibold">{comp.osCount} {language === 'PT' ? 'OS Ativa(s)' : 'Active WO(s)'}</span>
                      <span>•</span>
                      <span>{comp.approvedItems} {language === 'PT' ? 'itens de metrologia certificados' : 'certified quality items'}</span>
                      <span>•</span>
                      <span className="text-teal-400 font-mono font-semibold">{comp.progress}% compliance</span>
                    </div>

                    {/* Active Work Order Chips */}
                    {comp.osCount > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {comp.osList.map((o, idx) => (
                          <span key={idx} className="text-[9px] bg-gray-900 text-gray-400 border border-gray-800/80 px-2 py-0.5 rounded flex items-center gap-1" title={o.title}>
                            <Sparkles className="w-2 h-2 text-orange-500" />
                            <span>{o.os}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-gray-850 md:border-none">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-500 block">{language === 'PT' ? 'PREVISÃO DE FATURA:' : 'ESTIMATED INVOICE:'}</span>
                      <span className="text-sm font-bold text-orange-400 font-mono">
                        R$ {comp.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedInvoiceCompany(comp.id);
                        setIsInvoiceSent(false);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded text-xs transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/5 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === 'PT' ? 'Simular Fatura' : 'Simulate Invoice'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Overview stats layout */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI: Progress */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full filter blur-2xl -mr-6 -mt-6" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">{t.kpiProgress}</span>
            <Target className="w-4 h-4 text-orange-500 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white font-mono">{inspectionProgress}%</span>
            <div className="h-1.5 w-full bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000"
                style={{ width: `${inspectionProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI: Approved */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">{t.kpiApproved}</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-400 font-mono">{approvedCount}</span>
            <p className="text-[10px] text-gray-500 font-mono truncate">
              {language === 'PT' ? 'Relatórios com Certidão Digital' : 'Signed with Digital Cert'}
            </p>
          </div>
        </div>

        {/* KPI: Under Analysis */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
              {language === 'PT' ? 'Em Análise Técnico' : language === 'ES' ? 'En Análisis' : 'Under Analysis'}
            </span>
            <Clock className="w-4 h-4 text-orange-300" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-orange-300 font-mono">{analysisCount}</span>
            <p className="text-[10px] text-gray-500 font-mono truncate">
              {language === 'PT' ? 'Aguardando validação' : 'Awaiting compliance Check'}
            </p>
          </div>
        </div>

        {/* KPI: Pending */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
              {language === 'PT' ? 'Pendentes' : 'Pending'}
            </span>
            <MinusCircle className="w-4 h-4 text-orange-500/60" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-orange-500/70 font-mono">{pendingCount}</span>
            <p className="text-[10px] text-gray-500 font-mono text-orange-400/80 truncate">
              {language === 'PT' ? 'Não iniciados ainda' : 'Not started yet'}
            </p>
          </div>
        </div>

        {/* KPI: Rejected */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-[#ef4444] uppercase tracking-wide">{t.kpiRejected}</span>
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#ef4444] font-mono">{rejectedCount}</span>
            <p className="text-[10px] text-gray-500 font-mono truncate">
              {language === 'PT' ? 'Exige reavaliação de teste' : 'Requires re-examination'}
            </p>
          </div>
        </div>

      </section>

      {/* Main Charts area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Quality Donut and Status Metrics */}
        <div className="lg:col-span-1 bg-gray-900/40 border border-gray-800/80 rounded-lg p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-500" />
            {language === 'PT' ? 'ÍNDICE DE CONFORMIDADE' : 'COMPLIANCE INDEX'}
          </h3>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-gray-800"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                
                {/* Primary progress arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-orange-500 transition-all duration-1000"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circ}
                  strokeDashoffset={circ - (approvedPercentage / 100) * circ}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold font-mono text-white">{Math.round(approvedPercentage)}%</span>
                <span className="text-[9px] font-mono tracking-wider text-gray-500 uppercase mt-0.5">
                  {language === 'PT' ? 'APROVADO' : 'APPROVED'}
                </span>
              </div>
            </div>

            {/* List of Status Labels with specific styling colours */}
            <div className="w-full space-y-2 mt-6">
              
              {/* Approved */}
              <div className="flex justify-between items-center text-xs p-2 bg-green-950/20 rounded border border-green-900/30">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-300">{t.approved}</span>
                </div>
                <span className="font-mono text-green-400 font-bold">{approvedCount}</span>
              </div>

              {/* In Analysis */}
              <div className="flex justify-between items-center text-xs p-2 bg-gray-800/30 rounded border border-gray-700/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-white" />
                  <span className="text-gray-300">{t.analysis}</span>
                </div>
                <span className="font-mono text-white font-bold">{analysisCount}</span>
              </div>

              {/* Pending */}
              <div className="flex justify-between items-center text-xs p-2 bg-orange-950/10 rounded border border-orange-900/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-300">{t.pending}</span>
                </div>
                <span className="font-mono text-orange-500 font-bold">{pendingCount}</span>
              </div>

              {/* Rejected */}
              <div className="flex justify-between items-center text-xs p-2 bg-orange-950/10 rounded border border-orange-900/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-[#ef4444]">{t.rejected}</span>
                </div>
                <span className="font-mono text-orange-400 font-bold">{rejectedCount}</span>
              </div>

              {/* Not Applicable */}
              <div className="flex justify-between items-center text-xs p-2 bg-orange-950/10 rounded border border-orange-950/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-orange-400">{t.notApplicable}</span>
                </div>
                <span className="font-mono text-orange-400 font-semibold">{naCount}</span>
              </div>

            </div>

          </div>
        </div>

        {/* Right Side: Interactive S-Curve and Project Activities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Interactive Quality S-Curve Progress Graph */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500 animate-bounce" />
                {language === 'PT' ? 'CURVA S DE PROGRESSO & CONTROLE DE QUALIDADE' : 'S-CURVE & COMPLIANCE INDEX TRACKING'}
              </h3>
              <div className="flex gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-orange-500">
                  <span className="w-2.5 h-1 bg-orange-500 rounded" />
                  {language === 'PT' ? 'Progresso %' : 'Progress %'}
                </span>
                <span className="flex items-center gap-1.5 text-teal-400">
                  <span className="w-2.5 h-1 bg-teal-400 rounded" />
                  {language === 'PT' ? 'Aprovações' : 'Approval'}
                </span>
              </div>
            </div>

            {/* SVG Graph Grid rendering */}
            <div className="relative h-60 w-full mt-4 bg-gray-950/40 rounded-lg border border-gray-900 p-2 overflow-hidden flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
                
                {/* Horizontal reference axis */}
                <line x1="0" y1="200" x2="500" y2="200" stroke="#374151" strokeWidth="1" />

                {/* S-Curve Area Path */}
                <path
                  d="M 10 180 Q 125 150 250 110 T 490 30"
                  fill="none"
                  stroke="rgba(245, 158, 11, 0.2)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Progress Curve Line */}
                <path
                  d="M 50 160 C 130 140, 210 100, 310 70 C 390 50, 410 40, 450 32"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                />

                {/* Compliance Quality Index Line */}
                <path
                  d="M 50 45 C 130 40, 210 50, 310 35 C 390 38, 410 25, 450 20"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeDasharray="4"
                />

                {/* Hoverable Dot Nodes for monthly coordinates */}
                {sCurveData.map((d, index) => {
                  const x = 50 + index * 100;
                  // Map progress (0-100) to svg height (180 to 30)
                  const yProgress = 180 - (d.value / 100) * 150;
                  return (
                    <g key={d.month} className="cursor-pointer">
                      <circle
                        cx={x}
                        cy={yProgress}
                        r={hoveredDataPoint === index ? "7" : "4.5"}
                        className="fill-orange-500 hover:fill-orange-400 stroke-[#0a0f18] transition-all"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredDataPoint(index)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip detail overlay */}
              {hoveredDataPoint !== null && (
                <div 
                  className="absolute p-2 bg-[#111827] border border-orange-500 text-[10px] text-gray-200 font-mono rounded"
                  style={{
                    left: `${hoveredDataPoint * 20 + 5}%`,
                    bottom: '40px'
                  }}
                >
                  <p className="font-bold text-orange-500">{sCurveData[hoveredDataPoint].month}</p>
                  <p>{language === 'PT' ? 'Fis. Concluído' : 'Work Done'}: <span className="text-white font-bold">{Math.round(sCurveData[hoveredDataPoint].value)}%</span></p>
                  <p>{language === 'PT' ? 'Qualidade Geral' : 'Quality Quotient'}: <span className="text-teal-400 font-bold">{sCurveData[hoveredDataPoint].compliance}%</span></p>
                </div>
              )}

              {/* Month label row */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-[9px] text-gray-500 font-mono">
                {sCurveData.map(d => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>

            </div>
          </div>

          {/* Quick projects access grid */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-lg p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500" />
              {language === 'PT' ? 'ACESSO RÁPIDO AOS PROJETOS ATIVOS' : 'QUICK ACCESS ACTIVE PROJECTS'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const totalProjItems = proj.checklist.length;
                const approvedProjItems = proj.checklist.filter(c => c.status === ChecklistStatus.APPROVED).length;
                const progressPct = totalProjItems > 0 ? Math.round((approvedProjItems / totalProjItems) * 100) : 0;
                
                return (
                  <button
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      activeProject?.id === proj.id
                        ? 'bg-orange-950/20 border-orange-500/80 shadow'
                        : 'bg-gray-950/40 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-200 truncate">{proj.name}</span>
                      <span className="text-[10px] font-mono bg-gray-800 px-1.5 py-0.5 rounded text-orange-500">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 flex justify-between font-mono">
                      <span>{proj.client}</span>
                      <span>{proj.checklist.length} Checklist Items</span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </section>

      {/* Dynamic Invoice Simulation Modal */}
      {isInvoiceModalOpen && selectedCompData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0f19] border border-gray-800 rounded-xl max-w-2xl w-full shadow-2xl relative overflow-hidden font-sans flex flex-col max-h-[90vh]">
            
            {/* Modal header */}
            <div className="bg-gray-950 px-6 py-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {language === 'PT' ? 'Fatura Pro-Forma / Simulação de Cobrança' : 'Pro-Forma Invoice Simulation'}
                </span>
              </div>
              <button 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-gray-400 hover:text-white transition font-mono text-sm px-2 py-1 rounded hover:bg-gray-900 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal main print area scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-200">
              
              {/* Actual Printable Invoice Layout */}
              <div className="bg-white text-gray-900 p-6 sm:p-8 rounded-lg border border-gray-200 shadow-inner font-sans space-y-6 relative overflow-hidden text-left">
                {/* Invoice watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                  <span className="font-mono text-9xl font-bold tracking-tighter">PIRAMID</span>
                </div>

                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-100 pb-6">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xl font-black text-orange-600">▲</span>
                      <span className="font-sans font-black tracking-tighter text-lg text-gray-900 uppercase">Piramidy Energy Ltd</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono tracking-wider">TECNOLOGIA E GARANTIA DE QUALIDADE EM ÓLEO E GÁS</p>
                    <p className="text-[11px] text-gray-400 mt-1">CNPJ: 45.109.812/0001-90<br />Av. Rio Branco, 100 - Centro, Rio de Janeiro - RJ</p>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase">FATURA PRO-FORMA</h3>
                    <p className="text-[11px] text-orange-600 font-bold mt-1">#INV-2026-{selectedCompData.id.toUpperCase()}-09</p>
                    <p className="text-[10px] text-gray-500 mt-1">Data Emissão: 29/06/2026<br />Vencimento: 10/07/2026</p>
                  </div>
                </div>

                {/* Bill To & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold font-mono block uppercase">Tomador do Serviço (Cliente):</span>
                    <span className="font-bold text-gray-800 text-sm mt-0.5 block">{selectedCompData.name}</span>
                    <span className="text-gray-500 block mt-1">{selectedCompData.cnpj}</span>
                    <span className="text-gray-500 block mt-1 leading-normal">{selectedCompData.address}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border border-gray-100 font-mono text-[11px] space-y-1 text-gray-600">
                    <div><span className="text-gray-400 font-bold uppercase text-[9px] block">Indicadores de Cálculo:</span></div>
                    <div>• Assinatura ICP por quesito: <span className="font-bold text-gray-800">R$ 75,00</span></div>
                    <div>• Manutenção ativa por OS: <span className="font-bold text-gray-800">R$ 2.000,00</span></div>
                    <div>• Licenciamento Base Plataforma: <span className="font-bold text-gray-800">R$ 2.500,00</span></div>
                  </div>
                </div>

                {/* Active Items Table */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold font-mono uppercase block">Detalhamento das Rubricas:</span>
                  <div className="border border-gray-150 rounded overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-600 text-[11px]">
                          <th className="p-2 sm:p-3">Descrição da Rubrica de Serviço</th>
                          <th className="p-2 sm:p-3 text-center">Quant.</th>
                          <th className="p-2 sm:p-3 text-right">Preço Unit.</th>
                          <th className="p-2 sm:p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {/* Platform License */}
                        <tr>
                          <td className="p-2 sm:p-3">
                            <span className="font-bold block text-gray-800">Licenciamento de Software B2B - Piramidy Hub</span>
                            <span className="text-[10px] text-gray-400">Acesso multi-inquilino seguro com autenticação multifator empresarial e backups criptografados.</span>
                          </td>
                          <td className="p-2 sm:p-3 text-center font-mono">1</td>
                          <td className="p-2 sm:p-3 text-right font-mono">R$ 2.500,00</td>
                          <td className="p-2 sm:p-3 text-right font-mono font-bold text-gray-950">R$ 2.500,00</td>
                        </tr>

                        {/* Active OSs */}
                        {selectedCompData.osCount > 0 && (
                          <tr>
                            <td className="p-2 sm:p-3">
                              <span className="font-bold block text-gray-800">Gestão e Custódia de Ordens de Serviço (OS) Ativas</span>
                              <span className="text-[10px] text-gray-400">
                                Monitoramento técnico de {selectedCompData.osCount} OS: {selectedCompData.osList.map(o => o.os).join(', ')}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-center font-mono">{selectedCompData.osCount}</td>
                            <td className="p-2 sm:p-3 text-right font-mono">R$ 2.000,00</td>
                            <td className="p-2 sm:p-3 text-right font-mono font-bold text-gray-950">
                              R$ {(selectedCompData.osCount * 2000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}

                        {/* Certified Items */}
                        <tr>
                          <td className="p-2 sm:p-3">
                            <span className="font-bold block text-gray-800">Homologação de Quesitos Metrológicos e Assinaturas ICP</span>
                            <span className="text-[10px] text-gray-400">Processamento criptográfico e custódia legal de {selectedCompData.approvedItems} relatórios de metrologia validados com sucesso no período.</span>
                          </td>
                          <td className="p-2 sm:p-3 text-center font-mono">{selectedCompData.approvedItems}</td>
                          <td className="p-2 sm:p-3 text-right font-mono">R$ 75,00</td>
                          <td className="p-2 sm:p-3 text-right font-mono font-bold text-gray-950">
                            R$ {(selectedCompData.approvedItems * 75).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-2">
                  <div className="w-full sm:w-64 font-mono text-xs space-y-1.5 border-t border-gray-100 pt-3 text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal de Serviços:</span>
                      <span className="font-bold">R$ {selectedCompData.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Imposto Retido (ISS 5%):</span>
                      <span>R$ {selectedCompData.tax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-900 font-bold border-t border-gray-200 pt-2 bg-orange-50 p-2 rounded">
                      <span className="text-orange-800">VALOR TOTAL:</span>
                      <span className="text-orange-950">R$ {selectedCompData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* PIX Key / Billing QR code representation */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-150 flex flex-col sm:flex-row items-center gap-4 text-xs font-mono">
                  <div className="w-16 h-16 bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0 rounded select-none">
                    <div className="w-full h-full bg-slate-900 rounded flex flex-wrap p-1.5 relative">
                      <div className="w-3.5 h-3.5 bg-white absolute top-1 left-1" />
                      <div className="w-3.5 h-3.5 bg-white absolute top-1 right-1" />
                      <div className="w-3.5 h-3.5 bg-white absolute bottom-1 left-1" />
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[6px] text-teal-400 font-black">PIX</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-600 leading-relaxed text-[11px] text-left">
                    <span className="font-sans font-bold text-gray-800 uppercase text-[9px] block">Custo de Licenciamento & Faturamento:</span>
                    <p>Esta fatura pode ser liquidada via PIX institucional utilizando a chave CNPJ abaixo:</p>
                    <div className="flex items-center gap-2 mt-1 bg-white border border-gray-200 px-2.5 py-1 rounded w-fit text-gray-800 font-bold">
                      <span>45.109.812/0001-90</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText('45109812000190')}
                        className="text-[9px] text-orange-600 hover:text-orange-700 font-sans font-bold uppercase ml-2 bg-orange-50 px-1 py-0.5 rounded cursor-pointer"
                      >
                        Copiar Chave
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 text-center text-[10px] text-gray-400 italic">
                  * Fatura pro-forma para liquidação em conta institucional Piramidy S.A. protegida sob Termos de Licença de Software v2.26.
                </div>

              </div>

              {/* Status indicator / sent message */}
              {isInvoiceSent ? (
                <div className="p-3 bg-green-950/40 border border-green-500/30 rounded text-xs text-green-400 font-mono text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{language === 'PT' ? 'Fatura emitida e enviada com sucesso para o e-mail financeiro cadastrado!' : 'Invoice successfully emitted and sent to the registered financial email!'}</span>
                </div>
              ) : (
                <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded text-[11px] text-orange-500/80 font-mono text-left flex items-start gap-2 leading-relaxed">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                  <span>
                    {language === 'PT' 
                      ? 'Ao pressionar "Emitir e Enviar para Cliente", o sistema gerará a versão fiscal e enviará uma notificação para o e-mail cadastrado do cliente correspondente.' 
                      : 'By clicking "Emit and Send", the system compiles the formal tax invoice and notifies the registered customer via automated dispatch.'}
                  </span>
                </div>
              )}

            </div>

            {/* Modal actions */}
            <div className="bg-gray-950 px-6 py-4 border-t border-gray-850 flex justify-between items-center shrink-0">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-200 text-xs font-semibold rounded transition cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'PT' ? 'Imprimir Fatura' : 'Print Invoice'}</span>
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-semibold rounded transition cursor-pointer"
                >
                  {language === 'PT' ? 'Fechar' : 'Close'}
                </button>
                <button 
                  onClick={() => {
                    setIsInvoiceSent(true);
                    setTimeout(() => {
                      setIsInvoiceSent(false);
                      setIsInvoiceModalOpen(false);
                    }, 3500);
                  }}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold rounded transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/5"
                >
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>{language === 'PT' ? 'Emitir e Enviar para Cliente' : 'Emit & Dispatch Invoice'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
