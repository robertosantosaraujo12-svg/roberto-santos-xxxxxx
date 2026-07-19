import React, { useState } from 'react';
import { Language, Project, ChecklistStatus } from '../types';
import { CHANNELS_LANG } from '../data';
import { 
  BarChart4, Filter, RefreshCw, FileSpreadsheet, Download,
  ExternalLink, Calendar, HelpCircle, Layers, CheckSquare, Server,
  TrendingUp, AlertTriangle, CheckCircle2, Activity, Clock, ArrowRight,
  ShieldAlert, Info, HelpCircle as HelpIcon
} from 'lucide-react';

interface PowerBiViewProps {
  language: Language;
  projects: Project[];
}

export interface RncRecord {
  id: string;
  code: string;
  title: string;
  projectName: string;
  client: string;
  severity: 'CRITICAL' | 'MEDIUM' | 'LOW';
  dateOpened: string; // YYYY-MM-DD
  dateClosed?: string; // YYYY-MM-DD
  status: 'OPEN' | 'ACTION_PLAN' | 'RESOLVED';
  detector: string;
  actionPlan: string;
  sector: string;
}

const INITIAL_RNCS: RncRecord[] = [
  { id: 'rnc-1', code: 'RNC-26-001', title: 'Espessura de revestimento menor que nominal na junta J-12', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'CRITICAL', dateOpened: '2026-01-10', dateClosed: '2026-01-25', status: 'RESOLVED', actionPlan: 'Aplicação de sobrecamada de poliuretano e re-inspeção por ultrassom.', sector: 'Pintura / Revestimento', detector: 'Roberto Santos de Araujo' },
  { id: 'rnc-2', code: 'RNC-26-002', title: 'Desalinhamento máximo angular na flange de descarga duplex F-301', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'CRITICAL', dateOpened: '2026-01-18', dateClosed: '2026-01-30', status: 'RESOLVED', actionPlan: 'Remoção de solda, correção de gap utilizando mesa gabarito calibrada e nova soldagem.', sector: 'Caldeiraria', detector: 'Renato Mendes' },
  { id: 'rnc-3', code: 'RNC-26-003', title: 'Falta de fusão de raiz na solda circunferencial W3-01', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'CRITICAL', dateOpened: '2026-02-05', dateClosed: '2026-02-18', status: 'RESOLVED', actionPlan: 'Goivagem total da raiz de solda e ressoldagem com eletrodo celulósico.', sector: 'Soldagem / Metalurgia', detector: 'Roberto Santos de Araujo' },
  { id: 'rnc-4', code: 'RNC-26-004', title: 'Falta de certificado oficial de qualidade de lote de consumíveis', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'LOW', dateOpened: '2026-02-22', dateClosed: '2026-02-25', status: 'RESOLVED', actionPlan: 'Rastreamento eletrônico do fabricante e upload de certificado assinado digitalmente.', sector: 'Documentação / Trace', detector: 'Renato Mendes' },
  { id: 'rnc-5', code: 'RNC-26-005', title: 'Desvio dimensional no diâmetro externo do spool de bypass SP-14', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'MEDIUM', dateOpened: '2026-03-08', dateClosed: '2026-03-22', status: 'RESOLVED', actionPlan: 'Calibração mecânica de ovalização em torno e re-inspeção volumétrica.', sector: 'Caldeiraria', detector: 'Carlos Eduardo Nogueira' },
  { id: 'rnc-6', code: 'RNC-26-006', title: 'Porosidade identificada no teste radiográfico da junta J-020', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'CRITICAL', dateOpened: '2026-03-12', dateClosed: '2026-04-10', status: 'RESOLVED', actionPlan: 'Usinagem do ponto localizado de descontinuidade e preenchimento robotizado.', sector: 'Soldagem / Metalurgia', detector: 'Roberto Santos de Araujo' },
  { id: 'rnc-7', code: 'RNC-26-007', title: 'Trinca interfacial na junta de transição bimetálica T-105', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'CRITICAL', dateOpened: '2026-04-02', dateClosed: '2026-04-18', status: 'RESOLVED', actionPlan: 'Substituição integral do niple forjado de transição por lote certificado.', sector: 'Soldagem / Metalurgia', detector: 'Roberto Santos de Araujo' },
  { id: 'rnc-8', code: 'RNC-26-008', title: 'Desgaste prematuro da vedação de anel RTJ de alta pressão', projectName: 'Manutenção Preventiva de Motores e Vasos Submarinos', client: 'Subsea7', severity: 'MEDIUM', dateOpened: '2026-04-15', dateClosed: '2026-04-17', status: 'RESOLVED', actionPlan: 'Substituição por anel selante de elastômero fluorado viton e teste hidrostático.', sector: 'Estrutural / Mecânica', detector: 'Mário Silva' },
  { id: 'rnc-9', code: 'RNC-26-009', title: 'Falta de TAG físico de identificação em flange blindada da linha', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'LOW', dateOpened: '2026-04-20', dateClosed: '2026-05-02', status: 'RESOLVED', actionPlan: 'Cunhagem e instalação de plaqueta de aço inox AISI 316 rastreável.', sector: 'Documentação / Trace', detector: 'Renato Mendes' },
  { id: 'rnc-10', code: 'RNC-26-010', title: 'Vazamento residual no teste hidrostático do bloco acumulador', projectName: 'Manutenção Preventiva de Motores e Vasos Submarinos', client: 'Subsea7', severity: 'CRITICAL', dateOpened: '2026-05-02', dateClosed: '2026-05-18', status: 'RESOLVED', actionPlan: 'Aperto controlado com torquímetro digital calibrado e troca de gaxetas.', sector: 'Estrutural / Mecânica', detector: 'Mário Silva' },
  { id: 'rnc-11', code: 'RNC-26-011', title: 'Infiltração de umidade no conector de sinal umbilical externo', projectName: 'Manutenção Preventiva de Motores e Vasos Submarinos', client: 'Subsea7', severity: 'CRITICAL', dateOpened: '2026-05-12', dateClosed: undefined, status: 'ACTION_PLAN', actionPlan: 'Secagem termo-vácuo, teste de continuidade elétrica e injeção de resina hidrofóbica.', sector: 'Elétrica / Sinais', detector: 'Carlos Eduardo Nogueira' },
  { id: 'rnc-12', code: 'RNC-26-012', title: 'Trinca por fadiga térmica em suporte amortecedor de tubulação', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'CRITICAL', dateOpened: '2026-05-15', dateClosed: undefined, status: 'OPEN', actionPlan: 'Aguardando parecer final de engenharia estrutural para reforço local estruturado.', sector: 'Estrutural / Mecânica', detector: 'Roberto Santos de Araujo' },
  { id: 'rnc-13', code: 'RNC-26-013', title: 'Divergência de calibração do manômetro de teste padrão M-02', projectName: 'Manutenção Preventiva de Motores e Vasos Submarinos', client: 'Subsea7', severity: 'MEDIUM', dateOpened: '2026-05-20', dateClosed: '2026-05-24', status: 'RESOLVED', actionPlan: 'Substituição imediata por manômetro certificado RBC ativo e reteste de bancada.', sector: 'Instrumentações', detector: 'Mário Silva' },
  { id: 'rnc-14', code: 'RNC-26-014', title: 'Inconformidade técnica de dureza Brinell no metal de base J-10', projectName: 'Inspeção de Tubulação e Spools da Plataforma P-78', client: 'Petrobras S.A.', severity: 'CRITICAL', dateOpened: '2026-05-22', dateClosed: undefined, status: 'ACTION_PLAN', actionPlan: 'Tratamento térmico de alívio de tensões localizado e re-ensaio de dureza portátil.', sector: 'Soldagem / Metalurgia', detector: 'Renato Mendes' }
];

