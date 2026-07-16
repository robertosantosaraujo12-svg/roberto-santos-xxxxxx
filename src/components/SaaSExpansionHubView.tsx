import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Shield, Receipt, DollarSign, 
  Mail, Clipboard, CheckCircle, Info, ChevronRight, 
  Activity, ArrowRight, ShieldCheck, Key, Lock, FileText, Users, Landmark,
  Database, Cpu, Network, RefreshCw, Link, Settings, AlertTriangle, Play, Check, HelpCircle, Share2, Eye, Trash2, Code, Plus, ArrowUpRight, Clock
} from 'lucide-react';
import { Language, Company, Invoice } from '../types';

interface SaaSExpansionHubViewProps {
  language: Language;
  isAdmin?: boolean;
  companies?: Company[];
  invoices?: Invoice[];
  onToggleManualBlock?: (companyId: string) => void;
  onUpdateInvoiceStatus?: (invoiceId: string, status: 'PAID' | 'PENDING') => void;
  onSendInvoiceAlert?: (invoiceId: string) => void;
}

export default function SaaSExpansionHubView({ 
  language, 
  isAdmin = false,
  companies = [],
  invoices = [],
  onToggleManualBlock = () => {},
  onUpdateInvoiceStatus = () => {},
  onSendInvoiceAlert = () => {}
}: SaaSExpansionHubViewProps) {
  const [activeTab, setActiveTab] = useState<'cartilha' | 'simulator' | 'protection' | 'invitations' | 'nfse' | 'integrations' | 'invoice-guard'>('cartilha');
  const [alertToast, setAlertToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Interactive Walkthrough Guide (Cartilha) state
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState(0);
  const [demoItemApproved, setDemoItemApproved] = useState(false);
  const [demoSigned, setDemoSigned] = useState(false);
  const [demoHash, setDemoHash] = useState('');

  // Santos SP NFS-e (City Invoice) Simulation States
  const [nfseProvider, setNfseProvider] = useState<'direct' | 'gateway'>('gateway');
  const [cnpjPrestador, setCnpjPrestador] = useState('48.123.456/0001-99');
  const [imPrestador, setImPrestador] = useState('123456-7');
  const [certificadoA1Name, setCertificadoA1Name] = useState('piramidy_energy_cert_2026.pfx');
  const [certificadoSenha, setCertificadoSenha] = useState('santos1234');
  const [selectedClientForInvoice, setSelectedClientForInvoice] = useState('Subsea7 S.A.');
  const [invoiceAmount, setInvoiceAmount] = useState(4500.00);
  const [invoiceDescription, setInvoiceDescription] = useState('Licenciamento SaaS Piramidy Hub e Auditoria Metrológica de 71 quesitos regulamentares com controle de assinatura digital ICP-Brasil');
  
  // Simulation flow states
  const [nfseSimulationStep, setNfseSimulationStep] = useState<number>(-1); // -1 = idle, 0 = xml/json generation, 1 = digital signature, 2 = ws transmission, 3 = success
  const [nfseSimulationLogs, setNfseSimulationLogs] = useState<string[]>([]);
  const [emittedInvoices, setEmittedInvoices] = useState<Array<{ id: string; rpsNum: number; nfseNum: string; client: string; value: number; date: string; code: string }>>([
    { id: 'INV-001', rpsNum: 104, nfseNum: '202600000001254', client: 'Chevron Corp', value: 3750.00, date: '2026-06-25', code: 'A7Y9-D8X1' },
    { id: 'INV-002', rpsNum: 103, nfseNum: '202600000001221', client: 'Subsea7 S.A.', value: 4500.00, date: '2026-06-19', code: 'K2R4-P0L7' }
  ]);

  const getNfseRequestPayload = () => {
    if (nfseProvider === 'direct') {
      return `<?xml version="1.0" encoding="utf-8"?>
<EnviarLoteRps xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps Id="Lote_0000000001" versao="2.01">
    <NumeroLote>125</NumeroLote>
    <Cnpj>${cnpjPrestador.replace(/\D/g, '')}</Cnpj>
    <InscricaoMunicipal>${imPrestador.replace(/\D/g, '')}</InscricaoMunicipal>
    <QuantidadeRps>1</QuantidadeRps>
    <ListaRps>
      <Rps>
        <InfDeclaracaoPrestacaoServico Id="Rps_105">
          <Rps>
            <IdentificacaoRps>
              <Numero>105</Numero>
              <Serie>1</Serie>
              <Tipo>1</Tipo> <!-- 1 = RPS (Recibo Provisorio de Servico) -->
            </IdentificacaoRps>
            <DataEmissao>${new Date().toISOString().split('T')[0]}T10:00:00</DataEmissao>
            <Status>1</Status> <!-- 1 = Normal -->
          </Rps>
          <Competencia>${new Date().toISOString().split('T')[0]}</Competencia>
          <Servico>
            <Valores>
              <ValorServicos>${invoiceAmount.toFixed(2)}</ValorServicos>
              <IssRetido>2</IssRetido> <!-- 2 = Nao -->
              <ItemListaServico>01.03</ItemListaServico> <!-- Processamento de dados e Licenciamento de Software -->
              <CodigoTributacaoMunicipio>010300188</CodigoTributacaoMunicipio>
              <Aliquota>0.0200</Aliquota> <!-- Aliquota ISS de 2% (Servicos de Tecnologia em Santos/SP) -->
            </Valores>
            <Discriminacao>${invoiceDescription}</Discriminacao>
            <CodigoMunicipio>3548500</CodigoMunicipio> <!-- Codigo IBGE Santos/SP -->
          </Servico>
          <Prestador>
            <Cnpj>${cnpjPrestador.replace(/\D/g, '')}</Cnpj>
            <InscricaoMunicipal>${imPrestador.replace(/\D/g, '')}</InscricaoMunicipal>
          </Prestador>
          <Tomador>
            <IdentificacaoTomador>
              <CpfCnpj>
                <Cnpj>${selectedClientForInvoice === 'Subsea7 S.A.' ? '44102930000155' : '10293848000122'}</Cnpj>
              </CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${selectedClientForInvoice}</RazaoSocial>
          </Tomador>
        </InfDeclaracaoPrestacaoServico>
      </Rps>
    </ListaRps>
  </LoteRps>
</EnviarLoteRps>`;
    } else {
      return `{
  "data_emissao": "${new Date().toISOString().split('T')[0]}T10:00:00",
  "prestador": {
    "cnpj": "${cnpjPrestador.replace(/\D/g, '')}",
    "inscricao_municipal": "${imPrestador.replace(/\D/g, '')}"
  },
  "tomador": {
    "cnpj": "${selectedClientForInvoice === 'Subsea7 S.A.' ? '44102930000155' : '10293848000122'}",
    "razao_social": "${selectedClientForInvoice}"
  },
  "servico": {
    "valor_servicos": ${invoiceAmount},
    "codigo_item_lista_servico": "01.03",
    "aliquota": 2.0,
    "discriminacao": "${invoiceDescription}",
    "municipio_prestacao_servico": "3548500"
  }
}`;
    }
  };

  const triggerNfseEmission = () => {
    setNfseSimulationStep(0);
    setNfseSimulationLogs(['Iniciando emissão de Nota Fiscal de Serviços Eletrônica (NFS-e) para Santos/SP...']);
    
    setTimeout(() => {
      setNfseSimulationStep(1);
      setNfseSimulationLogs(prev => [
        ...prev,
        nfseProvider === 'direct' 
          ? 'Gerando XML RPS (Recibo Provisório de Serviço) conforme o padrão ABRASF v2.01...'
          : 'Gerando payload JSON estruturado para a API do Gateway...',
        `Assinando lote digitalmente com o certificado ${certificadoA1Name} usando biblioteca RSA-SHA1/SHA256...`
      ]);
      
      setTimeout(() => {
        setNfseSimulationStep(2);
        setNfseSimulationLogs(prev => [
          ...prev,
          'Conectando com o WebService da Prefeitura Municipal de Santos (Homologação Ginfes/Giss)...',
          'Enviando requisição HTTPS SOAP / XML assinado no cabeçalho do protocolo WS-Security...',
          'Processando lote na fila da prefeitura... [Código HTTP 200]'
        ]);
        
        setTimeout(() => {
          const rpsNum = 104 + emittedInvoices.length;
          const nfseNum = '2026' + String(1000000000000 + Math.floor(Math.random() * 9000000000));
          const code = Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16).toUpperCase()).join('') + '-' + Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16).toUpperCase()).join('');
          const newInvoice = {
            id: `INV-00${emittedInvoices.length + 1}`,
            rpsNum,
            nfseNum,
            client: selectedClientForInvoice,
            value: invoiceAmount,
            date: new Date().toISOString().split('T')[0],
            code
          };
          
          setEmittedInvoices([newInvoice, ...emittedInvoices]);
          setNfseSimulationStep(3);
          setNfseSimulationLogs(prev => [
            ...prev,
            '✔ NFS-e emitida com sucesso pela Prefeitura de Santos/SP!',
            `Número da Nota Fiscal: ${nfseNum}`,
            `RPS convertido: ${rpsNum}`,
            `Código de Autenticação Municipal: ${code}`
          ]);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // Interactive Revenue & Profit Simulator State (Answers: 30 clients, 20 requirements, 30000.00 cost)
  const [clientsCount, setClientsCount] = useState(30);
  const [requirementsPerClient, setRequirementsPerClient] = useState(20);
  const [baseFee, setBaseFee] = useState(3000); // Base Monthly Fee (R$) - Default updated to R$ 3000.00
  const [activeOSPerClient, setActiveOSPerClient] = useState(1); // Average Active Work Orders (OS) per client (Default: 1)
  const [feePerOS, setFeePerOS] = useState(2000); // Fee per active Work Order/OS (R$) - Default updated to R$ 2000.00
  const [feePerItem, setFeePerItem] = useState(75); // Fee per certified checklist item/document (R$) - Default updated to R$ 75.00
  const [fixedCosts, setFixedCosts] = useState(30000); // Fixed monthly costs (R$)
  const [cacPerClient, setCacPerClient] = useState(1500); // Customer Acquisition Cost per client

  // Interactive NDA State
  const [selectedNdaClient, setSelectedNdaClient] = useState('Cliente Demonstração S.A.');
  const [ndaSignee, setNdaSignee] = useState('');
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [signedNdas, setSignedNdas] = useState<Array<{ id: string; client: string; signee: string; date: string; hash: string }>>([
    { id: 'NDA-001', client: 'Parceiro Técnico S.A.', signee: 'Lucas Silva (Coordenador QA/QC)', date: '2026-06-20', hash: 'SHA256:d8a9bc71a39fbc88b22a7f8832a89c922c26f63a233b81109a9301bf890c2a23' },
    { id: 'NDA-002', client: 'Empresa Contratante S.A.', signee: 'Elena Rostova (Contract Lead)', date: '2026-06-25', hash: 'SHA256:4ca2289f811cb209192e27dfb382ae92df17c6e61e0b04a1df8a956bcda85df2' }
  ]);
  const [isNdaSigningActive, setIsNdaSigningActive] = useState(false);

  // Invitation Email Builder state
  const [inviteClientName, setInviteClientName] = useState('Cliente Demonstração S.A.');
  const [inviteContactPerson, setInviteContactPerson] = useState('Roberto Santos');
  const [inviteTone, setInviteTone] = useState<'corporate' | 'direct' | 'collaborative'>('corporate');
  const [inviteCopied, setInviteCopied] = useState(false);

  const simulateSignature = () => {
    setIsNdaSigningActive(true);
    setTimeout(() => {
      const generatedHash = 'SHA256:' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const newNda = {
        id: `NDA-00${signedNdas.length + 1}`,
        client: selectedNdaClient,
        signee: ndaSignee || 'Representante Autorizado',
        date: new Date().toISOString().split('T')[0],
        hash: generatedHash
      };
      setSignedNdas([newNda, ...signedNdas]);
      setIsNdaSigningActive(false);
      setNdaAgreed(false);
      setNdaSignee('');
    }, 1500);
  };

  // --- STATE FOR MARKET INTEGRATIONS (SAP, TOTVS, JIRA, MS PROJECT) ---
  const [selectedIntegrationSystem, setSelectedIntegrationSystem] = useState<'sap' | 'totvs' | 'jira' | 'msproject'>('sap');
  
  // SAP specific states
  const [sapHost, setSapHost] = useState('sap-prd-appl.piramid-energy.internal');
  const [sapSysNum, setSapSysNum] = useState('00');
  const [sapClientNum, setSapClientNum] = useState('100');
  const [sapRfcFunction, setSapRfcFunction] = useState('BAPI_ALM_NOTIF_CREATE');
  const [sapEquipmentId, setSapEquipmentId] = useState('EQ-3091_SDV_VALVE');
  const [sapNotificationType, setSapNotificationType] = useState('M1'); // Maintenance Notification
  const [sapMappedLocations, setSapMappedLocations] = useState<Array<{ id: string; techLoc: string; equipment: string; status: string }>>([
    { id: 'LOC-001', techLoc: 'FPSO-P62-S01-PMP02', equipment: 'EQ-8002_CENTRIF_PUMP', status: 'Ativo' },
    { id: 'LOC-002', techLoc: 'FPSO-P62-M12-SDV01', equipment: 'EQ-3091_SDV_VALVE', status: 'Ativo' }
  ]);

  // TOTVS specific states
  const [totvsApiUrl, setTotvsApiUrl] = useState('https://api.totvs.piramid-energy.com.br/api/v1');
  const [totvsRoutine, setTotvsRoutine] = useState('MATA521'); // ERP Routine code (e.g., Ordem de Serviço)
  const [totvsToken, setTotvsToken] = useState('totvs_tkn_81a17b2b8e39f01c990a23fe');
  const [totvsSchema, setTotvsSchema] = useState('Protheus v12.1.2403');
  const [totvsSyncedOS, setTotvsSyncedOS] = useState<Array<{ id: string; totvsId: string; client: string; serviceType: string; status: string }>>([
    { id: 'OS-1021', totvsId: 'TTV-OS-2026-904', client: 'Subsea7 S.A.', serviceType: 'Inspeção de Válvula', status: 'Sincronizado' },
    { id: 'OS-1022', totvsId: 'TTV-OS-2026-905', client: 'Chevron Corp', serviceType: 'Calibração Metrológica', status: 'Sincronizado' }
  ]);

  // Jira specific states
  const [jiraUrl, setJiraUrl] = useState('https://piramid-energy.atlassian.net');
  const [jiraProjectKey, setJiraProjectKey] = useState('PIR');
  const [jiraToken, setJiraToken] = useState('jira_pat_atlassian_e901a88b2cb40182bb900ef...');
  const [jiraIssueType, setJiraIssueType] = useState<'Bug' | 'Task' | 'Incident'>('Bug');
  const [jiraIssues, setJiraIssues] = useState<Array<{ id: string; jiraKey: string; checklistItem: string; status: string; priority: string }>>([
    { id: 'TKT-001', jiraKey: 'PIR-304', checklistItem: 'Requisito 4: Ensaio de Ultrassom no Corpo de Prova', status: 'Em Aberto', priority: 'High' }
  ]);

  // MS Project specific states
  const [msProjectMode, setMsProjectMode] = useState<'xml_import' | 'rest_online'>('xml_import');
  const [msProjectFileName, setMsProjectFileName] = useState('Cronograma_Inspecoes_Subsea7_Rev5.xml');
  const [msProjectTimeline, setMsProjectTimeline] = useState<Array<{ task: string; start: string; finish: string; progress: number; mappedItem: string }>>([
    { task: 'Inspeção de Integridade Mecânica - Válvulas', start: '2026-07-01', finish: '2026-07-15', progress: 85, mappedItem: 'Seção 1: Válvulas de Alívio' },
    { task: 'Ensaios Não-Destrutivos (Dutos)', start: '2026-07-16', finish: '2026-07-30', progress: 0, mappedItem: 'Seção 3: Dutos Submarinos' }
  ]);

  // General Sync Simulator States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<number>(-1); // -1 = idle
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const triggerIntegrationSync = () => {
    setIsSyncing(true);
    setSyncStep(0);
    
    if (selectedIntegrationSystem === 'sap') {
      setSyncLogs(['Iniciando Handshake de Integração Nativa com o SAP PM (Plant Maintenance)...']);
      
      setTimeout(() => {
        setSyncStep(1);
        setSyncLogs(prev => [
          ...prev,
          `Conectando ao servidor RFC SAP [${sapHost}] Client [${sapClientNum}] SysNum [${sapSysNum}]...`,
          'Efetuando login seguro com credenciais de gateway de auditoria metrológica...',
          '✔ Conexão RFC estabelecida com sucesso via SAP NetWeaver Gateway.'
        ]);
        
        setTimeout(() => {
          setSyncStep(2);
          setSyncLogs(prev => [
            ...prev,
            `Invocando a BAPI corporativa [${sapRfcFunction}]...`,
            `Enviando metadados do Ativo e Auditoria (Equipamento ID: ${sapEquipmentId})...`,
            'Enviando chaves hash SHA-256 das assinaturas digitais ICP-Brasil para o registro mestre de qualidade SAP QM...'
          ]);
          
          setTimeout(() => {
            const randomLocId = 'LOC-00' + (sapMappedLocations.length + 1);
            const randomTechLoc = 'FPSO-P62-M12-SDV' + String(10 + sapMappedLocations.length);
            const newMapped = {
              id: randomLocId,
              techLoc: randomTechLoc,
              equipment: sapEquipmentId,
              status: 'Ativo'
            };
            
            setSapMappedLocations([newMapped, ...sapMappedLocations]);
            setSyncStep(3);
            setSyncLogs(prev => [
              ...prev,
              '✔ Retorno do SAP processado! Nota de Manutenção e Auditoria gerada com sucesso.',
              'Código de retorno SAP: 200 (Success)',
              `ID da Transação SAP (RFC GUID): RFC-2026-OUT-${Math.floor(Math.random() * 90000 + 10000)}`,
              `Novo Local Técnico vinculado: ${randomTechLoc} para o equipamento ${sapEquipmentId}`
            ]);
            setIsSyncing(false);
          }, 1500);
        }, 1500);
      }, 1500);
      
    } else if (selectedIntegrationSystem === 'totvs') {
      setSyncLogs(['Iniciando sincronização de Ordens de Serviço (OS) com o TOTVS Protheus ERP...']);
      
      setTimeout(() => {
        setSyncStep(1);
        setSyncLogs(prev => [
          ...prev,
          `Conectando à API REST do TOTVS [${totvsApiUrl}]...`,
          `Efetuando autenticação com Bearer Token JWT [${totvsToken.substring(0, 10)}...]`,
          `Estrutura de dados validada conforme schema do ERP [${totvsSchema}].`
        ]);
        
        setTimeout(() => {
          setSyncStep(2);
          setSyncLogs(prev => [
            ...prev,
            `Invocando rotina backend do Protheus [${totvsRoutine}]...`,
            'Puxando Ordens de Serviço em aberto no back-office de manutenção...',
            'Atualizando status de conformidade legal e liberando faturamento fiscal para os clientes correspondentes...'
          ]);
          
          setTimeout(() => {
            const randomId = 'OS-' + (1021 + totvsSyncedOS.length);
            const randomTotvsId = 'TTV-OS-2026-' + (904 + totvsSyncedOS.length);
            const newOs = {
              id: randomId,
              totvsId: randomTotvsId,
              client: 'Subsea7 S.A.',
              serviceType: 'Inspeção Dimensional de Dutos submarinos',
              status: 'Sincronizado'
            };
            
            setTotvsSyncedOS([newOs, ...totvsSyncedOS]);
            setSyncStep(3);
            setSyncLogs(prev => [
              ...prev,
              '✔ Sincronização de OS concluída com sucesso com o TOTVS!',
              'Ordens de serviço atualizadas na base central corporativa.',
              `Lote TOTVS processado ID: ${Math.floor(Math.random() * 900000 + 100000)}`,
              `Conectado com sucesso com a rotina de faturamento e serviços.`
            ]);
            setIsSyncing(false);
          }, 1500);
        }, 1500);
      }, 1500);
      
    } else if (selectedIntegrationSystem === 'jira') {
      setSyncLogs(['Iniciando comunicação com Jira Software Cloud (Atlassian API)...']);
      
      setTimeout(() => {
        setSyncStep(1);
        setSyncLogs(prev => [
          ...prev,
          `Conectando a [${jiraUrl}] com API Token seguro...`,
          `Verificando projeto ativo [${jiraProjectKey}]...`,
          'Buscando requisitos de não-conformidade no checklist ativo do Piramid Energy...'
        ]);
        
        setTimeout(() => {
          setSyncStep(2);
          setSyncLogs(prev => [
            ...prev,
            `Gerando payload de Issue do tipo [${jiraIssueType}]...`,
            'Enviando evidências fotográficas e de ensaios metrológicos via REST API...',
            'Mapeando campos customizados para auditoria legal.'
          ]);
          
          setTimeout(() => {
            const randomKey = `${jiraProjectKey}-${100 + Math.floor(Math.random()*900)}`;
            const newIssue = {
              id: 'TKT-00' + (jiraIssues.length + 1),
              jiraKey: randomKey,
              checklistItem: `Requisito ${Math.floor(Math.random() * 71) + 1}: Certificado de Calibração Metrológica dos Manômetros`,
              status: 'Em Aberto',
              priority: 'High'
            };
            
            setJiraIssues([newIssue, ...jiraIssues]);
            setSyncStep(3);
            setSyncLogs(prev => [
              ...prev,
              `✔ Issue ${randomKey} criada no Jira Software com sucesso!`,
              'Web-hook de callback ativo para atualizações de status automáticas.',
              `Link da Issue: ${jiraUrl}/browse/${randomKey}`
            ]);
            setIsSyncing(false);
          }, 1500);
        }, 1500);
      }, 1500);
      
    } else if (selectedIntegrationSystem === 'msproject') {
      setSyncLogs(['Iniciando importação / conciliação do cronograma MS Project...']);
      
      setTimeout(() => {
        setSyncStep(1);
        setSyncLogs(prev => [
          ...prev,
          msProjectMode === 'xml_import'
            ? `Analisando arquivo XML de Gantt [${msProjectFileName}] enviado pelo usuário...`
            : 'Conectando ao MS Project Online REST Endpoint...',
          'Lendo marcos contratuais (Milestones) e datas de baseline...',
          'Mapeando itens da EAP (Estrutura Analítica do Projeto) contra os 71 quesitos regulamentares do Piramid.'
        ]);
        
        setTimeout(() => {
          setSyncStep(2);
          setSyncLogs(prev => [
            ...prev,
            'Sincronizando percentuais de avanço físico real obtidos através dos laudos metrológicos...',
            'Calculando desvios de cronograma (Schedule Variance) com base em itens homologados com assinatura ICP.'
          ]);
          
          setTimeout(() => {
            const newTimeline = [
              { task: `Homologação de Certificados Seção ${Math.floor(Math.random() * 5) + 1}`, start: '2026-07-10', finish: '2026-07-22', progress: 100, mappedItem: 'Seção de Ensaios Não-Destrutivos' },
              ...msProjectTimeline
            ];
            setMsProjectTimeline(newTimeline);
            setSyncStep(3);
            setSyncLogs(prev => [
              ...prev,
              '✔ Sincronização de cronograma MS Project concluída!',
              'Status de avanço físico atualizado na linha de base.',
              'Alinhamento exato: 100% de consistência entre cronograma executivo e laudos assinados.'
            ]);
            setIsSyncing(false);
          }, 1500);
        }, 1500);
      }, 1500);
    }
  };

  // Calculations for Simulator
  // Let's compute: 
  // Monthly recurring revenue (MRR) per client = BaseFee + (Average active OS * feePerOS) + (Average certified items * feePerItem)
  const mrrPerClient = baseFee + (activeOSPerClient * feePerOS) + (requirementsPerClient * feePerItem);
  const totalGrossRevenue = clientsCount * mrrPerClient;
  const netProfit = totalGrossRevenue - fixedCosts;
  const profitMargin = totalGrossRevenue > 0 ? (netProfit / totalGrossRevenue) * 100 : 0;
  
  // Break-even Clients Calculation (Ponto de Equilíbrio)
  const breakEvenClients = Math.ceil(fixedCosts / Math.max(1, mrrPerClient));

  // CAC Payback and LTV Modeling
  const totalCac = clientsCount * cacPerClient;
  const paybackMonths = netProfit > 0 ? Math.max(0.1, parseFloat((totalCac / netProfit).toFixed(1))) : 999;
  const estimatedLtv = mrrPerClient * 12; // 1-year customer value reference

  const handleCopyInvite = (text: string) => {
    navigator.clipboard.writeText(text);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const getInviteEmailBody = () => {
    const link = `https://piramid-energy.com/test-access?token=demo-${inviteClientName.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (inviteTone === 'corporate') {
      return `Prezado(a) ${inviteContactPerson || 'Gestor(a)'},

Gostaria de lhe apresentar formalmente a PIRAMID ENERGY GOVERNANCE, nossa plataforma dedicada ao controle de garantia de qualidade, inspeção metrológica e compilação automatizada de Databooks técnicos para o setor de Óleo e Gás.

Com o objetivo de validar a aderência do sistema às suas necessidades e comprovar o ganho de eficiência operacional na homologação de requisitos de qualidade, estruturamos um ambiente exclusivo de testes e homologação para a equipe da ${inviteClientName}.

Acesso Seguro à Plataforma:
- Link de Acesso: ${link}
- Termo de Confidencialidade e NDA: Integrado digitalmente na tela de entrada do sistema.

Neste ambiente, sua equipe poderá interagir com a lista de verificação técnica de 71 quesitos regulamentares (incluindo capas, contra-capas e sumários conforme normas estritas), realizar uploads fictícios, testar a assinatura criptográfica ICP-Brasil e gerar o Databook consolidado em PDF com paginação automática em apenas 1 clique.

Ficamos à inteira disposição para coletar seus feedbacks e alinhar os próximos passos de implantação.

Atenciosamente,
Roberto Santos de Araujo
Diretor de Operações | Piramid Energy`;
    } else if (inviteTone === 'direct') {
      return `Olá ${inviteContactPerson || 'Equipe'}, tudo bem?

Criamos um ambiente de testes personalizado para a ${inviteClientName} conhecer a nossa plataforma PIRAMID ENERGY GOVERNANCE. 

O sistema foi feito sob medida para facilitar a visualização e aprovação rápida de relatórios técnicos de Óleo & Gás (com 71 quesitos regulamentares de metrologia), eliminando o retrabalho manual na hora de montar Databooks.

Você pode testar a plataforma diretamente por este link seguro:
👉 ${link}

O sistema conta com um aviso de proteção de ideias e NDA digital na tela inicial para garantir total segurança mútua de dados industriais durante o período de homologação.

Dê uma olhada em como funciona a validação com certificação digital ICP-Brasil e a geração imediata do Databook em PDF! Aguardo seu feedback para definirmos os próximos passos.

Abraços,
Roberto Santos de Araujo`;
    } else {
      return `Olá ${inviteContactPerson || 'parceiro(a)'}, espero que este e-mail lhe encontre bem!

Construir processos de qualidade robustos e transparentes é um desafio contínuo em nossos projetos de Óleo e Gás. Por isso, desenvolvemos a PIRAMID ENERGY GOVERNANCE: uma ferramenta moderna para simplificar o acompanhamento de requisitos metrológicos e unificar a documentação técnica em tempo recorde.

Gostaríamos de cocriar e validar essa solução em conjunto com você e a equipe da ${inviteClientName}. Para isso, preparamos um acesso experimental exclusivo no link abaixo:
🔗 ${link}

*Segurança e Sigilo*: A plataforma é protegida sob rígidos termos de sigilo industrial e propriedade industrial patenteada (Lei Nº 9.279/96), garantindo confidencialidade mútua de ponta a ponta.

Fique à vontade para simular a assinatura digital ICP, aprovar quesitos e testar o nosso gerador automático de Databooks. Adoraríamos ouvir suas impressões e sugestões práticas!

Um excelente trabalho,
Roberto Santos de Araujo`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 p-5 rounded-r-xl bg-gray-950/40">
        <div className="flex items-center gap-2 text-amber-500">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest">Master Strategy Suite</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase tracking-tight">
          {language === 'PT' ? 'Hub de Expansão B2B & Proteção de Ideia' : 'B2B Enterprise Expansion & IP Protection Hub'}
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-4xl font-mono leading-relaxed uppercase">
          {language === 'PT' 
            ? 'Ferramentas didáticas, simulador de escala financeira e proteção legal de segredo industrial prontas para captação de clientes e validação de mercado.' 
            : 'Interactive instructional manuals, financial scalability simulators, and trade secret NDAs tailored for commercial expansion.'}
        </p>
      </div>

      {/* Primary Tab Navigation */}
      {(() => {
        const tabs = [
          { id: 'cartilha', label: language === 'PT' ? '1. Cartilha de Uso' : '1. Client Guide', icon: BookOpen, show: true },
          { id: 'simulator', label: language === 'PT' ? '2. Simulador de Lucro' : '2. Revenue Simulator', icon: DollarSign, show: isAdmin },
          { id: 'protection', label: language === 'PT' ? '3. Proteção Legal' : '3. IP Legal Guard', icon: Shield, show: true },
          { id: 'invitations', label: language === 'PT' ? '4. Convites de Teste' : '4. Invite Center', icon: Mail, show: isAdmin },
          { id: 'nfse', label: language === 'PT' ? '5. Emissão NFS-e' : '5. Santos NFS-e', icon: Landmark, show: isAdmin },
          { id: 'integrations', label: language === 'PT' ? '6. Integrações ERP/PM' : '6. ERP/PM Sync', icon: Cpu, show: true },
          { id: 'invoice-guard', label: language === 'PT' ? '7. Financeiro & Bloqueios' : '7. Invoice Guard', icon: Receipt, show: true }
        ].filter(t => t.show);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-2 bg-gray-950/80 p-1 rounded-xl border border-gray-900 font-mono">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-amber-500 text-black shadow' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* TAB 1: CARTILHA DIDÁTICA INTERATIVA */}
      {activeTab === 'cartilha' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Navigation index */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold font-mono text-amber-500 uppercase tracking-widest block">
              {language === 'PT' ? 'Passo a Passo do Usuário' : 'Step-by-step Index'}
            </h3>
            
            <div className="space-y-2">
              {[
                { title: 'Passo 1: Login de Locatário Seguro', desc: 'Identificação por código de empresa e MFA criptográfico.', icon: Lock },
                { title: 'Passo 2: Auditoria dos 71 Quesitos', desc: 'Preenchimento do Checklist Metrológico em tempo real.', icon: CheckCircle },
                { title: 'Passo 3: Assinatura Digital ICP', desc: 'Chancela oficial com validade legal e hashing SHA-256.', icon: ShieldCheck },
                { title: 'Passo 4: Compilação do Databook', desc: 'Consolidação imediata em PDF estruturado com sumário.', icon: FileText }
              ].map((step, idx) => {
                const Icon = step.icon;
                const isSelected = activeWalkthroughStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveWalkthroughStep(idx)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500 text-white' 
                        : 'bg-gray-950/40 border-gray-900 text-gray-400 hover:border-gray-850 hover:text-white'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-amber-500 text-black' : 'bg-gray-900 text-amber-500/80'} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono block tracking-wide uppercase">{step.title}</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-gray-950/60 border border-gray-900 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-gray-400">
              <span className="text-white font-bold block mb-1">💡 DIDÁTICA PARA CLIENTES</span>
              Quando enviar a plataforma aos clientes, peça que entrem com seu código de inquilino exclusivo (ex: <code className="text-amber-500 font-bold">cliente-demo</code> / senha: <code className="text-amber-500 font-bold">demo123</code>). Eles verão apenas os seus respectivos projetos de forma restrita e totalmente isolada!
            </div>
          </div>

          {/* Demonstration Canvas */}
          <div className="lg:col-span-8 bg-gray-950/40 border border-gray-900 rounded-xl p-5 sm:p-6 space-y-6 flex flex-col justify-between">
            {activeWalkthroughStep === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-mono text-gray-400 tracking-wider uppercase">DIDÁTICA: ETAPA DE ACESSO MULTI-TENANT</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white uppercase font-sans">Como o cliente se autentica isoladamente?</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Cada cliente possui uma <strong>base lógica isolada (MFA Sandbox)</strong>. Ao digitar o código correspondente na tela inicial, o sistema detecta a qual rede de ativos o inspetor pertence, bloqueando qualquer visualização cruzada de projetos concorrentes.
                  </p>
                </div>

                {/* Simulated Login UI Widget */}
                <div className="bg-[#07090e] border border-gray-900 p-5 rounded-lg max-w-sm mx-auto space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="font-bold text-gray-400 text-[10px] uppercase">PIRAMID GATEWAY SECURE</span>
                    <span className="text-[9px] text-teal-400 font-bold uppercase">● ONLINE</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block uppercase">Código da Empresa</label>
                    <div className="mt-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded font-bold text-white flex justify-between items-center">
                      <span>cliente-demo</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded">MAPPED</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block uppercase">Senha</label>
                    <div className="mt-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded text-gray-450 flex items-center justify-between select-none">
                      <span>••••••••••</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] text-gray-400 text-left">
                    🔑 <strong className="text-amber-400">Restrição Absoluta</strong>: O inquilino só visualiza projetos cujo campo <em>Client</em> corresponda estritamente à sua chave.
                  </div>
                </div>
              </div>
            )}

            {activeWalkthroughStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-mono text-gray-400 tracking-wider uppercase">DIDÁTICA: AUDITORIA DO CHECKLIST DE 71 ITENS</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white uppercase font-sans">Como seu cliente interage com a lista técnica?</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    O inspetor percorre os 71 quesitos metrológicos (regulamentados pelas normas estritas de Óleo & Gás). Cada item permite o upload de evidências (relatórios de testes não destrutivos, ultrassom, ensaio radiográfico, etc.) e a alteração de status para aprovação ou rejeição.
                  </p>
                </div>

                {/* Simulated Interactive checklist widget */}
                <div className="bg-[#07090e] border border-gray-900 p-4 rounded-lg space-y-3 font-mono text-xs">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Simule a interação do cliente abaixo:</span>
                  
                  <div className="p-3 bg-gray-950 border border-gray-850 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded font-bold text-[10px]">SUMA-30</span>
                        <span className="text-white font-bold font-sans text-xs">Relatório de Inspeção de Líquido Penetrante</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-sans">Item técnico obrigatório para liberação estrutural de spools de alta pressão.</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold border ${
                        demoItemApproved 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {demoItemApproved ? 'APROVADO / APPROVED' : 'PENDENTE / PENDING'}
                      </span>
                      
                      <button
                        onClick={() => setDemoItemApproved(!demoItemApproved)}
                        className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-[10px] text-white transition-all cursor-pointer"
                      >
                        {demoItemApproved ? 'Reiniciar' : 'Aprovar Quesito'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-gray-500 leading-relaxed font-sans text-left">
                    ℹ️ <strong>Impacto Didático</strong>: O progresso geral da obra e as exportações mudam dinamicamente na tela à medida que o inspetor valida as linhas regulamentares de qualidade.
                  </div>
                </div>
              </div>
            )}

            {activeWalkthroughStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-mono text-gray-400 tracking-wider uppercase">DIDÁTICA: VALIDAÇÃO DE ASSINATURA ICP-BRASIL</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white uppercase font-sans">Como funciona a chancela jurídica digital?</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Para que um documento tenha validade legal no ecossistema energético brasileiro, ele precisa ser assinado com certificado digital (e-CPF/e-CNPJ) ICP-Brasil. O Piramidy integra esse controle calculando a integridade do arquivo através de hashes criptográficos SHA-256.
                  </p>
                </div>

                {/* Simulated Signature Flow */}
                <div className="bg-[#07090e] border border-gray-900 p-4 rounded-lg space-y-3 font-mono text-xs">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Simule a validação criptográfica:</span>
                  
                  <div className="p-4 bg-gray-950 border border-gray-850 rounded text-center space-y-3">
                    {demoSigned ? (
                      <div className="space-y-2">
                        <div className="text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span>DOCUMENTO ASSINADO DIGITALMENTE</span>
                        </div>
                        <div className="bg-gray-900/55 p-2 rounded text-[10px] text-left space-y-1 text-gray-450 border border-gray-850">
                          <div><span className="text-gray-500 uppercase">Assinante:</span> Roberto Santos de Araujo</div>
                          <div><span className="text-gray-500 uppercase">Autoridade Emissora:</span> ICP-Brasil Serpro AC v5</div>
                          <div><span className="text-gray-500 uppercase">Firma Digital (SHA-256):</span> <code className="text-amber-500 text-[9px] break-all">{demoHash}</code></div>
                        </div>
                        <button
                          onClick={() => {
                            setDemoSigned(false);
                            setDemoHash('');
                          }}
                          className="px-2 py-1 bg-red-950/20 border border-red-900/35 hover:bg-red-950/40 text-red-400 rounded text-[9px] cursor-pointer"
                        >
                          Limpar Assinatura
                        </button>
                      </div>
                    ) : (
                      <div className="py-2 space-y-2">
                        <p className="text-[11px] text-gray-400">O arquivo <strong className="text-amber-500 font-sans">P78-LP-REP-4001.pdf</strong> está aguardando homologação do inspetor.</p>
                        <button
                          onClick={() => {
                            setDemoSigned(true);
                            setDemoHash('SHA256:e3b0c44298fc1c149afbf4c8996f' + Math.floor(Math.random()*1000000).toString(16) + '4ca495991b7852b855');
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Simular Assinatura Digital ICP</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeWalkthroughStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-mono text-gray-400 tracking-wider uppercase">DIDÁTICA: COMPILAÇÃO DO DATABOOK DE ENTREGA</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white uppercase font-sans">O Gran Finale do Cliente: O Livro Técnico Consolidador</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Em vez de gastar semanas unindo centenas de relatórios em PDFs desordenados, o Piramidy compila tudo em <strong>um único segundo</strong>. O sistema cria automaticamente capas formais, contra-capas estruturadas, um sumário (índice) paginado sequencialmente e anexa todos os relatórios homologados com segurança.
                  </p>
                </div>

                {/* Simulated Book compilation preview */}
                <div className="bg-[#07090e] border border-gray-900 p-4 rounded-lg font-mono text-xs text-center space-y-3">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold text-left">Representação do Compilador:</span>
                  
                  <div className="bg-gray-950 p-4 rounded border border-gray-850 flex flex-col items-center justify-center space-y-2">
                    <span className="text-amber-500 text-2xl">📚</span>
                    <h5 className="font-sans text-white font-bold">Dossiê Técnico Consolidado da Plataforma</h5>
                    <p className="text-[10px] text-gray-500 font-sans max-w-sm">Pronto para apresentação em fiscalizações governamentais (ANP/Inmetro).</p>
                    
                    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-amber-500 h-full w-full animate-pulse" />
                    </div>
                    
                    <span className="text-[9px] text-teal-400 uppercase font-bold tracking-wider">71 de 71 quesitos indexados • Paginação sequencial 1 a 144</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center border-t border-gray-900 pt-4 mt-6 shrink-0 font-mono text-xs">
              <button
                disabled={activeWalkthroughStep === 0}
                onClick={() => setActiveWalkthroughStep(prev => Math.max(0, prev - 1))}
                className="px-3 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900 text-gray-400 hover:text-white rounded transition cursor-pointer"
              >
                ◀ Anterior
              </button>
              
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                Etapa {activeWalkthroughStep + 1} de 4
              </span>

              <button
                disabled={activeWalkthroughStep === 3}
                onClick={() => setActiveWalkthroughStep(prev => Math.min(3, prev + 1))}
                className="px-3 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900 text-gray-400 hover:text-white rounded transition cursor-pointer"
              >
                Próximo ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAAS REVENUE & SCENARIO SIMULATOR */}
      {activeTab === 'simulator' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-gray-950/40 border border-gray-900 p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide flex items-center gap-1.5">
                  <Receipt className="w-5 h-5 text-amber-500" />
                  <span>Simulador Financeiro de Escala B2B SaaS</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Simule cenários de crescimento baseados nos indicadores solicitados e modele o ponto de equilíbrio para atingir alta rentabilidade.
                </p>
              </div>

              {/* Reset to requested scenario button */}
              <button
                onClick={() => {
                  setClientsCount(30);
                  setRequirementsPerClient(20);
                  setBaseFee(3000);
                  setActiveOSPerClient(1);
                  setFeePerOS(2000);
                  setFeePerItem(75);
                  setFixedCosts(30000);
                }}
                className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer"
              >
                ★ Restaurar Cenário Sugerido (30 Clientes / 1 OS / 20 Requisitos)
              </button>
            </div>
            
            {/* Simulation Parameter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-2">
              
              {/* Clients slider */}
              <div className="space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">1. Empresas Ativas:</span>
                  <span className="text-amber-500 font-bold">{clientsCount} clientes</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={clientsCount} 
                  onChange={(e) => setClientsCount(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono font-sans">Volume de empresas independentes cadastradas na plataforma.</span>
              </div>

              {/* Requirements per client slider */}
              <div className="space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">2. Docs/Itens por Cliente:</span>
                  <span className="text-amber-500 font-bold">{requirementsPerClient} docs</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="71" 
                  value={requirementsPerClient} 
                  onChange={(e) => setRequirementsPerClient(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono font-sans">Qtd. média de documentos de checklist homologados p/ empresa.</span>
              </div>

              {/* Base monthly fee per client */}
              <div className="space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">3. Licença Base/Mês:</span>
                  <span className="text-teal-400 font-bold">R$ {baseFee}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="250"
                  value={baseFee} 
                  onChange={(e) => setBaseFee(parseInt(e.target.value))}
                  className="w-full accent-teal-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono font-sans">Taxa fixa mensal pelo licenciamento da plataforma por empresa.</span>
              </div>

              {/* Average Active OS per client */}
              <div className="space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">4. OS Ativas por Cliente:</span>
                  <span className="text-teal-400 font-bold">{activeOSPerClient} OS</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={activeOSPerClient} 
                  onChange={(e) => setActiveOSPerClient(parseInt(e.target.value))}
                  className="w-full accent-teal-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono font-sans">Quantidade média de ordens de serviço ativas por mês por empresa.</span>
              </div>

              {/* Fee per active OS */}
              <div className="space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">5. Valor por OS Ativa:</span>
                  <span className="text-teal-400 font-bold">R$ {feePerOS}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="250"
                  value={feePerOS} 
                  onChange={(e) => setFeePerOS(parseInt(e.target.value))}
                  className="w-full accent-teal-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono font-sans">Preço fixo cobrado por cada ordem de serviço (OS) em andamento.</span>
              </div>

              {/* Fee per certified item */}
              <div className="space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">6. Valor por Doc/Item:</span>
                  <span className="text-teal-400 font-bold">R$ {feePerItem}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="5"
                  value={feePerItem} 
                  onChange={(e) => setFeePerItem(parseInt(e.target.value))}
                  className="w-full accent-teal-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono font-sans">Preço variável cobrado por cada documento assinado e homologado digitalmente.</span>
              </div>

              {/* Extra Parameters: Fixed Monthly Cost & CAC */}
              <div className="lg:col-span-2 space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">Custo Fixo Mensal de Manutenção:</span>
                  <span className="text-red-400 font-bold">R$ {fixedCosts.toLocaleString('pt-BR')}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="100000" 
                  step="5000"
                  value={fixedCosts} 
                  onChange={(e) => setFixedCosts(parseInt(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono">Custo de infraestrutura cloud, segurança, suporte técnico e salários operacionais.</span>
              </div>

              <div className="lg:col-span-2 space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">CAC (Custo Aquisição de Clientes) por Empresa:</span>
                  <span className="text-yellow-500 font-bold">R$ {cacPerClient.toLocaleString('pt-BR')}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="500"
                  value={cacPerClient} 
                  onChange={(e) => setCacPerClient(parseInt(e.target.value))}
                  className="w-full accent-yellow-500 h-1 bg-gray-950 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-gray-500 block leading-tight font-mono">Custo gasto em marketing, reuniões de venda, prospecção e demonstrações para capturar uma empresa.</span>
              </div>

            </div>
          </div>

          {/* Results Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
            {/* Gross Revenue card */}
            <div className="bg-[#0b0f19] border border-gray-800 p-5 rounded-xl space-y-1 relative overflow-hidden">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Faturamento Bruto Mensal</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">R$ {totalGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="text-[9px] text-gray-500 block pt-1 border-t border-gray-900/80">R$ {mrrPerClient.toLocaleString('pt-BR')} de MRR por cliente ativo</span>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-500/5 text-5xl font-black select-none pointer-events-none">MRR</div>
            </div>

            {/* Break-even Point Card */}
            <div className={`bg-[#0b0f19] border p-5 rounded-xl space-y-1 relative overflow-hidden ${
              clientsCount >= breakEvenClients ? 'border-amber-500/30' : 'border-red-500/30'
            }`}>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block">Ponto de Equilíbrio (Mínimo)</span>
              <p className="text-xl sm:text-2xl font-black text-amber-500">{breakEvenClients} {breakEvenClients === 1 ? 'Cliente Ativo' : 'Clientes Ativos'}</p>
              <span className="text-[9px] text-gray-500 block pt-1 border-t border-gray-900/80">
                {clientsCount >= breakEvenClients ? '✔ Lucrativo no cenário atual' : '✘ Adicione clientes para atingir o breakeven'}
              </span>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-amber-500/5 text-5xl font-black select-none pointer-events-none">BREAK</div>
            </div>

            {/* Total maintenance costs */}
            <div className="bg-[#0b0f19] border border-gray-800 p-5 rounded-xl space-y-1 relative overflow-hidden">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Custo de Operação (OPEX)</span>
              <p className="text-xl sm:text-2xl font-black text-red-400">R$ {fixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="text-[9px] text-gray-500 block pt-1 border-t border-gray-900/80">Equivalente a R$ {(fixedCosts / clientsCount).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} por cliente ativo</span>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-red-500/5 text-5xl font-black select-none pointer-events-none">OPEX</div>
            </div>

            {/* Net Profit card */}
            <div className={`bg-[#0b0f19] border p-5 rounded-xl space-y-1 relative overflow-hidden ${
              netProfit >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'
            }`}>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Lucro Líquido Mensal</span>
              <p className={`text-xl sm:text-2xl font-black ${netProfit >= 0 ? 'text-teal-400' : 'text-red-500'}`}>
                R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[9px] text-gray-500 block pt-1 border-t border-gray-900/80">
                {netProfit >= 0 ? `Excelente! Margem líquida de ${profitMargin.toFixed(0)}%` : 'Atenção! Custos superam receita'}
              </span>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-teal-500/5 text-5xl font-black select-none pointer-events-none">LUCRO</div>
            </div>

            {/* CAC Payback and ROI card */}
            <div className="bg-[#0b0f19] border border-gray-800 p-5 rounded-xl space-y-1 relative overflow-hidden">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Payback do Investimento (CAC)</span>
              <p className="text-xl sm:text-2xl font-black text-yellow-500">{paybackMonths} {paybackMonths === 1 ? 'Mês' : 'Meses'}</p>
              <span className="text-[9px] text-gray-500 block pt-1 border-t border-gray-900/80">CAC total de R$ {totalCac.toLocaleString('pt-BR')} liquidado rapidamente</span>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-yellow-500/5 text-5xl font-black select-none pointer-events-none">ROI</div>
            </div>
          </div>

          {/* Graphical Growth Analysis simulation */}
          <div className="bg-[#0b0f19] border border-gray-900 rounded-xl p-5 sm:p-6 space-y-4">
            <h4 className="text-xs font-bold font-mono text-gray-400 uppercase tracking-wider">Simulação Visual: Distribuição de Faturamento Mensal (Escala de Custos vs. Lucro)</h4>
            
            <div className="space-y-4">
              {/* Revenue vs Cost horizontal visualization */}
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>LINHA DE CUSTO FIXO (R$ {fixedCosts.toLocaleString('pt-BR')})</span>
                  <span>FATURAMENTO ESTIMADO (R$ {totalGrossRevenue.toLocaleString('pt-BR')})</span>
                </div>
                
                <div className="h-8 w-full bg-gray-950 rounded overflow-hidden flex border border-gray-900 p-1">
                  {/* Fixed costs portion */}
                  <div 
                    style={{ width: `${Math.min(100, (fixedCosts / Math.max(1, totalGrossRevenue + fixedCosts)) * 100)}%` }} 
                    className="h-full bg-red-500/20 border border-red-500/40 rounded flex items-center justify-center text-[9px] text-red-400 font-bold"
                  >
                    OPEX
                  </div>
                  {/* Net profit portion */}
                  {netProfit > 0 ? (
                    <div 
                      style={{ width: `${(netProfit / Math.max(1, totalGrossRevenue + fixedCosts)) * 100}%` }} 
                      className="h-full bg-emerald-500/20 border border-emerald-500/40 rounded ml-1 flex items-center justify-center text-[9px] text-teal-400 font-bold animate-pulse"
                    >
                      LUCRO LÍQUIDO ({profitMargin.toFixed(0)}%)
                    </div>
                  ) : (
                    <div className="flex-1 bg-red-950/40 text-red-500 text-[10px] flex items-center justify-center">
                      Déficit: Adicione mais empresas para cobrir o OPEX
                    </div>
                  )}
                </div>
              </div>

              {/* Insight block */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3 text-xs leading-relaxed">
                <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                <div className="space-y-1 text-gray-300">
                  <strong className="text-amber-500 font-mono text-[11px] uppercase block">ANÁLISE DE VIABILIDADE E PONTO DE EQUILÍBRIO (PREMISSA DE NEGÓCIO DE EXCELÊNCIA)</strong>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      Sua nova premissa de precificação é composta por: 
                      uma <strong>Licença de R$ {baseFee.toLocaleString('pt-BR')}</strong>, 
                      mais <strong>R$ {feePerOS.toLocaleString('pt-BR')} por Ordem de Serviço (OS) ativa</strong>, 
                      e <strong>R$ {feePerItem.toLocaleString('pt-BR')} por documento/item assinado e aprovado</strong>.
                    </p>
                    <p>
                      Sob essa premissa, cada cliente ativo gera um faturamento mensal recorrente (MRR) médio de <strong>R$ {mrrPerClient.toLocaleString('pt-BR')}</strong> (considerando {activeOSPerClient} OS ativa e {requirementsPerClient} documentos assinados/mês).
                    </p>
                    <p className="mt-1">
                      Para cobrir seu custo fixo operacional de <strong>R$ {fixedCosts.toLocaleString('pt-BR')}</strong>, o seu <strong className="text-amber-400">Ponto de Equilíbrio (Break-Even) é de {breakEvenClients} {breakEvenClients === 1 ? 'cliente ativo' : 'clientes ativos'}</strong> por mês.
                    </p>
                    <p className="mt-1 text-gray-400">
                      No cenário de <strong>{clientsCount} clientes ativos</strong>, você fatura <strong>R$ {totalGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, gerando um lucro líquido excepcional de <strong>R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> com margem líquida de <strong className="text-teal-400 font-mono font-bold">{profitMargin.toFixed(1)}%</strong>. O payback de CAC fica em <strong>{paybackMonths} {paybackMonths === 1 ? 'mês' : 'meses'}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTELLECTUAL PROPERTY & DIGITAL NDA AGREEMENTS */}
      {activeTab === 'protection' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* IP protection educational card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold">
                <Shield className="w-5 h-5" />
                <span className="uppercase tracking-wider">Proteção de Negócios e Ideia</span>
              </div>

              <h4 className="text-sm font-bold text-white uppercase font-mono">Como evitar cópias de sua plataforma?</h4>
              
              <div className="space-y-3 text-xs text-gray-400 leading-relaxed leading-normal text-left font-sans">
                <p>
                  Muitos empreendedores têm medo de enviar links de testes para grandes corporações e potenciais clientes com receio de terem suas ideias clonadas por departamentos de TI internos dessas organizações. 
                </p>
                <p>
                  Para mitigar esse risco de forma 100% segura e profissional, existem três pilares de proteção:
                </p>
                
                <ul className="space-y-2 font-mono text-[11px] list-disc pl-4 text-gray-300">
                  <li>
                    <strong className="text-amber-550">1. Termos de Uso e NDA Digital</strong>: Um acordo eletrônico de não-divulgação e sigilo aceito pelo cliente com 1 único clique <em>antes</em> do primeiro acesso ao sistema.
                  </li>
                  <li>
                    <strong className="text-amber-550">2. Patente & Direito de Software</strong>: O código visual, arquitetura e fluxo de 71 quesitos do Piramidy são protegidos pela Lei de Software (Lei Nº 9.609/98).
                  </li>
                  <li>
                    <strong className="text-amber-550">3. Custódia Criptográfica</strong>: Assinar digitalmente as ações cria trilhas de auditoria auditáveis que provam legalmente que eles utilizaram sua tecnologia proprietária.
                  </li>
                </ul>
              </div>

              {/* IP legal certificate banner */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded text-[10px] text-amber-500 font-mono text-left space-y-1">
                <span>🛡️ COMPLIANCE REGULATION STANDARDS MET</span>
                <p className="text-gray-400 font-sans text-[10px] leading-relaxed">
                  Todos os acessos de teste registram endereço IP, hora UTC, identificadores do navegador e cookies de aceitação do termo, servindo como evidência incontestável de autoria em disputas de segredo comercial.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive NDA sign-off simulator */}
          <div className="lg:col-span-7 bg-[#0b0f19] border border-gray-900 rounded-xl p-5 sm:p-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold font-mono text-amber-500 uppercase tracking-wider">Simulador de Acordo de Confidencialidade (NDA)</h4>
              <p className="text-[11px] text-gray-500 font-mono uppercase mt-0.5">Assine acordos fictícios para demonstrar o fluxo de governança legal ao enviar acessos de teste.</p>
            </div>

            {/* Simulated NDA Contract box */}
            <div className="bg-white text-gray-900 p-5 rounded-lg border border-gray-200 text-left space-y-4 text-xs font-sans max-h-64 overflow-y-auto shadow-inner">
              <div className="text-center border-b border-gray-150 pb-2">
                <h5 className="font-bold text-sm tracking-tight">ACORDO DE CONFIDENCIALIDADE E SEGREDO COMERCIAL (NDA)</h5>
                <span className="text-[9px] font-mono text-gray-400">VERSÃO EXCLUSIVA DE HOMOLOGAÇÃO DE PRODUTO v1.26</span>
              </div>
              
              <p className="leading-relaxed">
                Pelo presente instrumento particular, de um lado como PROPRIETÁRIA, <strong>PIRAMID ENERGY S.A.</strong>, e de outro lado como RECEPTORA, a empresa <strong>{selectedNdaClient}</strong>, concordam mutuamente com os termos estabelecidos a seguir:
              </p>
              
              <div className="space-y-2">
                <p>
                  <strong>Cláusula 1ª - Objeto:</strong> O presente acordo visa regular a confidencialidade e proteção da propriedade industrial do protótipo de software <strong>"Piramidy Energy Governance v2.26"</strong>, abrangendo sua lógica operacional, fluxo estrutural de checklist com 71 quesitos regulamentados e o compilador sequencial de databooks técnicos.
                </p>
                <p>
                  <strong>Cláusula 2ª - Não-Uso e Não-Cópia:</strong> A RECEPTORA compromete-se a não replicar, copiar, divulgar, reproduzir em projetos internos, comercializar ou praticar engenharia reversa das telas, do layout ou do fluxo de governança do software apresentado, sob pena de incorrer nas sanções civis e criminais previstas na Lei de Propriedade Industrial (Lei Nº 9.279/96).
                </p>
                <p>
                  <strong>Cláusula 3ª - Rastreamento Digital:</strong> A RECEPTORA declara-se ciente de que as atividades realizadas no ambiente de teste serão registradas com carimbo de tempo inviolável criptográfico de modo a resguardar a propriedade intelectual da PROPRIETÁRIA.
                </p>
              </div>

              <div className="border-t border-gray-150 pt-2 text-center text-[9px] text-gray-400 font-mono">
                * Este documento eletrônico possui validade técnica por meio de assentimento eletrônico auditado.
              </div>
            </div>

            {/* Signature controls */}
            <div className="bg-gray-950 p-4 rounded-lg border border-gray-900 space-y-3 font-mono text-xs text-left">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Preencha para assinar o NDA de demonstração:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 block uppercase">1. Selecionar Cliente de Teste</label>
                  <select 
                    value={selectedNdaClient}
                    onChange={(e) => setSelectedNdaClient(e.target.value)}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="Cliente Demonstração S.A.">Cliente Demonstração S.A.</option>
                    <option value="Empresa Contratante S.A.">Empresa Contratante S.A.</option>
                    <option value="Parceiro Técnico S.A.">Parceiro Técnico S.A.</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 block uppercase">2. Nome e Cargo do Signatário</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Roberto Santos (Engenheiro QA)" 
                    value={ndaSignee}
                    onChange={(e) => setNdaSignee(e.target.value)}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="ndaCheckbox"
                  checked={ndaAgreed}
                  onChange={(e) => setNdaAgreed(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-800 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <label htmlFor="ndaCheckbox" className="text-[11px] text-gray-300 select-none cursor-pointer">
                  Confirmo que li e aceito as cláusulas de confidencialidade em nome da {selectedNdaClient}.
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={!ndaAgreed || isNdaSigningActive}
                  onClick={simulateSignature}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 text-black font-bold rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/5"
                >
                  {isNdaSigningActive ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Criptografando Assinatura ICP...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Assinar NDA Digital & Liberar Acesso</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Signed NDAs Ledger */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold font-mono block uppercase text-left">Controle e Histórico de NDAs Firmados (Ledger):</span>
              <div className="bg-gray-950 border border-gray-900 rounded overflow-hidden font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-900 text-gray-400 text-[10px] border-b border-gray-850">
                      <th className="p-2">ID</th>
                      <th className="p-2">Cliente / Empresa</th>
                      <th className="p-2">Assinante Autorizado</th>
                      <th className="p-2">Data</th>
                      <th className="p-2 text-right">Integridade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850 text-gray-300">
                    {signedNdas.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-900/10">
                        <td className="p-2 font-bold text-amber-500">{n.id}</td>
                        <td className="p-2 text-white font-sans font-bold">{n.client}</td>
                        <td className="p-2 font-sans">{n.signee}</td>
                        <td className="p-2 text-gray-500">{n.date}</td>
                        <td className="p-2 text-right text-[10px]" title={n.hash}>
                          <span className="text-teal-400 bg-teal-400/5 border border-teal-400/20 px-1.5 py-0.5 rounded uppercase">Ativo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMAIL INVITATION GENERATOR */}
      {activeTab === 'invitations' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customizer variables panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold">
                <Mail className="w-5 h-5" />
                <span className="uppercase tracking-wider">Gerador de Convite para Clientes</span>
              </div>

              <p className="text-xs text-gray-400 leading-normal text-left font-sans">
                Personalize os campos abaixo e copie um e-mail de excelente padrão executivo para enviar aos seus contatos de testes.
              </p>

              <div className="space-y-3 font-mono text-xs text-left">
                <div>
                  <label className="text-[10px] text-gray-500 block uppercase">Empresa Alvo (Cliente)</label>
                  <input 
                    type="text" 
                    value={inviteClientName}
                    onChange={(e) => setInviteClientName(e.target.value)}
                    placeholder="Ex: Cliente S.A."
                    className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 block uppercase">Nome do Representante</label>
                  <input 
                    type="text" 
                    value={inviteContactPerson}
                    onChange={(e) => setInviteContactPerson(e.target.value)}
                    placeholder="Ex: Roberto Santos"
                    className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 block uppercase">Estilo do Tom de Voz</label>
                  <div className="grid grid-cols-3 gap-1 mt-1 font-mono text-[10px]">
                    <button
                      onClick={() => setInviteTone('corporate')}
                      className={`py-1.5 border rounded transition cursor-pointer ${
                        inviteTone === 'corporate' 
                          ? 'bg-amber-500 border-amber-500 text-black font-bold' 
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Corporativo
                    </button>
                    <button
                      onClick={() => setInviteTone('direct')}
                      className={`py-1.5 border rounded transition cursor-pointer ${
                        inviteTone === 'direct' 
                          ? 'bg-amber-500 border-amber-500 text-black font-bold' 
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Direto / Rápido
                    </button>
                    <button
                      onClick={() => setInviteTone('collaborative')}
                      className={`py-1.5 border rounded transition cursor-pointer ${
                        inviteTone === 'collaborative' 
                          ? 'bg-amber-500 border-amber-500 text-black font-bold' 
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Cocriação
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/60 p-3.5 border border-gray-850 rounded text-[11px] text-gray-400 leading-normal font-sans text-left">
                💡 <strong>Dica de Sucesso</strong>: Enviar um e-mail estruturado junto ao link de testes demonstra maturidade, segurança jurídica e alta seriedade técnica em Óleo e Gás.
              </div>
            </div>
          </div>

          {/* Email viewer panel */}
          <div className="lg:col-span-8 bg-[#0b0f19] border border-gray-900 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-900">
              <div className="font-mono">
                <span className="text-xs font-bold text-gray-400 block uppercase">E-mail Pronto para Cópia</span>
                <span className="text-[9px] text-gray-500 uppercase">Assunto sugerido: Convite para Homologação e Testes: Piramidy Hub - {inviteClientName}</span>
              </div>
              
              <button
                onClick={() => handleCopyInvite(getInviteEmailBody())}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                {inviteCopied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Copiar E-mail</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulated Email Browser Chrome */}
            <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-900 text-xs font-sans text-left">
              <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-950 font-mono text-[10px] text-gray-400 space-y-1">
                <div><span className="text-gray-650">De:</span> roberto.santos@piramidy.com</div>
                <div><span className="text-gray-650">Para:</span> {inviteContactPerson.toLowerCase().replace(/\s+/g, '.')}@{inviteClientName.toLowerCase().replace(/\s+/g, '').replace(/s\.a\./g, '')}.com.br</div>
                <div><span className="text-gray-650">Assunto:</span> Homologação Digital e Testes de Governança de Qualidade - Piramidy Energy Hub x {inviteClientName}</div>
              </div>
              <div className="p-6 whitespace-pre-wrap text-gray-300 leading-relaxed max-h-96 overflow-y-auto">
                {getInviteEmailBody()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTEGRACAO NFSE SANTOS SP */}
      {activeTab === 'nfse' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Fiscal Settings & Simulation Trigger */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-900">
                <Landmark className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider text-left">
                  {language === 'PT' ? 'Configuração Fiscal - Santos/SP' : 'Fiscal Configuration - Santos/SP'}
                </h3>
              </div>

              {/* Integration Method Toggle */}
              <div className="space-y-1 font-mono text-xs text-left">
                <label className="text-[10px] text-gray-500 uppercase block">
                  {language === 'PT' ? 'Método de Integração' : 'Integration Method'}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1 rounded border border-gray-850">
                  <button
                    onClick={() => { setNfseProvider('gateway'); if (nfseSimulationStep !== -1) setNfseSimulationStep(-1); }}
                    className={`py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      nfseProvider === 'gateway'
                        ? 'bg-amber-500 text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    JSON Gateway (Recomendado)
                  </button>
                  <button
                    onClick={() => { setNfseProvider('direct'); if (nfseSimulationStep !== -1) setNfseSimulationStep(-1); }}
                    className={`py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      nfseProvider === 'direct'
                        ? 'bg-amber-500 text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Santos SOAP XML (ABRASF)
                  </button>
                </div>
              </div>

              {/* Fiscal Form Inputs */}
              <div className="space-y-3 font-mono text-xs text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase block">CNPJ do Prestador</label>
                    <input
                      type="text"
                      value={cnpjPrestador}
                      onChange={(e) => setCnpjPrestador(e.target.value)}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase block">Inscrição Municipal (IM)</label>
                    <input
                      type="text"
                      value={imPrestador}
                      onChange={(e) => setImPrestador(e.target.value)}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase block">Certificado Digital A1</label>
                    <div className="flex items-center gap-1.5 mt-1 bg-gray-900 border border-gray-800 p-2 rounded text-gray-300">
                      <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate text-[10px] text-gray-400">{certificadoA1Name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase block">Senha do Certificado</label>
                    <input
                      type="password"
                      value={certificadoSenha}
                      onChange={(e) => setCertificadoSenha(e.target.value)}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none tracking-widest text-[10px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 uppercase block">Cliente Tomador do Serviço</label>
                  <select
                    value={selectedClientForInvoice}
                    onChange={(e) => setSelectedClientForInvoice(e.target.value)}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="Subsea7 S.A.">Subsea7 S.A. (CNPJ: 44.102.930/0001-55)</option>
                    <option value="Chevron Corp">Chevron Corp (CNPJ: 10.293.848/0001-22)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[9px] text-gray-500 uppercase block">Valor do Serviço (R$)</label>
                    <input
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(parseFloat(e.target.value) || 0)}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] text-gray-500 uppercase block">Alíquota ISS (Santos)</label>
                    <div className="mt-1 bg-gray-900 border border-gray-800 text-gray-400 p-2 rounded text-left flex justify-between">
                      <span>2,0% (Código 01.03)</span>
                      <span className="text-[10px] text-emerald-500 font-bold">Fomento TI</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-500 uppercase block">Discriminação dos Serviços (RPS)</label>
                  <textarea
                    value={invoiceDescription}
                    onChange={(e) => setInvoiceDescription(e.target.value)}
                    rows={2}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none resize-none leading-normal text-[10px]"
                  />
                </div>
              </div>

              {/* Emission Trigger Button */}
              <button
                onClick={triggerNfseEmission}
                disabled={nfseSimulationStep >= 0 && nfseSimulationStep < 3}
                className={`w-full py-3 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow ${
                  nfseSimulationStep >= 0 && nfseSimulationStep < 3
                    ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black active:scale-[0.98]'
                }`}
              >
                <Activity className={`w-4 h-4 shrink-0 ${nfseSimulationStep >= 0 && nfseSimulationStep < 3 ? 'animate-spin text-gray-500' : 'text-black'}`} />
                <span>
                  {nfseSimulationStep >= 0 && nfseSimulationStep < 3
                    ? (language === 'PT' ? 'EMITINDO E PROCESSANDO...' : 'TRANSMITTING & ISSUING...')
                    : (language === 'PT' ? 'EMITIR NFS-e NA PREFEITURA DE SANTOS' : 'ISSUE NFS-e IN SANTOS MUNICIPALITY')}
                </span>
              </button>

              {/* Interactive Status Steps */}
              {nfseSimulationStep >= 0 && (
                <div className="space-y-2 border-t border-gray-900 pt-3">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block text-left font-bold">Fases do Protocolo Municipal</span>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px] text-center">
                    <div className={`p-1.5 rounded border transition-all ${
                      nfseSimulationStep >= 0 ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-gray-900 border-gray-850 text-gray-600'
                    }`}>
                      1. Payload
                    </div>
                    <div className={`p-1.5 rounded border transition-all ${
                      nfseSimulationStep >= 1 ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-gray-900 border-gray-850 text-gray-600'
                    }`}>
                      2. Assina A1
                    </div>
                    <div className={`p-1.5 rounded border transition-all ${
                      nfseSimulationStep >= 2 ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-gray-900 border-gray-850 text-gray-600'
                    }`}>
                      3. SOAP HTTPS
                    </div>
                    <div className={`p-1.5 rounded border transition-all ${
                      nfseSimulationStep >= 3 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-gray-900 border-gray-850 text-gray-600'
                    }`}>
                      4. Emitida
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Explanatory notes */}
            <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-4 space-y-2 text-left">
              <span className="text-[10px] font-bold font-mono text-amber-500 uppercase tracking-widest block">📝 REQUISITOS DE INTEGRAÇÃO EM SANTOS/SP</span>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                A prefeitura de Santos/SP opera sob o padrão de Webservice municipal. Para homologação oficial em ambiente de produção da sua startup, você precisará de:
              </p>
              <ul className="text-[10px] text-gray-400 space-y-1 pl-4 list-disc font-sans leading-normal">
                <li><strong>Certificado Digital e-CNPJ A1</strong> (em formato arquivo .pfx para assinar o lote de RPS digitalmente).</li>
                <li><strong>Liberação de RPS</strong> no sistema municipal de Santos (GissOnline/GINFES).</li>
                <li><strong>Item de Serviço 01.03</strong> (Processamento de dados e licenciamento de softwares) com alíquota de ISS reduzida de 2%.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Code Viewer & Logs & Emitted Invoices */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {/* Realtime Request Viewer */}
            <div className="bg-[#0b0f19] border border-gray-900 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-900">
                <div className="font-mono">
                  <span className="text-xs font-bold text-gray-350 block uppercase">
                    {nfseProvider === 'direct' ? 'Estrutura XML RPS (GissOnline / Santos)' : 'Payload JSON (API Gateway)'}
                  </span>
                  <span className="text-[9px] text-gray-500 uppercase">
                    {nfseProvider === 'direct' ? 'Padrão ABRASF v2.01 com Assinatura Digital ICP-Brasil' : 'JSON Unificado para Gateway de Notas Fiscais'}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-gray-900 border border-gray-800 text-amber-500 px-2 py-0.5 rounded uppercase">
                  {nfseProvider === 'direct' ? 'Direct SOAP' : 'REST JSON'}
                </span>
              </div>

              {/* Code viewer browser chrome */}
              <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-900 text-xs font-mono">
                <div className="bg-gray-900/50 px-4 py-1.5 border-b border-gray-950 text-[10px] text-gray-400 flex justify-between items-center">
                  <span>{nfseProvider === 'direct' ? 'santos_schema_abrasf_v2.xml' : 'focus_nfe_request.json'}</span>
                  <span className="text-[9px] text-emerald-500 font-bold">● Pronto para envio</span>
                </div>
                <div className="p-4 overflow-x-auto text-[10px] text-gray-300 leading-relaxed max-h-56 scrollbar-thin scrollbar-thumb-gray-800">
                  <pre className="whitespace-pre">{getNfseRequestPayload()}</pre>
                </div>
              </div>
            </div>

            {/* Step-by-Step Simulation Live Console */}
            {nfseSimulationStep >= 0 && (
              <div className="bg-[#0b0f19] border border-gray-900 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-400 border-b border-gray-900 pb-1.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    LOGS DE EXECUÇÃO EM TEMPO REAL
                  </span>
                  <span>PREFEITURA DE SANTOS SP</span>
                </div>
                <div className="space-y-1 font-mono text-[10px] bg-gray-950 p-3 rounded border border-gray-900 max-h-36 overflow-y-auto leading-relaxed">
                  {nfseSimulationLogs.map((log, idx) => (
                    <div key={idx} className={log.startsWith('✔') ? 'text-emerald-400 font-bold' : 'text-amber-500'}>
                      [{new Date().toLocaleTimeString()}] {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Emitted Invoices */}
            <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-900">
                <div className="font-mono">
                  <span className="text-xs font-bold text-white block uppercase">Histórico de NFS-e Emitidas (Santos/SP)</span>
                  <span className="text-[9px] text-gray-500 uppercase">Notas homologadas e registradas no lote de RPS municipal</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500">{emittedInvoices.length} Ativas</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {emittedInvoices.map((inv) => (
                  <div key={inv.id} className="bg-gray-900/60 border border-gray-850 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold uppercase text-[11px]">NFS-e Nº {inv.nfseNum}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded">Emitida</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Cliente: <strong className="text-gray-300">{inv.client}</strong> | Data: {inv.date} | RPS: {inv.rpsNum}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-end gap-2 sm:gap-1 text-right w-full sm:w-auto">
                      <span className="text-amber-500 font-bold block">R$ {inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            alert(`Visualização de Espelho da NFS-e Santos/SP\nNota: ${inv.nfseNum}\nPrestador CNPJ: ${cnpjPrestador}\nCliente: ${inv.client}\nValor: R$ ${inv.value.toFixed(2)}\nCódigo de Autenticação: ${inv.code}\n\nNota registrada e assinada digitalmente com sucesso.`);
                          }}
                          className="text-[9px] text-gray-400 hover:text-white transition underline cursor-pointer"
                        >
                          Visualizar PDF
                        </button>
                        <span className="text-gray-700">|</span>
                        <button
                          onClick={() => {
                            alert(`XML do Lote RPS correspondente a nota municipal ${inv.nfseNum} foi assinado digitalmente usando chave privada e baixado com sucesso.`);
                          }}
                          className="text-[9px] text-gray-400 hover:text-white transition underline cursor-pointer"
                        >
                          Baixar XML
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ERP & PROJECT MANAGEMENT INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="bg-[#0b0f19] border border-gray-900 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[11px] font-bold font-sans">
                <Network className="w-4 h-4 animate-pulse" />
                <span className="uppercase tracking-wider">Centro de Integrações Governamentais</span>
              </div>
              <h3 className="text-lg font-bold text-white uppercase font-sans">
                {language === 'PT' ? 'Conexão Nativa com ERPs e Ferramentas de Projetos' : 'ERP & Project Management Integrations'}
              </h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                {language === 'PT' 
                  ? 'Sincronize automaticamente os dados de auditoria, checklists metrológicos e status de conformidade regulamentar com os principais sistemas de gestão do mercado.'
                  : 'Automatically sync compliance audits, metrological checklists, and certification status directly with market-leading corporate platforms.'}
              </p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-md text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Gateway Online
              </div>
            </div>
          </div>

          {/* System Selection Horizontal Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'sap', name: 'SAP PM & QM', desc: 'Plant Maintenance', logo: '⚙️' },
              { id: 'totvs', name: 'TOTVS Protheus', desc: 'REST API OS Sync', logo: '💼' },
              { id: 'jira', name: 'Jira Software', desc: 'Atlassian Tasks', logo: '🌐' },
              { id: 'msproject', name: 'MS Project', desc: 'WBS & Cronograma', logo: '📊' }
            ].map((system) => {
              const isSelected = selectedIntegrationSystem === system.id;
              return (
                <button
                  key={system.id}
                  onClick={() => {
                    setSelectedIntegrationSystem(system.id as any);
                    if (syncStep !== -1) setSyncStep(-1);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex gap-3 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-500 shadow-md' 
                      : 'bg-gray-950/40 border-gray-900 text-gray-400 hover:bg-gray-900/30'
                  }`}
                >
                  <span className="text-2xl mt-0.5 select-none">{system.logo}</span>
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold block font-mono uppercase tracking-wide ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {system.name}
                    </span>
                    <span className="text-[10px] text-gray-500 block font-sans leading-tight">
                      {system.desc}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 flex items-center justify-center rounded-bl-lg">
                      <Check className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            {/* Left Panel: Parameters Setup */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-900">
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                    {language === 'PT' ? 'Configuração do Gateway de Rede' : 'Gateway Connection Settings'}
                  </span>
                </div>

                {/* DYNAMIC SYSTEM FORMS */}
                {selectedIntegrationSystem === 'sap' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">SAP Host (Application Server)</label>
                      <input 
                        type="text" 
                        value={sapHost}
                        onChange={(e) => setSapHost(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[10px] text-gray-500 block uppercase">System Num</label>
                        <input 
                          type="text" 
                          value={sapSysNum}
                          onChange={(e) => setSapSysNum(e.target.value)}
                          className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-gray-500 block uppercase">Mandante (Client)</label>
                        <input 
                          type="text" 
                          value={sapClientNum}
                          onChange={(e) => setSapClientNum(e.target.value)}
                          className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-gray-500 block uppercase">Notif. Type</label>
                        <select 
                          value={sapNotificationType}
                          onChange={(e) => setSapNotificationType(e.target.value)}
                          className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none cursor-pointer"
                        >
                          <option value="M1">M1 (Manutenção)</option>
                          <option value="QM">Q1 (Reclamação Qualidade)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">Função RFC / BAPI SAP</label>
                      <input 
                        type="text" 
                        value={sapRfcFunction}
                        onChange={(e) => setSapRfcFunction(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">ID Equipamento Associado (SAP QM)</label>
                      <select 
                        value={sapEquipmentId}
                        onChange={(e) => setSapEquipmentId(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-200 p-2 rounded focus:outline-none cursor-pointer"
                      >
                        <option value="EQ-3091_SDV_VALVE">EQ-3091_SDV_VALVE (Válvula Atuadora Principal)</option>
                        <option value="EQ-8002_CENTRIF_PUMP">EQ-8002_CENTRIF_PUMP (Bomba Centrífuga Subsea)</option>
                        <option value="EQ-9112_FLOW_METER">EQ-9112_FLOW_METER (Medidor de Fluxo Metrológico)</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedIntegrationSystem === 'totvs' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">TOTVS REST Endpoint URL</label>
                      <input 
                        type="text" 
                        value={totvsApiUrl}
                        onChange={(e) => setTotvsApiUrl(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">Token de Autenticação JWT</label>
                      <input 
                        type="password" 
                        value={totvsToken}
                        onChange={(e) => setTotvsToken(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none tracking-widest"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block uppercase">Rotina ADVPL (Protheus)</label>
                        <input 
                          type="text" 
                          value={totvsRoutine}
                          onChange={(e) => setTotvsRoutine(e.target.value)}
                          className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block uppercase">Schema da Base</label>
                        <input 
                          type="text" 
                          value={totvsSchema}
                          onChange={(e) => setTotvsSchema(e.target.value)}
                          className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntegrationSystem === 'jira' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">Atlassian Cloud URL</label>
                      <input 
                        type="text" 
                        value={jiraUrl}
                        onChange={(e) => setJiraUrl(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block uppercase">Chave de Projeto Jira</label>
                        <input 
                          type="text" 
                          value={jiraProjectKey}
                          onChange={(e) => setJiraProjectKey(e.target.value)}
                          className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block uppercase">Tipo do Chamado</label>
                        <select 
                          value={jiraIssueType}
                          onChange={(e) => setJiraIssueType(e.target.value as any)}
                          className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none cursor-pointer"
                        >
                          <option value="Bug">Bug (Erro de Requisito)</option>
                          <option value="Task">Tarefa (Inspeção Técnica)</option>
                          <option value="Incident">Incidente de Conformidade</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">Atlassian API Personal Access Token</label>
                      <input 
                        type="password" 
                        value={jiraToken}
                        onChange={(e) => setJiraToken(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none tracking-widest"
                      />
                    </div>
                  </div>
                )}

                {selectedIntegrationSystem === 'msproject' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">Método de Sincronização</label>
                      <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1 rounded border border-gray-850">
                        <button
                          onClick={() => setMsProjectMode('xml_import')}
                          className={`py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            msProjectMode === 'xml_import' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Manual XML Import
                        </button>
                        <button
                          onClick={() => setMsProjectMode('rest_online')}
                          className={`py-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            msProjectMode === 'rest_online' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          REST API Cloud
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block uppercase">Nome do Arquivo de Cronograma (.xml)</label>
                      <input 
                        type="text" 
                        value={msProjectFileName}
                        onChange={(e) => setMsProjectFileName(e.target.value)}
                        className="mt-1 w-full bg-gray-900 border border-gray-800 text-gray-250 p-2 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Connection Check & Execution Trigger */}
                <button
                  onClick={triggerIntegrationSync}
                  disabled={isSyncing}
                  className={`w-full py-3 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow ${
                    isSyncing
                      ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black active:scale-[0.98]'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin text-gray-500' : 'text-black'}`} />
                  <span>
                    {isSyncing 
                      ? (language === 'PT' ? 'EXECUTANDO HANDSHAKE...' : 'SYNCHRONIZING...')
                      : (language === 'PT' 
                          ? `INICIAR INTEGRAÇÃO ${selectedIntegrationSystem.toUpperCase()}` 
                          : `START ${selectedIntegrationSystem.toUpperCase()} SYNC`
                        )
                    }
                  </span>
                </button>

                {/* Live Process Map */}
                {isSyncing && (
                  <div className="space-y-2 border-t border-gray-900 pt-3">
                    <span className="text-[10px] text-gray-500 font-mono uppercase block text-left font-bold">Fases da Sincronização Ativa</span>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px] text-center">
                      <div className={`p-1.5 rounded border transition-all ${
                        syncStep >= 0 ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-gray-900 border-gray-850 text-gray-600'
                      }`}>
                        1. Handshake
                      </div>
                      <div className={`p-1.5 rounded border transition-all ${
                        syncStep >= 1 ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-gray-900 border-gray-850 text-gray-600'
                      }`}>
                        2. Schema
                      </div>
                      <div className={`p-1.5 rounded border transition-all ${
                        syncStep >= 2 ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-gray-900 border-gray-850 text-gray-600'
                      }`}>
                        3. Transfer
                      </div>
                      <div className={`p-1.5 rounded border transition-all ${
                        syncStep >= 3 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-gray-900 border-gray-850 text-gray-600'
                      }`}>
                        4. Sucesso
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Advisory */}
              <div className="bg-gray-950/45 border border-gray-900 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold font-mono text-amber-500 uppercase tracking-widest block">🔒 CRIPTOGRAFIA E ISOLAMENTO DE DADOS</span>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  {language === 'PT'
                    ? 'Todas as conexões do Piramid Energy Hub com gateways corporativos usam chaves de encriptação TLS 1.3 e protocolo WS-Security ou OAuth 2.0 seguro. Nossos payloads transportam as assinaturas ICP-Brasil qualificadas dos inspetores como metadados imutáveis para garantir rastreabilidade total.'
                    : 'All endpoint handshakes with external corporate gateways enforce TLS 1.3 encryption and secure OAuth 2.0 authorization schemes. Auditor credentials and ICP-Brasil digital hashes are carried as immutable metadata headers.'}
                </p>
              </div>
            </div>

            {/* Right Panel: Execution Console & Synced Assets */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              {/* Terminal Style Logs */}
              <div className="bg-[#0b0f19] border border-gray-900 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-900 font-mono">
                  <div>
                    <span className="text-xs font-bold text-gray-300 block uppercase font-sans">Console de Sincronização do Gateway</span>
                    <span className="text-[9px] text-gray-500 uppercase">Monitoramento de requisições e respostas em tempo real</span>
                  </div>
                  <span className="text-[10px] bg-gray-900 border border-gray-800 text-amber-500 px-2 py-0.5 rounded uppercase">
                    API v2.1-NET
                  </span>
                </div>

                <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-900 font-mono text-xs">
                  <div className="bg-gray-900/50 px-4 py-1.5 border-b border-gray-950 text-[10px] text-gray-400 flex justify-between items-center">
                    <span>gateway_agent_logs.stdout</span>
                    <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Pronto para Conexão
                    </span>
                  </div>
                  
                  <div className="p-4 overflow-y-auto text-[10px] text-gray-300 leading-relaxed min-h-[144px] max-h-48 scrollbar-thin scrollbar-thumb-gray-800 font-mono">
                    {syncStep === -1 ? (
                      <div className="text-gray-500 italic text-center py-8">
                        Selecione as variáveis ao lado e clique em "INICIAR INTEGRAÇÃO" para rodar a simulação do protocolo de rede.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {syncLogs.map((log, idx) => (
                          <div key={idx} className={log.startsWith('✔') ? 'text-emerald-400 font-bold' : 'text-amber-500'}>
                            [{new Date().toLocaleTimeString()}] {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Database Table of Synced Items */}
              <div className="bg-gray-950/60 border border-gray-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-900 font-mono">
                  <div>
                    <span className="text-xs font-bold text-white block uppercase font-sans">
                      {selectedIntegrationSystem === 'sap' && 'Locais Técnicos Mapeados no SAP PM'}
                      {selectedIntegrationSystem === 'totvs' && 'Ordens de Serviço Conciliadas no TOTVS'}
                      {selectedIntegrationSystem === 'jira' && 'Issues de Qualidade Criadas no Jira'}
                      {selectedIntegrationSystem === 'msproject' && 'Linha de Base do MS Project Sync'}
                    </span>
                    <span className="text-[9px] text-gray-500 uppercase font-sans">
                      Chaves de integridade integradas diretamente entre as bases
                    </span>
                  </div>
                  
                  <span className="text-xs font-mono font-bold text-amber-500 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {selectedIntegrationSystem === 'sap' && `${sapMappedLocations.length} Mapeados`}
                    {selectedIntegrationSystem === 'totvs' && `${totvsSyncedOS.length} Conciliados`}
                    {selectedIntegrationSystem === 'jira' && `${jiraIssues.length} Ativas`}
                    {selectedIntegrationSystem === 'msproject' && `${msProjectTimeline.length} Atividades`}
                  </span>
                </div>

                {/* DYNAMIC INTEGRATIONS TABLES */}
                <div className="overflow-x-auto">
                  {selectedIntegrationSystem === 'sap' && (
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-900/80 text-gray-400 text-[10px] border-b border-gray-850">
                          <th className="p-2">ID Reg</th>
                          <th className="p-2">Local Técnico (SAP PM)</th>
                          <th className="p-2">Equipamento Vinculado</th>
                          <th className="p-2 text-right font-sans">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850 text-gray-300">
                        {sapMappedLocations.map((loc) => (
                          <tr key={loc.id} className="hover:bg-gray-900/10">
                            <td className="p-2 font-bold text-amber-500">{loc.id}</td>
                            <td className="p-2 text-white font-bold">{loc.techLoc}</td>
                            <td className="p-2 text-gray-450">{loc.equipment}</td>
                            <td className="p-2 text-right">
                              <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded uppercase font-sans">
                                {loc.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedIntegrationSystem === 'totvs' && (
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-900/80 text-gray-400 text-[10px] border-b border-gray-850">
                          <th className="p-2">Chave OS</th>
                          <th className="p-2">ERP TOTVS ID</th>
                          <th className="p-2">Cliente</th>
                          <th className="p-2 font-sans">Serviço/Inspeção</th>
                          <th className="p-2 text-right font-sans">Integração</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850 text-gray-300">
                        {totvsSyncedOS.map((os) => (
                          <tr key={os.id} className="hover:bg-gray-900/10">
                            <td className="p-2 font-bold text-amber-500">{os.id}</td>
                            <td className="p-2 text-white font-bold">{os.totvsId}</td>
                            <td className="p-2 text-gray-450">{os.client}</td>
                            <td className="p-2 text-gray-400 font-sans">{os.serviceType}</td>
                            <td className="p-2 text-right">
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase font-bold font-sans">
                                {os.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedIntegrationSystem === 'jira' && (
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-900/80 text-gray-400 text-[10px] border-b border-gray-850">
                          <th className="p-2">Ref</th>
                          <th className="p-2">Jira Task Key</th>
                          <th className="p-2 font-sans">Quesito / Requisito Auditado</th>
                          <th className="p-2 font-sans">Prioridade</th>
                          <th className="p-2 text-right font-sans">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850 text-gray-300">
                        {jiraIssues.map((issue) => (
                          <tr key={issue.id} className="hover:bg-gray-900/10">
                            <td className="p-2 font-bold text-gray-500">{issue.id}</td>
                            <td className="p-2 text-cyan-400 font-bold hover:underline cursor-pointer">
                              <a href={`${jiraUrl}/browse/${issue.jiraKey}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-sans text-[11px]">
                                {issue.jiraKey}
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="p-2 text-white truncate max-w-xs">{issue.checklistItem}</td>
                            <td className="p-2">
                              <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded uppercase font-sans font-bold">
                                {issue.priority}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              <span className="text-[9px] bg-amber-500/15 text-amber-500 border border-amber-500/35 px-1.5 py-0.2 rounded uppercase font-sans font-bold">
                                {issue.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedIntegrationSystem === 'msproject' && (
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-900/80 text-gray-400 text-[10px] border-b border-gray-850">
                          <th className="p-2 font-sans">Atividade do Cronograma</th>
                          <th className="p-2 font-sans">Seção Mapeada</th>
                          <th className="p-2 font-sans">Início</th>
                          <th className="p-2 font-sans">Término</th>
                          <th className="p-2 text-right font-sans">Progresso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850 text-gray-300">
                        {msProjectTimeline.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-900/10">
                            <td className="p-2 text-white font-bold font-sans">{item.task}</td>
                            <td className="p-2 text-amber-500 font-sans">{item.mappedItem}</td>
                            <td className="p-2 text-gray-400">{item.start}</td>
                            <td className="p-2 text-gray-400">{item.finish}</td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-12 bg-gray-900 h-1 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full" style={{ width: `${item.progress}%` }}></div>
                                </div>
                                <span className="text-[10px] text-gray-300 font-bold">{item.progress}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FINANCEIRO & BLOQUEIOS (INVOICE GUARD) */}
      {activeTab === 'invoice-guard' && (
        <div className="space-y-6">
          
          {/* Section banner */}
          <section className="bg-gray-900/40 p-5 border border-gray-800 rounded-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-red-500 shrink-0" />
                  {language === 'PT' ? 'Módulo Invoice Guard: Segurança Financeira & Compliance' : 'Invoice Guard: Billing Security & Lock Compliance'}
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-3xl">
                  {language === 'PT'
                    ? 'Regulamento automático de conformidade: bloqueio automático de emissões técnicas, uploads de PDF e compilação de Databooks se houver faturas com atraso superior a 10 dias. Inclui alertas de cobrança por e-mail.'
                    : 'Automated billing policy: restricts technical document registrations, PDF uploads, and Databook compiling for accounts with past-due invoices over 10 days.'}
                </p>
              </div>
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded font-mono font-bold uppercase tracking-wider">
                {language === 'PT' ? 'Failsafe de Código Ativo' : 'Active Code Failsafe'}
              </span>
            </div>

            {/* Explainer Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-gray-950/60 border border-gray-900 rounded-lg space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">
                  {language === 'PT' ? 'Regra de Tolerância' : 'Grace Period Rule'}
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {language === 'PT'
                    ? 'A tolerância máxima para quitação de faturas vencidas é de 10 dias. No 11º dia de inadimplência, o sistema suspende as operações automaticamente.'
                    : 'Past due invoices exceeding 10 days of grace period trigger an automatic digital lock across all project and emission views.'}
                </p>
              </div>

              <div className="p-4 bg-gray-950/60 border border-gray-900 rounded-lg space-y-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-red-400" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">
                  {language === 'PT' ? 'Bloqueio de Emissões' : 'Digital Lockdown'}
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {language === 'PT'
                    ? 'O bloqueio é executado diretamente na camada de UI/UX e de validação do Checklist e Databook, prevenindo a entrega e chancelas de engenharia.'
                    : 'Direct security seals on Checklist (uploads/digital signatures) and Databook compilation pages prevent code exploitation.'}
                </p>
              </div>

              <div className="p-4 bg-gray-950/60 border border-gray-900 rounded-lg space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">
                  {language === 'PT' ? 'Alertas por E-mail' : 'Email Alerts'}
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {language === 'PT'
                    ? 'Alertas de cobrança automáticos e disparos de segurança preventivos notificam os clientes no vencimento das faturas.'
                    : 'Compliance warning emails are triggered dynamically at expiration dates to notify active clients about due invoices.'}
                </p>
              </div>
            </div>
          </section>

          {/* Interactive Control Dashboard: 2 column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column 1: Invoice Management Ledger */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                  <h4 className="text-xs font-bold text-gray-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-500" />
                    {language === 'PT' ? 'Livro de Registro de Faturas de Clientes' : 'Client Invoices & Billing Ledger'}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {invoices.length} {language === 'PT' ? 'faturas mapeadas' : 'invoices mapped'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-900/60 text-gray-400 text-[10px] border-b border-gray-850">
                        <th className="p-3">Ref / ID</th>
                        <th className="p-3">{language === 'PT' ? 'Empresa' : 'Company'}</th>
                        <th className="p-3 text-right">{language === 'PT' ? 'Valor (Licença/OS/Docs)' : 'Amount'}</th>
                        <th className="p-3">{language === 'PT' ? 'Vencimento' : 'Due Date'}</th>
                        <th className="p-3 text-center">{language === 'PT' ? 'Atraso' : 'Overdue'}</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right font-sans">{language === 'PT' ? 'Ações Administrativas' : 'Administrative Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 text-gray-300">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-gray-500 italic">
                            {language === 'PT' ? 'Nenhuma fatura registrada no banco.' : 'No invoices mapped in the system.'}
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv) => {
                          const dueDate = new Date(inv.dueDate);
                          const today = new Date();
                          const isOverdue = inv.status === 'PENDING' && dueDate < today;
                          const delayDays = isOverdue 
                            ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) 
                            : 0;
                          const isPastTenDays = delayDays > 10;

                          return (
                            <tr key={inv.id} className="hover:bg-gray-900/20">
                              <td className="p-3 font-bold text-amber-500 font-mono">{inv.id}</td>
                              <td className="p-3">
                                <div>
                                  <p className="font-bold text-white font-sans">{inv.companyName}</p>
                                  <p className="text-[9px] text-gray-500 mt-0.5 uppercase">
                                    {language === 'PT' ? 'Chave: ' : 'ID: '}{inv.companyId}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3 text-right text-white font-bold font-mono">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount)}
                              </td>
                              <td className="p-3 text-gray-400">
                                {new Date(inv.dueDate).toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US')}
                              </td>
                              <td className="p-3 text-center">
                                {isOverdue ? (
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isPastTenDays ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-amber-950 text-amber-400'
                                  }`}>
                                    {delayDays} {language === 'PT' ? 'dias' : 'days'}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {inv.status === 'PAID' ? (
                                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 mx-auto w-16">
                                    <Check className="w-3 h-3" />
                                    {language === 'PT' ? 'PAGO' : 'PAID'}
                                  </span>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 mx-auto w-16 ${
                                    isPastTenDays 
                                      ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse' 
                                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  }`}>
                                    <AlertTriangle className="w-3 h-3" />
                                    {language === 'PT' ? 'ABERTO' : 'DUE'}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end items-center gap-2">
                                  {/* Send Email Alert Trigger Button */}
                                  <button
                                    onClick={() => {
                                      onSendInvoiceAlert(inv.id);
                                      setAlertToast({
                                        message: language === 'PT'
                                          ? `✓ E-mail de cobrança disparado com sucesso para o cliente ${inv.companyName}!`
                                          : `✓ Email warning triggered successfully to client ${inv.companyName}!`,
                                        type: 'success'
                                      });
                                      setTimeout(() => setAlertToast(null), 4000);
                                    }}
                                    className="p-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/30 rounded transition cursor-pointer"
                                    title={language === 'PT' ? 'Disparar Alerta de E-mail' : 'Send Warning Email'}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Toggle Paid/Due simulation button */}
                                  <button
                                    onClick={() => {
                                      const nextStatus = inv.status === 'PAID' ? 'PENDING' : 'PAID';
                                      onUpdateInvoiceStatus(inv.id, nextStatus);
                                      setAlertToast({
                                        message: language === 'PT'
                                          ? `✓ Fatura ${inv.id} atualizada para ${nextStatus === 'PAID' ? 'PAGO' : 'ABERTO'}!`
                                          : `✓ Invoice ${inv.id} updated to ${nextStatus}!`,
                                        type: 'info'
                                      });
                                      setTimeout(() => setAlertToast(null), 4000);
                                    }}
                                    className={`px-2 py-1 text-[10px] font-bold font-mono rounded border transition cursor-pointer ${
                                      inv.status === 'PAID'
                                        ? 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-850'
                                        : 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-600'
                                    }`}
                                  >
                                    {inv.status === 'PAID' 
                                      ? (language === 'PT' ? 'Estornar' : 'Unpay') 
                                      : (language === 'PT' ? 'Quitar' : 'Pay')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-950/10 border border-amber-900/30 rounded p-3 text-[11px] text-amber-500 font-mono leading-relaxed">
                  <strong>💡 {language === 'PT' ? 'Dica de Teste do Simulador:' : 'Developer Test Tip:'}</strong>{' '}
                  {language === 'PT'
                    ? 'Mude o status de pagamento da fatura vencida do cliente "Chevron Corp" para simular a revogação instantânea e automática do bloqueio no Checklist e Databook!'
                    : 'Toggle the Chevron Corp overdue invoice status to test how the global block is instantly revoked or applied across the workspace.'}
                </div>
              </div>
            </div>

            {/* Column 2: Manual Blocking Override Control */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-5 space-y-4">
                <div className="border-b border-gray-900 pb-3">
                  <h4 className="text-xs font-bold text-gray-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-red-500 animate-pulse" />
                    {language === 'PT' ? 'Botão de Bloqueio Manual' : 'Manual Lock Overrides'}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {language === 'PT'
                      ? 'Bloqueie temporariamente qualquer empresa manualmente com um clique.'
                      : 'Force an instant administrative lockdown on any company profile.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {companies.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                      {language === 'PT' ? 'Nenhuma empresa cadastrada.' : 'No companies registered.'}
                    </p>
                  ) : (
                    companies.map((co) => {
                      const isAutoBlocked = invoices.some(
                        inv => inv.companyId === co.id && inv.status === 'PENDING' && (
                          (new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24) > 10
                        )
                      );
                      const isCurrentlyBlocked = isAutoBlocked || co.isManualBlock || co.isBlocked;

                      return (
                        <div 
                          key={co.id} 
                          className="p-3 bg-[#111827] border border-gray-800 rounded-lg flex flex-col gap-2.5"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-xs font-bold text-white font-sans">{co.name}</p>
                              <p className="text-[9px] text-gray-500 font-mono uppercase mt-0.5">{co.id}</p>
                            </div>
                            
                            {/* Overall block status tag */}
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono uppercase shrink-0 ${
                              isCurrentlyBlocked 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {isCurrentlyBlocked 
                                ? (language === 'PT' ? '🔒 BLOQUEADO' : '🔒 BLOCKED') 
                                : (language === 'PT' ? '✓ NORMAL' : '✓ OK')}
                            </span>
                          </div>

                          {/* Reason breakdown */}
                          {isCurrentlyBlocked && (
                            <p className="text-[10px] text-red-400 bg-red-950/20 border border-red-900/30 rounded p-1.5 font-mono text-left">
                              <strong>{language === 'PT' ? 'Motivo: ' : 'Reason: '}</strong>
                              {co.isManualBlock 
                                ? (co.blockReason || (language === 'PT' ? 'Bloqueio administrativo manual.' : 'Manual admin override.'))
                                : isAutoBlocked 
                                  ? (language === 'PT' ? 'Inadimplência acumulada superior a 10 dias.' : 'Past due payments past 10 days.')
                                  : (language === 'PT' ? 'Suspensão de conta.' : 'Account suspension.')}
                            </p>
                          )}

                          {/* Manual Override Action Button */}
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                onToggleManualBlock(co.id);
                                setAlertToast({
                                  message: language === 'PT'
                                    ? `✓ Bloqueio manual alterado com sucesso para a empresa ${co.name}!`
                                    : `✓ Manual override toggled successfully for company ${co.name}!`,
                                  type: 'info'
                                });
                                setTimeout(() => setAlertToast(null), 4000);
                              }}
                              className={`w-full py-1.5 text-[10px] font-bold uppercase font-mono rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                co.isManualBlock
                                  ? 'bg-amber-500 text-black hover:bg-amber-600'
                                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                              }`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              {co.isManualBlock 
                                ? (language === 'PT' ? 'Suspender Bloqueio Manual' : 'Release Manual Lock') 
                                : (language === 'PT' ? 'Forçar Bloqueio Manual' : 'Trigger Manual Lock')}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Security policy guidelines card */}
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-5 space-y-3">
                <h5 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">
                  {language === 'PT' ? 'Políticas de Cobrança B2B' : 'B2B Debt Recovery Guidelines'}
                </h5>
                <ul className="text-[10px] text-gray-400 space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
                  <li>
                    {language === 'PT'
                      ? 'As faturas expiram na data exata de vencimento declarada no contrato de licenciamento.'
                      : 'Invoices expire on the exact due date specified in the SaaS license contract.'}
                  </li>
                  <li>
                    {language === 'PT'
                      ? 'Durante 10 dias corridos, notificações diárias são despachadas por e-mail automaticamente.'
                      : 'During the 10-day grace period, warning triggers notify administrative staff.'}
                  </li>
                  <li>
                    {language === 'PT'
                      ? 'No 11º dia de atraso, o motor de conciliação executa a trava eletrônica global.'
                      : 'On the 11th day, the platform engine deploys the global block lock across modules.'}
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
