import React, { useState, useEffect } from 'react';
import { Project, ChecklistStatus, Language } from '../types';
import { CHANNELS_LANG } from '../data';
import { 
  Printer, BookOpen, Layers, CheckCircle2, Award, 
  Map, Calendar, ShieldCheck, ArrowRight, Eye, CornerDownRight, AlertTriangle
} from 'lucide-react';

interface DatabookViewProps {
  language: Language;
  project: Project;
  isBlocked?: boolean;
  blockReason?: string;
}

export default function DatabookView({
  language,
  project,
  isBlocked = false,
  blockReason = ''
}: DatabookViewProps) {
  const t = CHANNELS_LANG[language];
  const [showPreview, setShowPreview] = useState(false);
  const [onlyApproved, setOnlyApproved] = useState(true);

  // List of all items that can be included: those with status APPROVED or with uploaded emissions
  const eligibleItems = project.checklist.filter(
    item => item.status === ChecklistStatus.APPROVED || item.emissions.length > 0
  );

  // Keep state of which eligible items are selected to be in the databook
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});

  // Sync selection whenever project or eligibleItems change
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    eligibleItems.forEach(item => {
      // Default to true for items that are APPROVED
      initial[item.id] = item.status === ChecklistStatus.APPROVED;
    });
    setSelectedItemIds(initial);
  }, [project]);

  // Failsafe: hide preview if company is blocked
  useEffect(() => {
    if (isBlocked) {
      setShowPreview(false);
    }
  }, [isBlocked]);

  // The actual items to compile: those that are eligible and selected
  const databookItems = eligibleItems.filter(item => selectedItemIds[item.id]);

  // Let's count page numbers dynamically!
  // Capa = Page 1
  // Contra-capa = Page 2
  // Sumário = Page 3
  // Each approved checklist item represents 1 compiled report page
  let currentPage = 4;
  const itemsWithPages = databookItems.map((item) => {
    const itemPage = currentPage;
    // Simulate multi-page reports: some items might occupy multiple pages
    const pageSpan = item.emissions.length > 0 ? Math.max(1, item.emissions.length) : 1;
    currentPage += pageSpan;
    return {
      ...item,
      startPage: itemPage,
      endPage: itemPage + pageSpan - 1,
      pageSpan
    };
  });

  const totalPagesCount = currentPage - 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* Financial Block Databook Warning Banner */}
      {isBlocked && (
        <div className="bg-orange-500/10 border-2 border-orange-500 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center text-left">
          <AlertTriangle className="w-10 h-10 text-orange-500 shrink-0 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold font-mono text-orange-400 uppercase tracking-wider">
              {language === 'PT' ? '⚠️ EMISSÃO DE DATABOOK SUSPENSA POR MEDIDA DE SEGURANÇA' : '⚠️ TECHNICAL DATABOOK COMPILATION SUSPENDED'}
            </h4>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              {blockReason || (language === 'PT' 
                ? 'A geração, exportação e impressão de Databooks consolidados para esta empresa estão bloqueadas temporariamente devido a débitos em atraso superiores a 10 dias de vencimento. Regularize a situação financeira no painel administrativo.'
                : 'Consolidated technical databook compilation, PDF exporting, and physical printing are blocked for this client due to delinquent status.')}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 font-mono text-[10px]">
              <span className="text-orange-400 font-bold uppercase">
                {language === 'PT' ? 'Status: RESTRITO' : 'Status: LOCKED'}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300 font-bold uppercase">
                {language === 'PT' ? 'Ação: Quitar faturas na aba "Hub de Expansão (Simulador)"' : 'Action: Settle accounts in the "SaaS Expansion Hub"'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Configuration Header Card */}
      <section className="bg-gray-900/40 p-5 border border-gray-800 rounded-lg space-y-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            {t.databookTitle}
          </h2>
          <p className="text-xs text-gray-400">
            {t.databookDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg">
          
          <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              {language === 'PT' 
                ? 'GARANTIA DE CONFORMIDADE: Dossiê técnico configurado para compilar estritamente relatórios APROVADOS e assinados eletronicamente.' 
                : 'COMPLIANCE GUARANTEE: Technical databook strictly configured to compile APPROVED, digitally-signed reports only.'}
            </span>
          </div>

          <div className="flex gap-2">
            {isBlocked ? (
              <button
                disabled
                className="px-4 py-2 bg-gray-800 text-gray-500 text-xs font-bold rounded cursor-not-allowed border border-gray-750 font-mono"
              >
                {language === 'PT' ? 'MÓDULO BLOQUEADO 🔒' : 'MODULE LOCKED 🔒'}
              </button>
            ) : !showPreview ? (
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold rounded transition-all cursor-pointer flex items-center gap-1.5 font-mono"
              >
                <Eye className="w-4 h-4 text-black" />
                {t.generateBtn}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded text-center transition"
                >
                  {t.closePreview}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 text-white text-xs font-bold rounded shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-white" />
                  {t.printBtn}
                </button>
              </>
            )}
          </div>

        </div>
      </section>

      {/* RENDER DYNAMIC LIVE DATABOOK PREVIEW */}
      {showPreview ? (
        <div className="space-y-8 bg-gray-950 p-6 border border-gray-800 rounded-xl" id="print-area">
          
          {/* Quick instructions indicator - hidden during standard printing */}
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-500 font-mono text-[10px] sm:text-xs rounded-md print:hidden">
            💡 {language === 'PT' 
              ? 'Área de Visualização de Impressão de Databook do Projeto. Pressione "Imprimir" para gerar documento diagramado com quebras automáticas de página.' 
              : 'Printable engineering blueprint preview. Click "Print" to launch standard Chrome PDF export module.'}
          </div>

          <div className="space-y-12 max-w-4xl mx-auto bg-white text-black p-8 sm:p-12 border border-gray-350 shadow-2xl rounded-md print:border-none print:shadow-none print:p-0">
            
            {/* PAGE 1: CAPA (FRONT COVER) */}
            <div className="min-h-[750px] flex flex-col justify-between border-2 border-black p-8 font-serif relative page-break">
              
              {/* Cover Top header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {/* Styled O&G Pyramidy logo shape representation */}
                  <div className="w-10 h-10 bg-black flex flex-col items-center justify-center text-white font-mono font-black text-lg select-none">
                    ▲
                  </div>
                  <span className="font-sans font-black tracking-widest text-[#000] text-sm">PIRAMID ENERGY GOVERNANCE</span>
                </div>
                <div className="text-right text-[10px] font-mono leading-tight">
                  <p>SISTEMA DE GESTÃO DA QUALIDADE</p>
                  <p className="font-bold">DATABOOK DIGITAL</p>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center my-auto space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight font-sans">
                  {project.title || project.name}
                </h1>
                <p className="text-sm font-mono tracking-widest text-gray-500">
                  DOSSIÊ TÉCNICO DE ENGENHARIA & QUALIDADE
                </p>
                <div className="w-12 h-1 bg-black mx-auto" />
              </div>

              {/* Cover metadata footer list */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-black pt-6">
                <div>
                  <p className="text-gray-500">CLIENTE / EMPRESA:</p>
                  <p className="font-bold uppercase">{project.client}</p>
                </div>
                <div>
                  <p className="text-gray-500">Nº CONTRATO:</p>
                  <p className="font-bold uppercase">{project.contract || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">DOCUMENTO REFERENCE:</p>
                  <p className="font-bold uppercase">{project.docNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">REVISÃO:</p>
                  <p className="font-bold uppercase text-orange-600">{project.revision}</p>
                </div>
              </div>

              {/* Page Number banner */}
              <div className="text-center text-[10px] font-mono border-t border-gray-250 pt-2 text-gray-500 mt-4">
                PÁGINA 1 DE {totalPagesCount}
              </div>

            </div>


            {/* PAGE 2: CONTRA CAPA (BACK COVER PROPERTIES) */}
            <div className="min-h-[750px] flex flex-col justify-between border-2 border-black p-8 font-mono text-xs page-break">
              
              <div className="border-b-2 border-black pb-3">
                <h2 className="text-sm font-bold uppercase font-sans">CONTRA-CAPA DE METADADOS TÉCNICOS</h2>
                <p className="text-[10px] text-gray-500">Identificação detalhada e ficha de validade técnica</p>
              </div>

              <div className="space-y-6 my-auto max-w-xl mx-auto w-full">
                
                <table className="w-full text-left font-mono text-xs divide-y divide-black/30 border-collapse">
                  <tbody>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">CATEGORIA:</td>
                      <td className="py-2.5 font-bold text-black uppercase">{project.category}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">Nº DO DOCUMENTO:</td>
                      <td className="py-2.5 text-black font-semibold uppercase">{project.docNumber}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">CLIENTE CONTRATANTE:</td>
                      <td className="py-2.5 text-black">{project.client}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">NOME DO PROJETO:</td>
                      <td className="py-2.5 text-black font-semibold">{project.name}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">ÁREA / SITE OPERATIVA:</td>
                      <td className="py-2.5 text-black italic">{project.area || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">ORDEM DE SERVIÇO (OS):</td>
                      <td className="py-2.5 text-black font-bold">{project.orderNumber}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">Nº CONTRATO DE RESP.:</td>
                      <td className="py-2.5 text-black">{project.contract}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-500">RESPONSÁVEL TÉCNICO:</td>
                      <td className="py-2.5 text-black font-bold font-sans">{project.techResponsible}</td>
                    </tr>
                  </tbody>
                </table>

              </div>

              <div className="pt-4 border-t border-black text-center text-[10px]">
                PÁGINA 2 DE {totalPagesCount}
              </div>

            </div>


            {/* PAGE 3: SUMÁRIO GERAL / INDICE (TABLE OF CONTENTS WITH DYNAMIC PAGINATION) */}
            <div className="min-h-[750px] flex flex-col justify-between border-2 border-black p-8 font-mono text-xs page-break">
              
              <div>
                <div className="border-b-2 border-black pb-3 mb-6">
                  <h2 className="text-sm font-bold uppercase font-sans">3. {t.tocTitle}</h2>
                  <p className="text-[10px] text-gray-400">Relação completa de todos os relatórios compilados e suas respectivas páginas</p>
                </div>

                <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                  
                  {/* Capa index row */}
                  <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5 text-gray-600">
                    <span>CAPA PRINCIPAL GERAL</span>
                    <span>FL. 01</span>
                  </div>

                  {/* Contra-capa row */}
                  <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5 text-gray-600">
                    <span>CONTRA CAPA (FICHA CADASTRAL)</span>
                    <span>FL. 02</span>
                  </div>

                  {/* Sumário row */}
                  <div className="flex justify-between border-b border-dashed border-gray-300 py-1.5 text-gray-600">
                    <span>SUMÁRIO INDEX DE QUALIDADE [ESTE DOCUMENTO]</span>
                    <span>FL. 03</span>
                  </div>

                  {/* Databook compiled items */}
                  {itemsWithPages.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between border-b border-dashed border-gray-300 py-1"
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-lg text-black font-semibold">
                        <span className="text-orange-600 font-bold">{item.code}</span>
                        <span className="truncate">{language === 'PT' ? item.titlePt : item.titleEn}</span>
                      </div>
                      <span className="shrink-0 text-black font-bold">
                        FL. {String(item.startPage).padStart(2, '0')} {item.pageSpan > 1 ? ` - FL. ${String(item.endPage).padStart(2, '0')}` : ''}
                      </span>
                    </div>
                  ))}

                </div>
              </div>

              <div className="pt-4 border-t border-black text-center text-[10px]">
                PÁGINA 3 DE {totalPagesCount}
              </div>

            </div>


            {/* PAGE 4+: INDIVIDUAL COMPILED REVIEWS LOGS DETAILS */}
            <div className="space-y-6">
              {itemsWithPages.map((item) => (
                <div 
                  key={item.id} 
                  className="min-h-[750px] flex flex-col justify-between border-2 border-black p-8 font-mono text-xs page-break"
                >
                  
                  {/* Databook sheet title banner */}
                  <div className="border-b-2 border-black pb-3 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-orange-600 font-bold">{item.code} - GESTÃO DE CONFORMIDADE</span>
                      <h3 className="text-sm font-bold uppercase font-sans text-black mt-1">
                        {language === 'PT' ? item.titlePt : language === 'ES' ? item.titleEs : item.titleEn}
                      </h3>
                    </div>
                    <div className="text-right text-[10px]">
                      <p>DOC REFERÊNCIA</p>
                      <p className="font-bold text-orange-600">{project.docNumber}</p>
                    </div>
                  </div>

                  {/* Body analysis elements */}
                  <div className="my-auto space-y-6">
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded max-w-xl mx-auto space-y-3 font-sans text-xs">
                      <div className="flex justify-between items-center bg-gray-100 p-2 border-b border-gray-300">
                        <span className="font-mono text-[10px] font-bold uppercase">Relatório de Controle Final</span>
                        <span className="text-green-600 font-bold tracking-tight uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Aprovado
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <p><span className="text-gray-500">Status do Processamento:</span> <span className="font-mono text-black font-semibold">Liberado para Emissão</span></p>
                        <p><span className="text-gray-500">Vistor de Inspeção técnica:</span> <span className="text-black font-bold">{project.techResponsible}</span></p>
                      </div>
                    </div>

                    {/* PDF/Document emissions details if available */}
                    <div className="space-y-3 max-w-xl mx-auto">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Emissões Conformes Contidas neste Databook:</h4>
                      
                      {item.emissions.length === 0 ? (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded text-[11px] text-orange-700 italic">
                          * {language === 'PT' 
                            ? 'Nota: Nenhum arquivo físico anexado. Status aprovado por homologação retroativa do supervisor geral.' 
                            : 'Note: Signed off via retro-active bulk authorization checklist approval.'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.emissions.map((em) => (
                            <div key={em.id} className="p-3 bg-gray-50 border border-gray-200 rounded font-mono text-[10px] space-y-1.5">
                              <div className="flex justify-between">
                                <span className="font-bold text-black">{em.fileName}</span>
                                <span className="p-0.5 bg-gray-200 text-black rounded font-bold">{em.revision}</span>
                              </div>
                              <p className="text-gray-400">Enviado em: {new Date(em.uploadedAt).toLocaleString()}</p>
                              
                              {/* Decoded cryptograph audit */}
                              {em.signature ? (
                                <div className="mt-2.5 p-2 bg-green-50 rounded border border-green-200 text-green-800 text-[9px] leading-relaxed">
                                  <div className="flex items-center gap-1 font-bold text-green-700">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>ASSINATURA DIGITAL VALIDADA (ICP-BRASIL METRIC)</span>
                                  </div>
                                  <p className="mt-1">Assinado por: <span className="font-bold">{em.signature.inspectorName}</span> | CREA: <span className="font-bold">{em.signature.professionalId}</span></p>
                                  <p className="font-sans text-gray-500 text-[8px] truncate mt-0.5">{em.signature.signatureHash}</p>
                                </div>
                              ) : (
                                <div className="mt-2.5 p-1.5 bg-orange-50 border border-orange-100 text-orange-800 text-[9px]">
                                  ⚠️ Autorizado por aprovação de diretoria geral sem certificado criptográfico.
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Print spec footer layout */}
                  <div className="border-t border-black pt-4 flex justify-between items-center text-[9px]">
                    <span className="font-sans font-bold">PYRAMID QUALITY REGISTRATION NETWORK SERVICES</span>
                    <span>PÁGINA {item.startPage} DE {totalPagesCount}</span>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      ) : (
        /* Empty / Standard configuration grid with interactive list selection */
        <section className="bg-[#111827]/40 border border-gray-800 rounded-xl p-6 sm:p-8 text-center font-mono space-y-6">
          <div className="space-y-2">
            <BookOpen className="w-12 h-12 text-orange-500/80 mx-auto animate-pulse" />
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-sm font-bold text-white uppercase">
                {language === 'PT' ? 'Dossiê Técnico Customizável' : 'Customizable Technical Dossier'}
              </h3>
              <p className="text-xs text-gray-400">
                {language === 'PT' 
                  ? 'Selecione abaixo quais documentos aprovados ou emitidos devem constar na compilação oficial do Databook deste projeto.' 
                  : 'Select which approved or issued documents should be compiled into the official Databook for this project.'}
              </p>
            </div>
          </div>

          {/* Custom Selection Panel */}
          <div className="border border-gray-800 rounded-lg p-4 bg-gray-950/50 max-w-2xl mx-auto text-left space-y-3 font-sans">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider font-mono">
                {language === 'PT' ? 'Documentos Pertinentes para Emissão' : 'Pertinent Documents for Issuance'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                {databookItems.length} / {eligibleItems.length} {language === 'PT' ? 'Selecionados' : 'Selected'}
              </span>
            </div>

            {eligibleItems.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-4 font-mono">
                {language === 'PT' 
                  ? 'Nenhum documento aprovado ou emitido neste projeto ainda.' 
                  : 'No approved or issued documents in this project yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {eligibleItems.map((item) => {
                  const isChecked = !!selectedItemIds[item.id];
                  return (
                    <label 
                      key={item.id} 
                      className={`flex items-start gap-2.5 p-2 rounded border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-orange-500/10 border-orange-500/30 text-white'
                          : 'bg-gray-900/30 border-gray-800/60 text-gray-500 hover:text-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedItemIds(prev => ({
                            ...prev,
                            [item.id]: !prev[item.id]
                          }));
                        }}
                        className="mt-0.5 rounded border-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-950 bg-gray-950 cursor-pointer"
                      />
                      <div className="text-xs leading-tight">
                        <span className="font-mono font-bold text-orange-500 text-[10px] block">{item.code}</span>
                        <span className="line-clamp-1 text-[11px] font-medium">{language === 'PT' ? item.titlePt : item.titleEn}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border border-gray-800/80 rounded-lg p-4 bg-gray-950 max-w-sm mx-auto text-left space-y-2 text-xs">
            <p className="grid grid-cols-2">
              <span className="text-gray-500">{language === 'PT' ? 'Estrutura Completa:' : 'Full Checklist:'}</span>
              <span className="text-right text-gray-200 font-semibold">{project.checklist.length} itens</span>
            </p>
            <p className="grid grid-cols-2">
              <span className="text-gray-500">{language === 'PT' ? 'Filtro para Compilação:' : 'Compilable Items:'}</span>
              <span className="text-right text-green-400 font-bold">{databookItems.length} itens</span>
            </p>
            <p className="grid grid-cols-2">
              <span className="text-gray-500">{language === 'PT' ? 'Emissões Anexadas:' : 'Attached Emissions:'}</span>
              <span className="text-right text-gray-200">{project.checklist.reduce((acc, i) => acc + i.emissions.length, 0)} arquivos</span>
            </p>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            disabled={databookItems.length === 0}
            className={`px-4 py-2 text-xs font-bold rounded cursor-pointer mt-2 transition-all ${
              databookItems.length === 0 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-orange-500 hover:bg-orange-600 text-black shadow-lg hover:shadow-orange-500/10'
            }`}
          >
            {t.generateBtn}
          </button>
        </section>
      )}

    </div>
  );
}