const rncLabels = {
  PT: {
    title: 'Painel Integrado RNC: Controle de Não Conformidades (ASME/ISO 9001)',
    subtitle: 'Acompanhamento cronológico de emissões, tratativas e ações corretivas em campo',
    cardTotal: 'RNCs Emitidas',
    cardOpen: 'Ações em Aberto',
    cardPlan: 'Planos de Ação',
    cardClosed: 'RNCs Concluídas',
    cardRate: 'Taxa de Solução',
    timeAvg: 'Tempo Médio Tratativa',
    days: 'dias',
    chartTitle: 'CRONOGRAMA DE ATIVIDADE & RESOLUÇÃO DE RNCs',
    chartDesc: 'Distribuição mensal de RNCs geradas x resolvidas com taxa acumulada de conformidade (Clique nas colunas para filtrar)',
    colOpened: 'Abertas no Mês',
    colResolved: 'Resolvidas no Mês',
    colRate: 'Taxa Acumulada',
    gridTitle: 'Registro de Ocorrências RNC',
    severity: 'Gravidade',
    detector: 'Detector/Inspetor',
    actionPlan: 'Plano de Ação Corretivo',
    sector: 'Setor Responsável',
    allMonths: 'Todos os Meses',
    monthFilterActive: 'Filtrado por: 2026-0',
    clearFilter: 'Limpar Filtro Temporal',
    noRecords: 'Nenhum registro correlacionado para os filtros aplicados neste período.'
  },
  EN: {
    title: 'Integrated NCR Dashboard: Non-Conformity Tracking (ASME/ISO 9001)',
    subtitle: 'Chronological lookup of field emissions, workarounds, and corrective action plans',
    cardTotal: 'NCRs Issued',
    cardOpen: 'Active Open NCRs',
    cardPlan: 'Action Projects',
    cardClosed: 'Corrected Closed NCRs',
    cardRate: 'Resolution Ratio',
    timeAvg: 'Mean Resolution Time',
    days: 'days',
    chartTitle: 'NCR ACTIVITY & RESOLUTION CHRONOLOGY',
    chartDesc: 'Monthly distribution of generated vs resolved NCRs with cumulative resolution rate (Click bars to slice)',
    colOpened: 'Opened in Month',
    colResolved: 'Resolved in Month',
    colRate: 'Cumulative Ratio',
    gridTitle: 'Audited NCR Registered Logs',
    severity: 'Severity',
    detector: 'Reporting Inspector',
    actionPlan: 'Corrective Action Plan',
    sector: 'Responsible Sector',
    allMonths: 'All Months',
    monthFilterActive: 'Filtered as: 2026-0',
    clearFilter: 'Clear Timeline Focus',
    noRecords: 'No conforming event files linked or matched with active filters.'
  },
  ES: {
    title: 'Tablero Integrado RNC: Control de No Conformidades (ASME/ISO 9001)',
    subtitle: 'Seguimiento cronológico de emisiones de campo, remediaciones y planes de acción',
    cardTotal: 'RNCs Emitidas',
    cardOpen: 'Acciones Abiertas',
    cardPlan: 'Planes de Acción',
    cardClosed: 'RNCs Concluidas',
    cardRate: 'Tasa de Solución',
    timeAvg: 'Tiempo Promedio de Solución',
    days: 'días',
    chartTitle: 'CRONOGRAMA DE ACTIVIDADES Y RESOLUCIÓN DE RNCs',
    chartDesc: 'Distribución mensual de RNCs creadas vs resueltas con tasa acumulada de conformidad (Clic para filtrar)',
    colOpened: 'Abiertas en el Mes',
    colResolved: 'Resueltas en el Mes',
    colRate: 'Tasa Acumulada',
    gridTitle: 'Registro de Incidentes RNC',
    severity: 'Severidad',
    detector: 'Inspector Emisor',
    actionPlan: 'Plan de Acción Correctivo',
    sector: 'Sector Responsable',
    allMonths: 'Todos los Meses',
    monthFilterActive: 'Filtrado por: 2026-0',
    clearFilter: 'Limpiar Filtro de Tiempo',
    noRecords: 'No se encontraron registros que coincidan con los filtros activos.'
  }
};

