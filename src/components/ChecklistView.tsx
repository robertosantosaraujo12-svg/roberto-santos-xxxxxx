import React, { useState } from 'react';
import { Project, ChecklistItem, ChecklistStatus, DocumentEmission, Language } from '../types';
import { CHANNELS_LANG, PASSWORDS_MAPPING } from '../data';
import { 
  CheckCircle, Clock, AlertTriangle, HelpCircle, 
  Search, Filter, FileText, Upload, Trash2, 
  Lock, CheckSquare, RefreshCw, Layers, Award, Check, BookOpen
} from 'lucide-react';
import InspectionProceduresView from './InspectionProceduresView';

interface ChecklistViewProps {
  language: Language;
  project: Project;
  currentUser?: { companyId: string; isAdmin: boolean } | null;
  isBlocked?: boolean;
  blockReason?: string;
  onUpdateChecklistItemStatus: (itemId: string, status: ChecklistStatus) => void;
  onAddDocumentEmission: (itemId: string, emission: DocumentEmission) => void;
  onDeleteDocumentEmission: (itemId: string, emissionId: string) => void;
}

export default function ChecklistView({
  language,
  project,
  currentUser,
  isBlocked = false,
  blockReason = '',
  onUpdateChecklistItemStatus,
  onAddDocumentEmission,
  onDeleteDocumentEmission
}: ChecklistViewProps) {
  const t = CHANNELS_LANG[language];
  
  // Tab Navigation for Matrix vs Procedures
  const [checklistActiveSubTab, setChecklistActiveSubTab] = useState<'matrix' | 'procedures'>('matrix');
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CAPA' | 'CONTRA_CAPA' | 'SUMARIO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Selected item detail for drawer
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Quick upload visual toast feedback
  const [uploadToast, setUploadToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states for adding emission
  const [rev, setRev] = useState('Rev. 0');
  const [fileName, setFileName] = useState('');
  const [emissionStatus, setEmissionStatus] = useState<ChecklistStatus>(ChecklistStatus.APPROVED);
  
  // Digital signature state inside add emission
  const [requiresSignature, setRequiresSignature] = useState(true);
  const [inspectorName, setInspectorName] = useState('Roberto Santos de Araujo');
  const [professionalId, setProfessionalId] = useState('CREA RJ 124559');
  const [nationalId, setNationalId] = useState('***.451.239-**');
  const [isSigned, setIsSigned] = useState(false);
  const [signatureLogs, setSignatureLogs] = useState<string>('');

  // Password verification for digital signature
  const [signaturePassword, setSignaturePassword] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Find selected item
  const selectedItem = project.checklist.find(item => item.id === selectedItemId);

  // Filter items
  const filteredItems = project.checklist.filter(item => {
    const isCategoryMatch = selectedCategory === 'ALL' || item.category === selectedCategory;
    
    const isStatusMatch = statusFilter === 'ALL' || item.status === statusFilter;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = 
      item.titlePt.toLowerCase().includes(searchLower) ||
      item.titleEn.toLowerCase().includes(searchLower) ||
      item.titleEs.toLowerCase().includes(searchLower) ||
      item.code.toLowerCase().includes(searchLower);

    return isCategoryMatch && isStatusMatch && titleMatch;
  });

  const getStatusColor = (status: ChecklistStatus) => {
    switch (status) {
      case ChecklistStatus.PENDING: 
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40'; // Amarelo
      case ChecklistStatus.ANALYSIS: 
        return 'bg-slate-300/10 text-white border-slate-300/30'; // Branco / Cinza
      case ChecklistStatus.REJECTED: 
        return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40'; // Vermelho
      case ChecklistStatus.NOT_APPLICABLE: 
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40'; // Azul
      case ChecklistStatus.APPROVED: 
        return 'bg-green-500/20 text-green-400 border-green-500/40'; // Verde
      default: 
        return 'bg-gray-800 text-gray-400';
    }
  };

  const getStatusDotColor = (status: ChecklistStatus) => {
    switch (status) {
      case ChecklistStatus.PENDING: return 'bg-blue-500';
      case ChecklistStatus.ANALYSIS: return 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]';
      case ChecklistStatus.REJECTED: return 'bg-[#ef4444]';
      case ChecklistStatus.NOT_APPLICABLE: return 'bg-blue-500';
      case ChecklistStatus.APPROVED: return 'bg-green-500';
    }
  };

  const getStatusLabel = (status: ChecklistStatus) => {
    switch (status) {
      case ChecklistStatus.PENDING: return t.pending;
      case ChecklistStatus.ANALYSIS: return t.analysis;
      case ChecklistStatus.REJECTED: return t.rejected;
      case ChecklistStatus.NOT_APPLICABLE: return t.notApplicable;
      case ChecklistStatus.APPROVED: return t.approved;
    }
  };

  const handleTriggerSignature = () => {
    if (!inspectorName || !professionalId) {
      alert('Preencha os dados do inspetor para validar a assinatura digital.');
      return;
    }
    setSignatureError('');
    const correctPass = currentUser?.isAdmin ? 'master2026' : (PASSWORDS_MAPPING[currentUser?.companyId || ''] || 'piramidy123');
    if (signaturePassword === correctPass) {
      setIsSigned(true);
      setSignatureLogs(`SHA256Hash: [${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}-99A2D-0B]`);
      setShowPasswordInput(false);
      setSignaturePassword('');
    } else {
      setSignatureError(language === 'PT' ? 'Senha de assinatura incorreta!' : 'Incorrect signing password!');
    }
  };

  const handleAddEmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      alert(language === 'PT' ? 'Erro: Emissão de documentos suspensa por restrições operacionais.' : 'Error: Document emission is suspended due to account restrictions.');
      return;
    }
    if (!selectedItemId || !fileName) return;

    const signatureObj = (requiresSignature && isSigned) ? {
      inspectorName,
      professionalId,
      nationalId,
      certificateAuthority: 'Piramidy Certisign CA v2.26',
      signedAt: new Date().toISOString(),
      signatureHash: signatureLogs || 'SHA256:f5ea38c29000a6aef912cbd41e',
      isValid: true
    } : undefined;

    const newEmission: DocumentEmission = {
      id: `em-${Date.now()}`,
      revision: rev,
      fileName,
      fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      status: emissionStatus,
      signature: signatureObj
    };

    onAddDocumentEmission(selectedItemId, newEmission);
    onUpdateChecklistItemStatus(selectedItemId, emissionStatus);

    // Reset Form
    setFileName('');
    setRev('Rev. 0');
    setIsSigned(false);
    setSignatureLogs('');
  };

  const handleDirectFileUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (isBlocked) {
      alert(language === 'PT' ? 'Erro: Upload de arquivos suspenso por restrições operacionais.' : 'Error: File upload is suspended due to account restrictions.');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const newEmission: DocumentEmission = {
      id: `em-${Date.now()}`,
      revision: 'Rev. 0',
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
      status: ChecklistStatus.APPROVED,
      signature: {
        inspectorName: currentUser?.isAdmin ? 'PIRAMID Admin' : 'Carlos Santos',
        professionalId: currentUser?.isAdmin ? 'CREA RJ 124559' : 'CREA RJ 999999',
        nationalId: '***.000.000-**',
        certificateAuthority: 'ICP-Brasil Piramid CA v1',
        signedAt: new Date().toISOString(),
        signatureHash: `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}-99A2D-0B`,
        isValid: true
      }
    };

    onAddDocumentEmission(itemId, newEmission);
    onUpdateChecklistItemStatus(itemId, ChecklistStatus.APPROVED);

    setUploadToast({
      message: language === 'PT' 
        ? `✓ Arquivo "${file.name}" anexado e assinado digitalmente com sucesso!`
        : `✓ File "${file.name}" attached and digitally signed successfully!`,
      type: 'success'
    });

    // Auto-clear toast after 5 seconds
    setTimeout(() => {
      setUploadToast(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">

      {/* Financial Block Security Warning Banner */}
      {isBlocked && (
        <div className="bg-blue-500/10 border-2 border-blue-500 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center text-left">
          <AlertTriangle className="w-10 h-10 text-blue-500 shrink-0 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-wider">
              {language === 'PT' ? '⚠️ EMISSÃO DE DOCUMENTOS SUSPENSA POR MEDIDA DE SEGURANÇA' : '⚠️ DOCUMENT EMISSION SUSPENDED FOR ACCOUNT COMPLIANCE'}
            </h4>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              {blockReason || (language === 'PT' 
                ? 'Esta empresa possui pendências financeiras em aberto no sistema há mais de 10 dias. Novos uploads, assinaturas digitais ICP e chancelas de conformidade estão bloqueados até que os débitos sejam quitados ou suspensos pelo administrador.'
                : 'This customer is currently restricted due to pending invoices past due for more than 10 days. All new file uploads, digital signatures, and technical certifications are blocked.')}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 font-mono text-[10px]">
              <span className="text-blue-400 font-bold uppercase">
                {language === 'PT' ? 'Status: BLOQUEIO ATIVO' : 'Status: RESTRICTION ACTIVE'}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300 font-bold uppercase">
                {language === 'PT' ? 'Ação: Regularizar no "Hub de Expansão (Simulador)"' : 'Action: Settle accounts in the "SaaS Expansion Hub"'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Active project details banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-950 p-5 border border-gray-800 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full filter blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
          <div>
            <span className="text-[10px] text-blue-500 uppercase font-semibold">
              {language === 'PT' ? 'Dossier Técnico Ativo' : 'Active Technical Register Dossier'}
            </span>
            <h2 className="text-lg font-bold text-white mt-1 font-sans">{project.name}</h2>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'PT' ? `Cliente: ${project.client} | Contrato: ${project.contract}` : `Client: ${project.client} | Contract: ${project.contract}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] bg-gray-900/80 p-3 rounded-lg border border-gray-800/80">
            <div><span className="text-gray-500">Doc:</span> <span className="text-gray-300 font-bold">{project.docNumber}</span></div>
            <div className="border-l border-gray-800 pl-2"><span className="text-gray-500">Rev:</span> <span className="text-blue-500 font-bold">{project.revision}</span></div>
            <div className="border-l border-gray-800 pl-2"><span className="text-gray-500">OS:</span> <span className="text-gray-300 font-bold">{project.orderNumber}</span></div>
          </div>
        </div>
      </section>

      {/* SUB-TAB SELECTOR CHROME */}
      <div className="flex border-b border-gray-800 gap-1 mt-2">
        <button
          onClick={() => setChecklistActiveSubTab('matrix')}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            checklistActiveSubTab === 'matrix'
              ? 'border-blue-500 text-white font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-350'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
          <span>{language === 'PT' ? 'Ficha de Verificação' : language === 'ES' ? 'Ficha de Verificación' : 'Verification Ledger'}</span>
        </button>

        <button
          onClick={() => setChecklistActiveSubTab('procedures')}
          className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            checklistActiveSubTab === 'procedures'
              ? 'border-blue-500 text-white font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-350'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>{language === 'PT' ? 'Procedimentos de Inspeção' : language === 'ES' ? 'Procedimientos de Inspección' : 'Inspection Procedures'}</span>
        </button>
      </div>

      {checklistActiveSubTab === 'matrix' ? (
        <>
          {/* Upload Feedback Toast */}
          {uploadToast && (
            <div className="bg-green-950/40 border border-green-500/30 p-3 rounded-lg text-xs font-semibold text-green-400 flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                {uploadToast.message}
              </span>
              <button 
                type="button"
                onClick={() => setUploadToast(null)}
                className="text-gray-400 hover:text-white font-bold px-1.5 py-0.5 hover:bg-green-950/60 rounded cursor-pointer font-mono"
              >
                ✕
              </button>
            </div>
          )}

          {/* Checklist Search & Filter panel */}
          <section className="bg-gray-900/40 p-4 border border-gray-800 rounded-lg space-y-4">
        
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* SEARCH INPUT */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'PT' ? 'Filtre por código ou nome do documento...' : 'Search checklist documents...'}
              className="w-full bg-[#111827] border border-gray-750 focus:border-blue-500 rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              {language === 'PT' ? 'Estado' : 'Status'}:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#111827] border border-gray-750 text-xs text-gray-300 rounded p-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">-- {language === 'PT' ? 'Todos os Status' : 'All Statuses'} --</option>
              <option value={ChecklistStatus.APPROVED}>{t.approved}</option>
              <option value={ChecklistStatus.ANALYSIS}>{t.analysis}</option>
              <option value={ChecklistStatus.PENDING}>{t.pending}</option>
              <option value={ChecklistStatus.REJECTED}>{t.rejected}</option>
              <option value={ChecklistStatus.NOT_APPLICABLE}>{t.notApplicable}</option>
            </select>
          </div>

        </div>

        {/* SECTION METROLOGY TAB CONTROL */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800/80">
          {[
            { id: 'ALL', label: language === 'PT' ? `Todos os Itens (${project.checklist.length})` : `All Checked Items (${project.checklist.length})` },
            { id: 'CAPA', label: language === 'PT' ? '1. Capa' : '1. Front Cover' },
            { id: 'CONTRA_CAPA', label: language === 'PT' ? '2. Contra-Capa' : '2. Back Cover' },
            { id: 'SUMARIO', label: language === 'PT' ? '3. Sumário / Dossiê' : '3. Summary Ledger' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded text-xs transition font-semibold cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-black font-bold'
                  : 'bg-[#111827]/80 text-gray-400 hover:text-white hover:bg-[#111827]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </section>

      {/* CHECKLIST DATA MATRIX TABLE */}
      <section className="bg-[#111827]/40 border border-gray-800/80 rounded-xl overflow-hidden">
        
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f141f] border-b border-gray-800 text-xs font-mono text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-20">{language === 'PT' ? 'Código' : 'Code'}</th>
                <th className="py-3 px-4">{language === 'PT' ? 'Item de Qualidade / Documentação PDF' : 'Inspected Document Report'}</th>
                <th className="py-3 px-4 w-32">{language === 'PT' ? 'Categoria' : 'Category'}</th>
                <th className="py-3 px-4 w-44">{language === 'PT' ? 'Estado' : 'Status'}</th>
                <th className="py-3 px-4 w-64 text-center">{language === 'PT' ? 'Ações / Documentos' : 'Actions / Upload'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-gray-500 font-mono">
                    {language === 'PT' ? 'Nenhum item encontrado para os filtros selecionados.' : 'No checklist items match criteria.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-[#111827]/60 transition ${
                      selectedItemId === item.id ? 'bg-blue-950/10' : ''
                    }`}
                  >
                    
                    {/* Item Code */}
                    <td className="py-3 px-4 font-mono text-xs text-blue-500/90 font-bold">{item.code}</td>
                    
                    {/* Item Title in selected language */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-xs text-gray-200 font-medium">
                          {language === 'PT' ? item.titlePt : language === 'ES' ? item.titleEs : item.titleEn}
                        </p>
                        
                        {/* Emissions indicators bubble */}
                        {item.emissions.length > 0 && (
                          <div className="flex gap-2.5 mt-1">
                            {item.emissions.map((em) => (
                              <span 
                                key={em.id} 
                                className="text-[9px] font-mono bg-gray-800 text-gray-400 px-1 py-0.2 rounded border border-gray-700/60"
                                title={`Enviado em: ${new Date(em.uploadedAt).toLocaleDateString()}`}
                              >
                                {em.revision} {em.signature ? '🔒 Signed' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Short Category tag */}
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400">
                      {item.category === 'CAPA' ? '1. Cover' : item.category === 'CONTRA_CAPA' ? '2. Back Cover' : '3. Summary Checklist'}
                    </td>

                    {/* Status selection and visual colour badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        
                        {/* Status Label selector */}
                        <div className={`text-[11px] font-bold py-1 px-2.5 border rounded-full font-mono flex items-center gap-1.5 ${getStatusColor(item.status)}`}>
                          <span className={`w-2 h-2 rounded-full ${getStatusDotColor(item.status)}`} />
                          {getStatusLabel(item.status)}
                        </div>

                        {/* Inline status switcher utility */}
                        <div className="flex border border-gray-800 rounded bg-gray-900 overflow-hidden divide-x divide-gray-800 shadow">
                          {([
                            ChecklistStatus.APPROVED, 
                            ChecklistStatus.ANALYSIS, 
                            ChecklistStatus.REJECTED, 
                            ChecklistStatus.NOT_APPLICABLE
                          ] as ChecklistStatus[]).map((st) => (
                            <button
                              key={st}
                              disabled={isBlocked}
                              onClick={() => {
                                if (isBlocked) return;
                                onUpdateChecklistItemStatus(item.id, st);
                              }}
                              className={`p-1.5 transition ${
                                isBlocked 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : 'hover:bg-gray-800 cursor-pointer'
                              } ${
                                item.status === st ? 'bg-blue-500/20 text-blue-500' : 'text-gray-500'
                              }`}
                              title={isBlocked ? (language === 'PT' ? 'Suspenso por inadimplência' : 'Suspended') : (st === ChecklistStatus.APPROVED ? t.approved : st === ChecklistStatus.ANALYSIS ? t.analysis : st === ChecklistStatus.REJECTED ? t.rejected : t.notApplicable)}
                            >
                              {st === ChecklistStatus.APPROVED && <CheckCircle className="w-3.5 h-3.5 stroke-2" />}
                              {st === ChecklistStatus.ANALYSIS && <Clock className="w-3.5 h-3.5 stroke-2" />}
                              {st === ChecklistStatus.REJECTED && <AlertTriangle className="w-3.5 h-3.5 stroke-2" />}
                              {st === ChecklistStatus.NOT_APPLICABLE && <HelpCircle className="w-3.5 h-3.5 stroke-2" />}
                            </button>
                          ))}
                        </div>

                      </div>
                    </td>

                    {/* Report management drawer buttons with direct file upload capability */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        
                        {/* Direct File Upload Label/Input */}
                        <label className={`p-2 border rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                          isBlocked 
                            ? 'bg-gray-900/50 border-gray-850 text-gray-500 cursor-not-allowed opacity-40' 
                            : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-500 cursor-pointer'
                        }`}>
                          <Upload className={`w-3.5 h-3.5 ${isBlocked ? 'text-gray-600' : 'text-blue-500'}`} />
                          <span>{language === 'PT' ? 'Fazer Upload' : 'Upload File'}</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => handleDirectFileUpload(item.id, e)}
                            className="hidden"
                            disabled={isBlocked}
                          />
                        </label>

                        {/* Existing Manage button */}
                        <button
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setFileName(`${item.code}_Relatorio_Emissao.pdf`);
                            setIsSigned(false);
                            setSignatureLogs('');
                          }}
                          className="p-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-gray-300 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          title={language === 'PT' ? 'Ver emissões e gerenciar assinaturas digitais' : 'View emissions and manage technical signatures'}
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                          <span>{language === 'PT' ? 'Gerenciar' : 'Manage'}</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
        </>
      ) : (
        <InspectionProceduresView language={language} />
      )}

      {/* MULTILANGUAGE DOCUMENT UPLOADING & SIGNATURE DRAWER MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-gray-200">
            
            <div className="flex justify-between items-start border-b border-gray-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] text-blue-500 font-mono font-bold uppercase">{selectedItem.code}</span>
                <h3 className="text-base font-bold text-white font-sans mt-0.5">
                  {language === 'PT' ? selectedItem.titlePt : language === 'ES' ? selectedItem.titleEs : selectedItem.titleEn}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedItemId(null)}
                className="text-gray-400 hover:text-white font-bold font-mono text-lg p-1 hover:bg-gray-800 rounded"
              >
                ✕
              </button>
            </div>

            {/* Financial Block Notice inside Drawer */}
            {isBlocked && (
              <div className="mb-4 bg-blue-500/10 border-2 border-blue-500 rounded-lg p-4 text-left font-mono">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-blue-500 animate-pulse" />
                  {language === 'PT' ? 'OPERERAÇÕES SUSPENSAS POR SEGURANÇA' : 'OPERATIONS SUSPENDED'}
                </p>
                <p className="text-[10px] text-gray-300 mt-1 font-sans">
                  {language === 'PT' 
                    ? 'Novas emissões de documentos e chancelas de assinaturas digitais ICP-Brasil estão suspensas para este projeto devido a faturas em aberto há mais de 10 dias.'
                    : 'New document registrations and digital signatures are disabled for this project due to unpaid overdue invoices.'}
                </p>
              </div>
            )}

            {/* Existing Saved emission records */}
            <div className="space-y-3 mb-6 bg-gray-950 p-4 border border-gray-850 rounded-lg">
              <h4 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                {t.emissionsList}
              </h4>
              
              {selectedItem.emissions.length === 0 ? (
                <p className="text-[11px] text-gray-500 font-mono">
                  {language === 'PT' ? 'Nenhum relatório ou emissão de arquivo salvo para este item do checklist.' : 'No uploaded reports registered for this item.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedItem.emissions.map((em) => (
                    <div 
                      key={em.id} 
                      className="text-xs p-2.5 bg-[#111827] border border-gray-800 rounded flex justify-between items-center gap-4"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-gray-300 font-mono flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>{em.fileName}</span>
                          <span className="text-[9px] bg-gray-800 text-blue-400 px-1 py-0.2 rounded">{em.revision}</span>
                        </p>
                        
                        {/* Signature tag and visual lock indicator */}
                        {em.signature ? (
                          <p className="text-[9px] text-green-400 font-mono mt-1 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-green-500" />
                            {t.certifiedBy} {em.signature.inspectorName} ({em.signature.professionalId})
                          </p>
                        ) : (
                          <p className="text-[9px] text-blue-500 font-mono mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            {t.notSigned}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge and delete bubble details */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-full ${getStatusColor(em.status)}`}>
                          {getStatusLabel(em.status)}
                        </span>
                        
                        <button
                          onClick={() => onDeleteDocumentEmission(selectedItem.id, em.id)}
                          className="p-1 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded transition"
                          title="Remover emissão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FORM FOR ADDING A NEW SAVED REPORT EDITION */}
            <form onSubmit={handleAddEmissionSubmit} className="space-y-4 border-t border-gray-800 pt-4">
              <h4 className="text-xs font-bold text-blue-500 font-mono uppercase tracking-wide">
                {t.newEmission}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* File input simulator */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400 font-mono">{t.uploadDoc} *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: relatorio_recebimento_v1.pdf"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="flex-1 bg-gray-950 border border-gray-750 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                    
                    {/* Fast presets helper */}
                    <button
                      type="button"
                      onClick={() => setFileName(`${selectedItem.code}_Procedimento_Qualificado_RevA.pdf`)}
                      className="bg-gray-800 text-[10px] px-2 rounded font-mono hover:bg-gray-700"
                    >
                      Preset
                    </button>
                  </div>
                </div>

                {/* Revision and status */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-mono">{t.revisionLabel}</label>
                    <input
                      type="text"
                      required
                      value={rev}
                      onChange={(e) => setRev(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-750 rounded px-2.5 py-1 text-xs text-white text-center font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-mono">Status</label>
                    <select
                      value={emissionStatus}
                      onChange={(e) => setEmissionStatus(e.target.value as ChecklistStatus)}
                      className="w-full bg-gray-950 border border-gray-750 text-xs rounded px-1.5 py-1 focus:outline-none"
                    >
                      <option value={ChecklistStatus.APPROVED}>{t.approved}</option>
                      <option value={ChecklistStatus.ANALYSIS}>{t.analysis}</option>
                      <option value={ChecklistStatus.REJECTED}>{t.rejected}</option>
                      <option value={ChecklistStatus.NOT_APPLICABLE}>{t.notApplicable}</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* DIGITAL SIGNIFICATION VALIDATOR CHECKBOX PANEL */}
              <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-lg space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresSignature}
                    onChange={(e) => setRequiresSignature(e.target.checked)}
                    className="accent-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-300 font-mono flex items-center gap-1.5 uppercase">
                    <Award className="w-4 h-4 text-blue-500 animate-pulse" />
                    {t.signatureValidation}
                  </span>
                </label>

                {requiresSignature && (
                  <div className="space-y-3 border-t border-gray-900 pt-3 text-xs">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 font-mono uppercase">{t.inspector}</label>
                        <input
                          type="text"
                          value={inspectorName}
                          onChange={(e) => setInspectorName(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs mt-0.5"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-gray-500 font-mono uppercase">{t.crea}</label>
                        <input
                          type="text"
                          value={professionalId}
                          onChange={(e) => setProfessionalId(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs mt-0.5"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-500 font-mono uppercase">{t.nationalId}</label>
                        <input
                          type="text"
                          value={nationalId}
                          className="w-full bg-gray-900 border border-gray-850 rounded px-2 py-1 text-xs mt-0.5 text-gray-500 cursor-not-allowed font-mono"
                          disabled
                        />
                      </div>
                    </div>

                     <div className="flex flex-col gap-3 pt-2 border-t border-gray-900 w-full">
                      {isSigned ? (
                        <div className="p-2 bg-green-950/20 border border-green-900/40 rounded">
                          <p className="text-[10px] font-semibold text-green-400 flex items-center gap-1.5 font-mono">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                            {t.signSuccess}
                          </p>
                          <p className="text-[9px] text-gray-500 font-mono font-bold select-all mt-1">{signatureLogs}</p>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <span className="text-[11px] text-gray-500 italic">
                              * {language === 'PT' ? 'Requer validação com Certidão de Segurança ICP-Brasil' : 'Requires security trust clearance'}
                            </span>
                            {!showPasswordInput && (
                              <button
                                type="button"
                                disabled={isBlocked}
                                onClick={() => {
                                  if (isBlocked) return;
                                  if (!inspectorName || !professionalId) {
                                    alert('Preencha os dados do inspetor para validar a assinatura digital.');
                                    return;
                                  }
                                  setShowPasswordInput(true);
                                }}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded transition-all flex items-center gap-1 ${
                                  isBlocked 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 text-black cursor-pointer'
                                }`}
                              >
                                <Lock className="w-3.5 h-3.5" />
                                {t.signDocument}
                              </button>
                            )}
                          </div>

                          {showPasswordInput && (
                            <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-lg space-y-2">
                              <label className="block text-[10px] text-blue-500 font-mono uppercase tracking-wider">
                                {language === 'PT' ? 'Confirmar Assinatura Técnica com Senha' : 'Confirm Technical Signature with Password'}
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="password"
                                  value={signaturePassword}
                                  onChange={(e) => {
                                    setSignaturePassword(e.target.value);
                                    setSignatureError('');
                                  }}
                                  placeholder={language === 'PT' ? 'Senha do Inspetor (Ex: petro123)' : 'Inspector Password'}
                                  className="flex-1 bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={handleTriggerSignature}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-black text-[11px] font-bold rounded transition"
                                >
                                  {language === 'PT' ? 'Assinar' : 'Sign'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowPasswordInput(false);
                                    setSignaturePassword('');
                                    setSignatureError('');
                                  }}
                                  className="px-2 py-1 bg-gray-800 hover:bg-gray-750 text-gray-400 text-[11px] font-medium rounded transition"
                                >
                                  {language === 'PT' ? 'Cancelar' : 'Cancel'}
                                </button>
                              </div>
                              {signatureError && (
                                <p className="text-[10px] text-[#ef4444] font-mono font-bold">{signatureError}</p>
                              )}
                              <p className="text-[9px] text-gray-500 font-mono italic">
                                * {language === 'PT' ? 'Use a mesma senha de acesso utilizada no login do sistema.' : 'Use the same password as your login credentials.'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Bottom control row */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-900">
                <button
                  type="button"
                  onClick={() => setSelectedItemId(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isBlocked || (requiresSignature && !isSigned)}
                  className={`px-4 py-2 text-xs font-bold rounded transition flex items-center gap-1 ${
                    isBlocked
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30 cursor-not-allowed'
                      : requiresSignature && !isSigned
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-black cursor-pointer'
                  }`}
                >
                  <Check className={`w-4 h-4 ${isBlocked ? 'text-blue-500' : 'text-black'}`} />
                  {isBlocked 
                    ? (language === 'PT' ? 'EMISSÃO BLOQUEADA' : 'EMISSION BLOCKED')
                    : (language === 'PT' ? 'Registrar Emissão' : 'Commit Emission Log')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