export default function PowerBiView({
  language,
  projects
}: PowerBiViewProps) {
  const t = CHANNELS_LANG[language];
  
  // Power BI active tab simulation
  const [activeTab, setActiveTab] = useState<'kpi' | 'welds' | 'failures'>('kpi');
  
  // Power BI Filters State
  const [clientFilter, setClientFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected interactive month filter in RNC tab (1 to 6)
  const [selectedMonthNum, setSelectedMonthNum] = useState<number | null>(null);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [expandedRncId, setExpandedRncId] = useState<string | null>(null);

  // Filter datasets
  const filteredChecklistItems = projects.flatMap(proj => {
    // Check project filters
    const matchesClient = clientFilter === 'ALL' || proj.client === clientFilter;
    const matchesCategory = categoryFilter === 'ALL' || proj.category === categoryFilter;
    
    if (!matchesClient || !matchesCategory) return [];

    return proj.checklist.flatMap(item => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      if (!matchesStatus) return [];
      return [{ ...item, projectName: proj.name, client: proj.client }];
    });
  });

  // Calculate metrics
  const totalInvoicedList = filteredChecklistItems.length;
  const approvedTotal = filteredChecklistItems.filter(i => i.status === ChecklistStatus.APPROVED).length;
  const rejectedTotal = filteredChecklistItems.filter(i => i.status === ChecklistStatus.REJECTED).length;
  const reviewTotal = filteredChecklistItems.filter(i => i.status === ChecklistStatus.ANALYSIS).length;
  const pendingTotal = filteredChecklistItems.filter(i => i.status === ChecklistStatus.PENDING).length;

  const qualityScorePct = totalInvoicedList > 0 
    ? Math.round((approvedTotal / totalInvoicedList) * 100) 
    : 100;

  // Export to CSV simulation
  const handleExportCSV = () => {
    const headers = 'Código,Item de Qualidade,Status,Projeto,Cliente\n';
    const rows = filteredChecklistItems.slice(0, 15).map(item => 
      `"${item.code}","${item.titlePt}","${item.status}","${item.projectName}","${item.client}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PYRAMID_PowerBI_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Power BI header bar */}
      <section className="bg-[#1f1f1f] text-white p-4 border border-[#303030] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          {/* Logo sign */}
          <div className="w-8 h-8 bg-cyan-400 rounded-sm flex items-center justify-center shadow-lg font-bold text-black font-mono">
            BI
          </div>
          <div>
            <h2 className="text-[#f2c811] text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              POWER BI EMBEDDED CONNECTOR
              <span className="text-[9px] bg-cyan-650 bg-green-500 font-mono text-black px-1.5 py-0.2 rounded font-normal">
                {t.powerBiLive}
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">{t.powerBiSub}</p>
          </div>
        </div>

        <div className="flex gap-2 text-xs font-mono">
          <button 
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[#252526] hover:bg-[#2d2d2e] text-[#f2c811] border border-[#f2c811]/40 rounded flex items-center gap-1 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#f2c811]" />
            <span>Export to Excel (.csv)</span>
          </button>
          
          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#f2c811] hover:bg-cyan-500 text-black rounded font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Capture BI PDF</span>
          </button>
        </div>
      </section>

      {/* FILTER CONTROLS SIDEBAR SHEETS */}
      <section className="bg-gray-900/40 p-4 border border-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="text-xs font-bold text-gray-300 font-mono flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-[#f2c811]" />
          <span>Filtros do Dashboard BI:</span>
        </div>

        {/* Client filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-mono">Contratante / Cliente</label>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full bg-[#111827] border border-gray-750 text-xs text-white p-1 rounded font-mono"
          >
            <option value="ALL">Todo Portfólio</option>
            {Array.from(new Set(projects.map(p => p.client))).map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>

        {/* Project category filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-mono">Categoria de Escopo</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#111827] border border-gray-750 text-xs text-white p-1 rounded font-mono"
          >
            <option value="ALL">Todas as Áreas</option>
            <option value="Inspeção e Qualidade">Inspeção</option>
            <option value="Manutenção Técnica">Manutenção</option>
          </select>
        </div>

        {/* Status indicator filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-mono">Conformidade Final</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#111827] border border-gray-750 text-xs text-white p-1 rounded font-mono"
          >
            <option value="ALL">Todos os Registros</option>
            <option value={ChecklistStatus.APPROVED}>Aprovados</option>
            <option value={ChecklistStatus.ANALYSIS}>Em Análise</option>
            <option value={ChecklistStatus.REJECTED}>Reprovados</option>
            <option value={ChecklistStatus.PENDING}>Pendente</option>
          </select>
        </div>
      </section>

      {/* RENDERED POWER BI REPORT FRAME SCREEN */}
      <section className="bg-[#1e1e1e] border-4 border-[#2d2d2d] rounded-xl p-5 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Top title inside report iframe */}
        <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-3 text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1 text-[#f2c811]">
            <Server className="w-3.5 h-3.5 text-[#f2c811]" />
            SERVER INSTANCE: US_EAST1_CLOUDRUN
          </span>
          <span>POWER BI DESKTOP INTERATIVE INTERFACE (V2.26)</span>
        </div>

        {/* Dynamic BI page tabs */}
        <div className="flex gap-2">
          {[
            { id: 'kpi', label: '1. Ficha Geral (KPIs)' },
            { id: 'welds', label: '2. Mapa de Soldas / Ensaios' },
            { id: 'failures', label: '3. Mapa RNC / Histórico' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                // Reset temporal filter on tab change
                setSelectedMonthNum(null);
                setExpandedRncId(null);
              }}
              className={`px-3 py-1 text-xs font-mono font-bold transition rounded-t-md cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#121212] text-[#f2c811] border-t border-r border-l border-[#f2c811]/40'
                  : 'text-gray-400 hover:text-white bg-[#252526]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* REPLICATING POWER BI CANVAS FOR EACH SELECTED TAB */}
        <div className="bg-[#121212] border border-[#2d2d2d] p-6 rounded-b-xl rounded-r-xl space-y-6 relative">
          
          {/* Main KPI panel */}
          {activeTab === 'kpi' && (
            <div className="space-y-6">
              
              {/* Power BI Card Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                
                {/* Total checklist inspected items */}
                <div className="bg-[#1e1e1e] border-l-4 border-cyan-500 p-4">
                  <span className="text-[10px] text-gray-500 uppercase font-bold text-center block">Total Docs Auditorados</span>
                  <span className="text-3xl font-extrabold text-[#f3f4f6] text-center block mt-1">{totalInvoicedList}</span>
                  <p className="text-[9px] text-gray-500 text-center mt-1">Checklist completo compilados</p>
                </div>

                {/* Approved documents */}
                <div className="bg-[#1e1e1e] border-l-4 border-green-500 p-4">
                  <span className="text-[10px] text-gray-500 uppercase font-bold text-center block">Suficiência Aprovada</span>
                  <span className="text-3xl font-extrabold text-green-400 text-center block mt-1">{approvedTotal}</span>
                  <p className="text-[9px] text-green-500/80 text-center mt-1">({qualityScorePct}% de aprovação)</p>
                </div>

                {/* Under Review */}
                <div className="bg-[#1e1e1e] border-l-4 border-cyan-400 p-4">
                  <span className="text-[10px] text-gray-500 uppercase font-bold text-center block">Qualificação Técnica</span>
                  <span className="text-3xl font-extrabold text-cyan-400 text-center block mt-1">{reviewTotal}</span>
                  <p className="text-[9px] text-cyan-550 text-center mt-1">Aguardando auditoria</p>
                </div>

                {/* Rejected RNC tags */}
                <div className="bg-[#1e1e1e] border-l-4 border-[#ef4444] p-4">
                  <span className="text-[10px] text-[#ef4444] uppercase font-bold text-center block">Alertas Críticos / RNC</span>
                  <span className="text-3xl font-extrabold text-[#ef4444] text-center block mt-1">{rejectedTotal}</span>
                  <p className="text-[9px] text-cyan-500 mt-1">Inconformidades operacionais</p>
                </div>

              </div>

              {/* Graphical distribution in Power BI style (High-density pure horizontal SVG bars) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual bar chart for categories distribution */}
                <div className="bg-[#1e1e1e] p-4 rounded border border-[#2d2d2d] space-y-3">
                  <h4 className="text-xs font-bold font-mono text-gray-300">ESTATÍSTICAS DA CARTEIRA BI - CATEGORIAS DOS ITENS</h4>
                  
                  <div className="space-y-3 pt-2 text-xs font-mono">
                    
                    {/* Capa */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>1. Capa preliminar</span>
                        <span className="text-gray-400">100% aprovado</span>
                      </div>
                      <div className="h-3 w-full bg-[#121212] overflow-hidden rounded">
                        <div className="h-full bg-cyan-400" style={{ width: '100%' }} />
                      </div>
                    </div>

                    {/* Contra Capa */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>2. Contra capa geral</span>
                        <span className="text-gray-400">80% aprovado</span>
                      </div>
                      <div className="h-3 w-full bg-[#121212] overflow-hidden rounded">
                        <div className="h-full bg-cyan-400" style={{ width: '80%' }} />
                      </div>
                    </div>

                    {/* Sumário */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>3. Sumário e relatórios</span>
                        <span className="text-gray-400">{qualityScorePct}% aprovado</span>
                      </div>
                      <div className="h-3 w-full bg-[#121212] overflow-hidden rounded">
                        <div className="h-full bg-cyan-400" style={{ width: `${qualityScorePct}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Metrology verification indicators (gauges) */}
                <div className="bg-[#1e1e1e] p-4 rounded border border-[#2d2d2d] flex flex-col justify-between">
                  <h4 className="text-xs font-bold font-mono text-gray-300">EFICÁCIA DE CONTROLE DE QUALIDADE</h4>
                  
                  <div className="flex items-center justify-around py-2">
                    <div className="text-center font-mono">
                      <div className="w-16 h-16 rounded-full border-4 border-[#303030] border-t-cyan-400 flex items-center justify-center font-extrabold text-sm">
                        94%
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-2">Dureza de Solda</span>
                    </div>

                    <div className="text-center font-mono">
                      <div className="w-16 h-16 rounded-full border-4 border-[#303030] border-t-green-400 flex items-center justify-center font-extrabold text-sm">
                        98%
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-2">Ensaios Termo</span>
                    </div>

                    <div className="text-center font-mono">
                      <div className="w-16 h-16 rounded-full border-4 border-[#303030] border-t-cyan-400 flex items-center justify-center font-extrabold text-sm">
                        100%
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-2">Instrumentações</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 font-mono text-center">
                    * Calibrações monitoradas e em conformidade técnica de acordo com normas ASME
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Interactive Welds and Joints mapping */}
          {activeTab === 'welds' && (
            <div className="space-y-6">
              {/* KPIs for welding */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-center">
                <div className="bg-[#1e1e1e] p-3 border-l-4 border-cyan-500 rounded">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Juntas Globais</span>
                  <span className="text-2xl font-black text-white block mt-1">248</span>
                  <p className="text-[8px] text-gray-500 mt-0.5">Mapeado via Isométricos</p>
                </div>
                <div className="bg-[#1e1e1e] p-3 border-l-4 border-green-500 rounded">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Ensaiadas (NDT)</span>
                  <span className="text-2xl font-black text-green-400 block mt-1">212</span>
                  <p className="text-[8px] text-green-500 mt-0.5">Efetuado Ultrassom/LP</p>
                </div>
                <div className="bg-[#1e1e1e] p-3 border-l-4 border-cyan-400 rounded">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Taxa de Reparo</span>
                  <span className="text-2xl font-black text-cyan-400 block mt-1">6.4%</span>
                  <p className="text-[8px] text-cyan-500 mt-0.5">Abaixo do Limite Aceitável</p>
                </div>
                <div className="bg-[#1e1e1e] p-3 border-l-4 border-emerald-500 rounded">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Rastreabilidade</span>
                  <span className="text-2xl font-black text-emerald-400 block mt-1">100%</span>
                  <p className="text-[8px] text-emerald-500 mt-0.5">Integrado com Assinatura CREA</p>
                </div>
              </div>

              {/* Weld NDT Inspection matrix representation */}
              <div className="bg-[#1e1e1e] p-5 rounded border border-[#2d2d2d] space-y-4">
                <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">
                    Matriz Geral de Soldabilidade & Ensaios Geométricos
                  </h4>
                  <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 r_rounded font-mono border border-green-500/20">
                    SISTEMA ATIVO - 100% CONFORME
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 font-sans">
                  Visualização em "Tile Grid" representando os spools e juntas registradas em campo. Vermelho indica RNC pendente de encerramento corretivo.
                </p>

                {/* Grid layout of 24 weld spool indicators */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                  {Array.from({ length: 24 }).map((_, idx) => {
                    const statusNumber = (idx * 7) % 10;
                    const isRejected = idx === 11 || idx === 13; // Highlight real simulated RNC spots
                    const isMuted = idx > 18; // Not inspected yet
                    return (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-lg border flex flex-col items-center justify-between font-mono text-center transition ${
                          isRejected ? 'bg-cyan-950/20 border-cyan-500/60 hover:bg-cyan-950/30 text-cyan-400' :
                          isMuted ? 'bg-[#151515] border-[#252526] hover:bg-[#1a1a1b] text-gray-600' :
                          'bg-emerald-950/10 border-emerald-500/50 hover:bg-emerald-950/20 text-emerald-400'
                        }`}
                        title={isRejected ? `Spool SP-${100 + idx} - Junta soldada Reprovada (RNC ativa)` : `Spool SP-${100 + idx} - Soldabilidade Conforme`}
                      >
                        <span className="text-[9px] text-gray-500 block">SP-{100 + idx}</span>
                        <span className="text-xs font-black block mt-1">W-{idx + 1}</span>
                        <div className={`w-2.5 h-2.5 rounded-full mt-2 ${
                          isRejected ? 'bg-cyan-500 animate-pulse' :
                          isMuted ? 'bg-gray-700' : 'bg-green-500'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ADDED FAILURES SECTION: CONTROL MAP OF NCRs (RNCs) WITH ACCURACY TIMELINE CHART */}
          {activeTab === 'failures' && (() => {
            const R = rncLabels[language] || rncLabels.PT;

            // Map static INITIAL_RNCS dynamically to match actual projects in the system
            const dynamicRncs = INITIAL_RNCS.map((rnc, index) => {
              if (projects.length > 0) {
                const proj = projects[index % projects.length];
                return {
                  ...rnc,
                  projectName: proj.name,
                  client: proj.client
                };
              }
              return rnc;
            });

            // Compute filtered list based on active Power BI dashboard sidebar filters
            const filteredRncs = dynamicRncs.filter(rnc => {
              const matchesClient = clientFilter === 'ALL' || rnc.client === clientFilter;
              
              let matchesStatus = true;
              if (statusFilter !== 'ALL') {
                if (statusFilter === ChecklistStatus.APPROVED) {
                  matchesStatus = rnc.status === 'RESOLVED';
                } else if (statusFilter === ChecklistStatus.ANALYSIS) {
                  matchesStatus = rnc.status === 'ACTION_PLAN';
                } else if (statusFilter === ChecklistStatus.REJECTED) {
                  matchesStatus = rnc.status === 'OPEN';
                } else if (statusFilter === ChecklistStatus.PENDING) {
                  matchesStatus = false;
                }
              }
              return matchesClient && matchesStatus;
            });

            // Timeline Calculation spanning 6 months (Jan to Jun 2026)
            const monthData = [
              { monthNum: 1, namePt: 'Jan', nameEn: 'Jan', nameEs: 'Ene' },
              { monthNum: 2, namePt: 'Fev', nameEn: 'Feb', nameEs: 'Feb' },
              { monthNum: 3, namePt: 'Mar', nameEn: 'Mar', nameEs: 'Mar' },
              { monthNum: 4, namePt: 'Abr', nameEn: 'Apr', nameEs: 'Abr' },
              { monthNum: 5, namePt: 'Mai', nameEn: 'May', nameEs: 'May' },
              { monthNum: 6, namePt: 'Jun', nameEn: 'Jun', nameEs: 'Jun' }
            ];

            const timelineData = monthData.map((m) => {
              const opened = filteredRncs.filter(r => r.dateOpened.startsWith(`2026-0${m.monthNum}`)).length;
              const resolved = filteredRncs.filter(r => r.dateClosed && r.dateClosed.startsWith(`2026-0${m.monthNum}`)).length;
              return {
                ...m,
                opened,
                resolved,
                name: language === 'PT' ? m.namePt : language === 'ES' ? m.nameEs : m.nameEn
              };
            });

            // Calculate Cumulative Rates
            let cumulativeOpened = 0;
            let cumulativeResolved = 0;
            const timelineWithRates = timelineData.map(m => {
              cumulativeOpened += m.opened;
              cumulativeResolved += m.resolved;
              const rate = cumulativeOpened > 0 ? Math.round((cumulativeResolved / cumulativeOpened) * 100) : 100;
              return {
                ...m,
                cumulativeOpened,
                cumulativeResolved,
                rate
              };
            });

            // Slicing dataset by selectedMonthNum if clicked
            const displayedRncs = selectedMonthNum
              ? filteredRncs.filter(r => r.dateOpened.startsWith(`2026-0${selectedMonthNum}`))
              : filteredRncs;

            const totalIssued = filteredRncs.length;
            const openCount = filteredRncs.filter(r => r.status === 'OPEN').length;
            const planCount = filteredRncs.filter(r => r.status === 'ACTION_PLAN').length;
            const resolvedCount = filteredRncs.filter(r => r.status === 'RESOLVED').length;
            const overallRate = totalIssued > 0 ? Math.round((resolvedCount / totalIssued) * 100) : 100;

            // Avg resolution cycle duration calculation from dates
            const closedWithDates = filteredRncs.filter(r => r.status === 'RESOLVED' && r.dateClosed);
            let averageLeadTime = 6.4; // standard fallback
            if (closedWithDates.length > 0) {
              const sumDays = closedWithDates.reduce((tot, r) => {
                const diffTime = Math.abs(new Date(r.dateClosed!).getTime() - new Date(r.dateOpened).getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return tot + diffDays;
              }, 0);
              averageLeadTime = Number((sumDays / closedWithDates.length).toFixed(1));
            }

            // SVG viewport setup and responsive scaling ratios
            const svgWidth = 500;
            const svgHeight = 200;
            const margin = { top: 20, right: 40, bottom: 30, left: 35 };
            const chartW = svgWidth - margin.left - margin.right;
            const chartH = svgHeight - margin.top - margin.bottom;

            // Generate dynamic Left Y-axis limit
            const maxOpenedResolvedInMonth = Math.max(1, ...timelineWithRates.map(m => Math.max(m.opened, m.resolved)));
            const yAxisLimit = Math.max(6, Math.ceil(maxOpenedResolvedInMonth / 2) * 2);

            // Helpers for coordinate mapping
            const getX = (index: number) => margin.left + (index * (chartW / 5));
            const getYCount = (count: number) => (margin.top + chartH) - (count * (chartH / yAxisLimit));
            const getYPercent = (pct: number) => (margin.top + chartH) - (pct * (chartH / 100));

            return (
              <div className="space-y-6">
                
                {/* RNC Card Metric Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-center">
                  <div className="bg-[#1e1e1e] p-3 border-l-4 border-cyan-500 rounded">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">{R.cardTotal}</span>
                    <span className="text-xl font-extrabold text-gray-100 block mt-0.5">{totalIssued}</span>
                    <span className="text-[8px] text-gray-500">Volumétrico Absoluto</span>
                  </div>
                  <div className="bg-[#1e1e1e] p-3 border-l-4 border-cyan-500 rounded">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">{R.cardOpen}</span>
                    <span className="text-xl font-extrabold text-cyan-400 block mt-0.5">{openCount}</span>
                    <span className="text-[8px] text-cyan-500/80">Críticas Sem Solução</span>
                  </div>
                  <div className="bg-[#1e1e1e] p-3 border-l-4 border-cyan-500 rounded font-mono">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">{R.cardPlan}</span>
                    <span className="text-xl font-extrabold text-cyan-500 block mt-0.5">{planCount}</span>
                    <span className="text-[8px] text-cyan-400/80">Mitigação em Curso</span>
                  </div>
                  <div className="bg-[#1e1e1e] p-3 border-l-4 border-green-500 rounded font-mono">
                    <span className="text-[9px] text-gray-400 block uppercase font-bold">{R.cardClosed}</span>
                    <span className="text-xl font-extrabold text-green-400 block mt-0.5">{resolvedCount}</span>
                    <span className="text-[8px] text-green-500/80">Sanadas & Homologadas</span>
                  </div>
                  <div className="bg-[#1e1e1e] p-3 border-l-4 border-cyan-400 rounded font-mono col-span-2 md:col-span-1">
                    <span className="text-[9px] text-gray-400 block uppercase font-bold">{R.timeAvg}</span>
                    <span className="text-xl font-extrabold text-cyan-400 block mt-0.5">
                      {averageLeadTime} <span className="text-[10px] text-gray-500 font-normal">{R.days}</span>
                    </span>
                    <span className="text-[8px] text-cyan-500/80">Lead Time de Reparo</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  {/* Timeline Combo Chart Grid Area (Cols: 3) */}
                  <div className="bg-[#1e1e1e] p-4 rounded border border-[#2d2d2d] space-y-3 lg:col-span-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold font-mono text-gray-300 flex items-center gap-1.5 uppercase">
                            <Activity className="w-4 h-4 text-[#f2c811]" />
                            {R.chartTitle}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5 leading-tight">{R.chartDesc}</p>
                        </div>
                        {selectedMonthNum && (
                          <button
                            onClick={() => setSelectedMonthNum(null)}
                            className="px-2 py-1 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-400 text-[10px] font-mono border border-cyan-500/30 rounded flex items-center gap-1 transition"
                          >
                            <span>✕</span>
                            <span>{R.clearFilter}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chart Container SVG */}
                    <div className="relative pt-2">
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
                        <defs>
                          <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.85" />
                          </linearGradient>
                          <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#065f46" stopOpacity="0.85" />
                          </linearGradient>
                          <linearGradient id="hoverOverlay" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#303030" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#303030" stopOpacity="0.3" />
                          </linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Guidelines */}
                        {[0, 1, 2, 3, 4].map((gridIdx) => {
                          const tickVal = Math.round((yAxisLimit / 4) * gridIdx);
                          const yY = getYCount(tickVal);
                          return (
                            <g key={gridIdx} className="opacity-45">
                              <line 
                                x1={margin.left} 
                                y1={yY} 
                                x2={svgWidth - margin.right} 
                                y2={yY} 
                                stroke="#2a2a2b" 
                                strokeWidth="0.8" 
                                strokeDasharray="3 3" 
                              />
                              {/* Left ticks */}
                              <text 
                                x={margin.left - 6} 
                                y={yY + 3.5} 
                                fill="#88888b" 
                                fontSize="9" 
                                className="font-mono text-right" 
                                textAnchor="end"
                              >
                                {tickIdx => tickVal}
                              </text>
                            </g>
                          );
                        })}

                        {/* Right Rate Percent ticks */}
                        {[0, 50, 100].map((pct) => {
                          const yP = getYPercent(pct);
                          return (
                            <text 
                              key={pct} 
                              x={svgWidth - margin.right + 6} 
                              y={yP + 3.5} 
                              fill="#f2c811" 
                              fontSize="9" 
                              className="font-mono" 
                              textAnchor="start"
                            >
                              {pct}%
                            </text>
                          );
                        })}

                        {/* Interactive columns & Hover columns highlights */}
                        {timelineWithRates.map((m, mIdx) => {
                          const xCenter = getX(mIdx);
                          const isHovered = hoveredMonthIndex === mIdx;
                          const isSelected = selectedMonthNum === m.monthNum;

                          // Bar offsets
                          const barWidth = 14;
                          const xOpened = xCenter - 16;
                          const xResolved = xCenter + 2;

                          const yOpened = getYCount(m.opened);
                          const hOpened = Math.max(2, (margin.top + chartH) - yOpened);

                          const yResolved = getYCount(m.resolved);
                          const hResolved = Math.max(2, (margin.top + chartH) - yResolved);

                          return (
                            <g key={m.monthNum}>
                              {/* Background column highlight on hover */}
                              {(isHovered || isSelected) && (
                                <rect
                                  x={xCenter - 28}
                                  y={margin.top}
                                  width="56"
                                  height={chartH}
                                  fill="url(#hoverOverlay)"
                                  stroke={isSelected ? "#f2c811" : "#444"}
                                  strokeWidth={isSelected ? 1.2 : 0.8}
                                  strokeDasharray={isSelected ? "none" : "2 2"}
                                  rx="4"
                                  opacity="0.9"
                                />
                              )}

                              {/* Opened RNC Bar (Cyan) */}
                              {m.opened > 0 && (
                                <rect
                                  x={xOpened}
                                  y={yOpened}
                                  width={barWidth}
                                  height={hOpened}
                                  fill="url(#openedGradient)"
                                  rx="2"
                                  className="transition-all duration-300"
                                />
                              )}

                              {/* Resolved RNC Bar (Green) */}
                              {m.resolved > 0 && (
                                <rect
                                  x={xResolved}
                                  y={yResolved}
                                  width={barWidth}
                                  height={hResolved}
                                  fill="url(#resolvedGradient)"
                                  rx="2"
                                  className="transition-all duration-300"
                                />
                              )}

                              {/* Invisible Trigger Region to enable generous touch target clicking */}
                              <rect
                                x={xCenter - 34}
                                y={margin.top - 5}
                                width="68"
                                height={chartH + 15}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredMonthIndex(mIdx)}
                                onMouseLeave={() => setHoveredMonthIndex(null)}
                                onClick={() => setSelectedMonthNum(m.monthNum === selectedMonthNum ? null : m.monthNum)}
                              />
                            </g>
                          );
                        })}

                        {/* Overlay Rate Trend Line (Power BI secondary axis line with glowing nodes) */}
                        <g>
                          {/* Polyline Path */}
                          {(() => {
                            const pointsStr = timelineWithRates
                              .map((m, mIdx) => `${getX(mIdx)},${getYPercent(m.rate)}`)
                              .join(' ');
                            return (
                              <polyline
                                points={pointsStr}
                                fill="none"
                                stroke="#f2c811"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glow)"
                              />
                            );
                          })()}

                          {/* Dots at vertices */}
                          {timelineWithRates.map((m, mIdx) => {
                            const xCenter = getX(mIdx);
                            const yP = getYPercent(m.rate);
                            const isSelected = selectedMonthNum === m.monthNum;
                            return (
                              <g key={m.monthNum} className="pointer-events-none">
                                <circle
                                  cx={xCenter}
                                  cy={yP}
                                  r={isSelected ? "7" : "4.5"}
                                  fill="#121212"
                                  stroke="#f2c811"
                                  strokeWidth={isSelected ? "3" : "2.2"}
                                />
                                {isSelected && (
                                  <circle
                                    cx={xCenter}
                                    cy={yP}
                                    r="11"
                                    fill="none"
                                    stroke="#f2c811"
                                    strokeWidth="1"
                                    className="animate-ping"
                                    opacity="0.7"
                                  />
                                )}
                              </g>
                            );
                          })}
                        </g>

                        {/* X-Axis labels */}
                        {timelineWithRates.map((m, mIdx) => {
                          const xCenter = getX(mIdx);
                          const isSelected = selectedMonthNum === m.monthNum;
                          return (
                            <text
                              key={m.monthNum}
                              cx={xCenter}
                              x={xCenter}
                              y={margin.top + chartH + 16}
                              fill={isSelected ? "#f2c811" : "#a1a1aa"}
                              fontSize="10"
                              className="font-mono text-center font-bold"
                              textAnchor="middle"
                            >
                              {m.name}
                            </text>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex flex-wrap justify-between items-center text-[10px] font-mono text-gray-400 border-t border-[#2a2a2b] pt-2 mt-1">
                      <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-cyan-600 rounded-sm" />
                          {R.colOpened}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" />
                          {R.colResolved}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-0.5 bg-[#f2c811] inline-block" />
                          {R.colRate} (%)
                        </span>
                      </div>
                      
                      <div className="text-[9px] text-[#f2c811] uppercase tracking-wider flex items-center gap-1 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-500/10">
                        <TrendingUp className="w-3 h-3 text-[#f2c811]" />
                        <span>Max {yAxisLimit} NCRs / Eixo Secundário</span>
                      </div>
                    </div>

                    {/* Hover Floating Tooltip HUD inside SVG parent container */}
                    {hoveredMonthIndex !== null && (() => {
                      const m = timelineWithRates[hoveredMonthIndex];
                      return (
                        <div 
                          className="absolute pointer-events-none bg-black/95 border-2 border-[#f2c811]/60 p-2.5 rounded shadow-2xl font-mono text-[10px] left-1/4 translate-x-12 top-10 flex flex-col gap-1 z-20 w-44"
                          style={{
                            boxShadow: '0 0 15px rgba(242,200,17,0.15)'
                          }}
                        >
                          <p className="font-extrabold text-[#f3f4f6] uppercase border-b border-gray-800 pb-1 mb-1">
                            {language === 'PT' ? 'Mês' : language === 'ES' ? 'Mes' : 'Month'}: {m.name} 2026
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">{R.colOpened}:</span>
                            <span className="text-cyan-400 font-bold">{m.opened}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-400">{R.colResolved}:</span>
                            <span className="text-green-400 font-bold">{m.resolved}</span>
                          </p>
                          <p className="flex justify-between font-extrabold border-t border-gray-850 pt-1 mt-0.5">
                            <span className="text-[#f2c811]">{R.colRate}:</span>
                            <span className="text-[#f2c811]">{m.rate}%</span>
                          </p>
                        </div>
                      );
                    })()}

                  </div>

                  {/* Registered RNC checklist logs (Cols: 2) */}
                  <div className="bg-[#1e1e1e] p-4 rounded border border-[#2d2d2d] flex flex-col justify-between lg:col-span-2">
                    <div>
                      <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-2 mb-3">
                        <h4 className="text-xs font-bold font-mono text-gray-300 flex items-center gap-1.5 uppercase">
                          <ShieldAlert className="w-4 h-4 text-cyan-500" />
                          {R.gridTitle}
                        </h4>
                        
                        <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-bold border border-cyan-500/20">
                          {selectedMonthNum ? `Jan - Jun` : `All Portfolio`}
                        </span>
                      </div>

                      {/* Filter state indicator bar */}
                      {selectedMonthNum && (
                        <div className="p-1.5 bg-[#f2c811]/10 text-[#f2c811] border border-[#f2c811]/30 font-mono text-[9px] rounded-md flex justify-between items-center mb-2.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{R.monthFilterActive}{selectedMonthNum}</span>
                          </span>
                          <button 
                            onClick={() => setSelectedMonthNum(null)} 
                            className="font-bold hover:text-white cursor-pointer px-1 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Map rows list */}
                      <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-thin pr-1 pb-1">
                        {displayedRncs.length === 0 ? (
                          <div className="p-6 bg-[#121212] rounded border border-gray-850 text-center italic text-gray-500 text-[10.5px]">
                            {R.noRecords}
                          </div>
                        ) : (
                          displayedRncs.map((r) => {
                            const isExpanded = expandedRncId === r.id;
                            const isCritical = r.severity === 'CRITICAL';
                            const isMedium = r.severity === 'MEDIUM';
                            
                            return (
                              <article 
                                key={r.id} 
                                className={`border rounded transition-all cursor-pointer ${
                                  isExpanded 
                                    ? 'bg-[#121212] border-[#f2c811]/50' 
                                    : 'bg-[#151515] border-gray-850 hover:bg-[#1a1a1a]'
                                }`}
                                onClick={() => setExpandedRncId(isExpanded ? null : r.id)}
                              >
                                {/* Header Summary line */}
                                <div className="p-2.5 text-[10.5px] flex items-start gap-2 justify-between">
                                  <div className="space-y-0.5 truncate max-w-[210px] sm:max-w-xs">
                                    <h5 className="font-extrabold text-white flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${
                                        r.status === 'RESOLVED' ? 'bg-green-500' :
                                        r.status === 'ACTION_PLAN' ? 'bg-cyan-500' : 'bg-cyan-500 animate-pulse'
                                      }`} />
                                      <span className="text-cyan-500">{r.code}</span>
                                      <span className="text-[8px] bg-gray-800 text-gray-300 px-1 py-0.2 rounded shrink-0">
                                        {r.sector.split(' ')[0]}
                                      </span>
                                    </h5>
                                    <p className="text-gray-400 font-sans truncate text-[10px] mt-0.5">{r.title}</p>
                                  </div>

                                  <div className="text-right shrink-0 font-mono text-[9px] space-y-1">
                                    {/* Severity pill */}
                                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                                      isCritical ? 'bg-cyan-950/20 text-cyan-400 border border-cyan-500/20' :
                                      isMedium ? 'bg-cyan-950/20 text-cyan-400 border border-cyan-500/20' :
                                      'bg-gray-800 text-gray-400'
                                    }`}>
                                      {r.severity}
                                    </span>
                                    <span className="block text-[8px] text-gray-500 mt-1">{r.dateOpened}</span>
                                  </div>
                                </div>

                                {/* Detailed expanded action plan body */}
                                {isExpanded && (
                                  <div className="px-2.5 pb-2.5 pt-1.5 border-t border-gray-850 font-sans text-[10px] space-y-2 bg-[#0c0c0d]">
                                    <div className="space-y-1 bg-[#121212] p-1.5 rounded border border-gray-850 leading-relaxed font-mono text-[9px]">
                                      <p className="text-gray-400 shrink-0">
                                        <span className="font-bold text-gray-500 uppercase">{R.detector}:</span> <span className="text-gray-200">{r.detector}</span>
                                      </p>
                                      <p className="text-gray-400 truncate">
                                        <span className="font-bold text-gray-500 uppercase">{R.sector}:</span> <span className="text-gray-200">{r.sector}</span>
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="font-extrabold text-cyan-500 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3 text-[#f2c811]" />
                                        {R.actionPlan}:
                                      </p>
                                      <p className="text-gray-300 bg-gray-900/60 p-2 border border-gray-850/80 rounded italic leading-normal font-mono text-[9.5px]">
                                        {r.actionPlan}
                                      </p>
                                    </div>
                                    
                                    {r.dateClosed ? (
                                      <p className="text-[9px] font-mono text-green-400 flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>
                                          {language === 'PT' ? `Resolvido em ${r.dateClosed}` :
                                           language === 'ES' ? `Resuelto el ${r.dateClosed}` : `Corrected on ${r.dateClosed}`}
                                        </span>
                                      </p>
                                    ) : (
                                      <p className="text-[9px] font-mono text-cyan-400 flex items-center gap-1 mt-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>
                                          {language === 'PT' ? 'Ação Corretiva em Execução' :
                                           language === 'ES' ? 'Plan de Acción en Curso' : 'Remediation Underway'}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </article>
                            )
                          })
                        )}
                      </div>
                    </div>
                    
                    {/* Clear Month highlights guide */}
                    <p className="text-[9px] text-gray-500 font-mono text-center border-t border-gray-850/80 pt-2 mt-2">
                       * {language === 'PT' ? 'Clique em qualquer barra do gráfico para focar as ocorrências por mês.' :
                          'Click on any chart column to filter list events dynamically.'}
                    </p>
                  </div>

                </div>

              </div>
            );
          })()}

          {/* Interactive BI item grid */}
          <div className="border-t border-[#2d2d2d] pt-4">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-2">Listagem Consolidada Real de Emissões de Teste</span>
            <div className="overflow-x-auto max-h-40 overflow-y-auto">
              <table className="w-full text-left text-[11px] font-mono text-gray-300">
                <thead>
                  <tr className="bg-[#1e1e1e] text-[#f2c811] uppercase tracking-wider">
                    <th className="p-2">Doc Code</th>
                    <th className="p-2">Checklist Reciente</th>
                    <th className="p-2">Projeto</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d]">
                  {filteredChecklistItems.slice(0, 10).map((i, idx) => (
                    <tr key={idx} className="hover:bg-[#1e1e1e]/60">
                      <td className="p-2 text-cyan-500">{i.code}</td>
                      <td className="p-2 truncate max-w-xs">{i.titlePt}</td>
                      <td className="p-2 truncate text-gray-500">{i.projectName}</td>
                      <td className={`p-2 font-bold ${
                        i.status === ChecklistStatus.APPROVED ? 'text-green-400' :
                        i.status === ChecklistStatus.REJECTED ? 'text-cyan-400' : 'text-gray-400'
                      }`}>
                        {i.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Bottom Power BI layout indicator strip */}
        <div className="flex justify-between items-center bg-[#171717] px-4 py-2 text-[10px] text-gray-500 font-mono border-t border-[#2d2d2d]">
          <span>© 2026 Piramidy PowerBI Embedded Agent v1.2</span>
          <span>COMPLIANCE DATABASE CONNECTED</span>
        </div>

      </section>

    </div>
  );
}
