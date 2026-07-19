import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  BookOpen, Plus, Search, FileText, Sliders, Edit3, Trash2, 
  RotateCcw, Check, CheckSquare, Info, ShieldAlert, Award, 
  Eye, CornerDownRight, X, Layers, Upload, Paperclip
} from 'lucide-react';

export interface InspectionProcedure {
  id: string;
  code: string;
  titlePt: string;
  titleEn: string;
  titleEs: string;
  type: 'RECEIVING' | 'WELDING' | 'NDT' | 'PRESSURE' | 'CIVIL' | 'GENERAL';
  standard: string; // e.g. ASME IX, AWS D1.1
  objectivePt: string;
  objectiveEn: string;
  objectiveEs: string;
  stepsPt: string[];
  stepsEn: string[];
  stepsEs: string[];
  instrumentsPt: string[];
  instrumentsEn: string[];
  instrumentsEs: string[];
  linkedDocs: string[]; // checklist item codes linked, e.g. ["SUMA-27", "SUMA-28"]
  uploadedFiles?: Array<{ id: string; name: string; size: string; uploadedAt: string }>;
}

const DEFAULT_PROCEDURES: InspectionProcedure[] = [
  {
    id: 'proc-1',
    code: 'PROC-QI-M-01',
    titlePt: 'Procedimento para Recebimento de Tubulações e Spools',
    titleEn: 'Piping & Spools Receiving Inspection Procedure',
    titleEs: 'Procedimiento para Recepción de Tuberías y Spools',
    type: 'RECEIVING',
    standard: 'ASME B36.10M / ASTM A106 Gr. B',
    objectivePt: 'Definir os critérios e diretrizes sistemáticas para inspeção dimensional, física e validação de rastreabilidade rasteira de tubulações e spools de aço carbono recebidos.',
    objectiveEn: 'Define systematic criteria and guidelines for dimensional, physical and material traceability verification of received carbon steel piping and spooled components.',
    objectiveEs: 'Definir los criterios y lineamientos sistemáticos para la inspección dimensional, física y validación de trazabilidad de tuberías y spools de acero al carbono recibidos.',
    stepsPt: [
      'Verificar a integridade geral do lote entregue contra a listagem do romaneio físico.',
      'Identificar as gravações de puncionamento correspondentes às corridas térmicas diretamente no metal de base contíguo.',
      'Aferiçao dimensional: conferir diâmetro nominal externo, espessura interna de parede com micrômetro calibrado e grau de ovalização.',
      'Validar integridade superficial buscando riscos profundos, mossas mecânicas severas ou oxidação severa.'
    ],
    stepsEn: [
      'Verify the overall batch integrity against physical delivery invoices.',
      'Identify critical heat number stamps punched directly on contiguous base metal.',
      'Dimensional tooling checks: record nominal outer profile, wall thickness using micrometer, and ovality rates.',
      'Audit surface integrity screening for mechanical damage, flat spots, or scale build-up.'
    ],
    stepsEs: [
      'Verificar la integridad general del lote entregado contra el remito físico de entrega.',
      'Identificar la grabación de colada troquelada directamente sobre el metal base original.',
      'Verificación dimensional: comparar diámetro exterior nominal, espesor de pared mediante micrómetro calibrado y ovalamiento.',
      'Auditar integridad superficial verificando la inexistencia de averías mecánicas o corrosión severa.'
    ],
    instrumentsPt: ['Trena metálica calibrada', 'Micrômetro de espessura de tubos', 'Paquímetro com certificado RBC', 'Luz artificial auxiliar de inspeção'],
    instrumentsEn: ['Calibrated tape measure', 'Tube wall thickness micrometer', 'RBC certified caliper', 'Auxiliary inspection flashlight'],
    instrumentsEs: ['Cinta métrica calibrada', 'Micrómetro de espesor de pared de tubos', 'Calibre pie de rey certificado RBC', 'Luz auxiliar de alta potencia'],
    linkedDocs: ['SUMA-25', 'SUMA-41']
  },
  {
    id: 'proc-2',
    code: 'PROC-QI-W-02',
    titlePt: 'Inspeção Visual e Metrológica de Juntas de Soldas',
    titleEn: 'Visual & Metrological Weld Joint Audit Procedure',
    titleEs: 'Inspección Visual y Metrológica de Juntas de Soldadura',
    type: 'WELDING',
    standard: 'ASME Sect. IX / AWS D1.1 / ASME B31.3',
    objectivePt: 'Padronizar as vistorias visuais de preparação, acoplamento e conformação geométrica definitiva dos cordões de solda de tubulação industrial.',
    objectiveEn: 'Standardize visual surveys regarding general preparation, fit-up, and definitive geometric conformity of industrial piping weld beads.',
    objectiveEs: 'Estandarizar el relevamiento visual de preparación de chaflán, alineación y conformación geométrica definitiva del cordón de tubería industrial.',
    stepsPt: [
      'Medir o ângulo do chanfro e ângulo de embicamento, buscando atingir 37.5° regulamentares.',
      'Medir folga de raiz do acoplamento ("gap" ideal entre 1.6 mm a 3.2 mm conforme a EPS ativa).',
      'Verificar o alinhamento de bordas buscando "hi-lo" máximo de 1.5 mm.',
      'Inspecionar cordão acabado: validar ausência de poros, entalhes de raiz, mordeduras periféricas ou respingos de solda.'
    ],
    stepsEn: [
      'Evaluate bevel angle matching drawing requirements (commonly 37.5 degrees).',
      'Verify fit-up root gap (must comply with active WPS: ideally 1.6 mm to 3.2 mm).',
      'Verify angular misalignment preventing "hi-lo" step-down exceeding 1.5 mm.',
      'Assess completed weld cap: look for visible craters, undercut defects, surface porosity, or spatter.'
    ],
    stepsEs: [
      'Medir el ángulo de bisel garantizando el reglamentario de 37.5 grados.',
      'Medir luz de raíz de la unión ("gap" ideal de 1.6 mm a 3.2 mm según la EPS aprobada).',
      'Verificar desalineación lineal controlando un "hi-lo" máximo permitido de 1.5 mm.',
      'Controlar cordón terminado: rechazar poros expuestos, socavados o salpicaduras excedentes.'
    ],
    instrumentsPt: ['Cálibre de solda HI-LO', 'Cálibre de solda universal (Cambridge)', 'Lupa de ampliação 5x', 'Espelho articulado para inspeção'],
    instrumentsEn: ['HI-LO weld gauge', 'Cambridge universal weld gauge', '5x magnifying glass', 'Articulated inspection mirror'],
    instrumentsEs: ['Calibre HI-LO de desalineación', 'Calibre Cambridge universal de soldadura', 'Lupa de aumento de 5x', 'Espejo de ángulo articulado'],
    linkedDocs: ['SUMA-27', 'SUMA-28', 'SUMA-29']
  },
  {
    id: 'proc-3',
    code: 'PROC-QI-E-03',
    titlePt: 'Procedimento Técnico para Ensaio de Líquido Penetrante (LP)',
    titleEn: 'Dye Penetrant Testing (PT) Standardized Audit',
    titleEs: 'Procedimiento Técnico para Ensayo por Líquidos Penetrantes',
    type: 'NDT',
    standard: 'ASME Sect. V Art. 6 / Petrobras N-1596',
    objectivePt: 'Normatizar os critérios operacionais para aplicação de revelação de trincas e poros superficiais utilizando kit químico por contraste visível de líquido penetrante.',
    objectiveEn: 'Formalize operational guidelines to highlight surface defects and open cracks using visible dye penetrant chemical kits.',
    objectiveEs: 'Normalizar los criterios operativos para detección de grietas o poros expuestos en superficie por contraste visible.',
    stepsPt: [
      'Realizar limpeza mecânica/térmica da solda com solvente limpador químico homologado; secar integralmente.',
      'Aplicar o líquido penetrante vermelho homogeneamente sobre o cordão e adjacências por 10 a 15 minutos.',
      'Remover o excesso de líquido penetrante utilizando panos limpos isentos de fiapo levemente umedecidos em removedor.',
      'Aplicar uma camada fina e uniforme do revelador branco; aguardar o intervalo de tiragem de indicações entre 10 e 30 minutos.'
    ],
    stepsEn: [
      'Clean the target metal area forcefully using approved chemical remover; let dry completely.',
      'Apply visible cyan penetrant over the entire joint and adjacent margins; allow dwell time of 10 to 15 minutes.',
      'Wipe off excess surface penetrant using clean, lint-free cloth dampened with solvent remover.',
      'Spray a thin, even coat of white developer; read final indications within 10 to 30 minutes.'
    ],
    stepsEs: [
      'Limpiar el metal mecánicamente usando solvente limpiador homologado; secar en forma absoluta.',
      'Aplicar uniformemente el líquido penetrante rojo sobre la unión con tiempo de penetración de 10 a 15 minutos.',
      'Remover exceso de líquido penetrante de forma cuidadosa con paño libre de pelusas humedecido en removedor.',
      'Pulverizar una capa delgada y uniforme del revelador blanco; interpretar indicaciones entre 10 y 30 minutos.'
    ],
    instrumentsPt: ['Kit de aerossóis LP (Penetrante, Revelador, Removedor)', 'Termômetro de contato infravermelho', 'Luxímetro digital mínimo de 1000 Lux', 'Cronômetro portátil digital'],
    instrumentsEn: ['Dye PT aerosol kit (Cleaner, Pen, Dev)', 'Infrared contact thermometer', 'Digital lux meter (Min 1000 Lux)', 'Portable digital timer'],
    instrumentsEs: ['Kit de aerosoles de LP (Removedor, Penetrante, Revelador)', 'Termómetro infrarrojo de contacto', 'Luxómetro digital mínimo 1000 Lux', 'Cronómetro portátil digital'],
    linkedDocs: ['SUMA-30']
  },
  {
    id: 'proc-4',
    code: 'PROC-QI-E-04',
    titlePt: 'Diretrizes para Teste de Pressão Hidrostática (HT)',
    titleEn: 'System Pressure Hydrostatic Testing Guidelines (HT)',
    titleEs: 'Directrices para la Prueba Hidrostática de Estanqueidad',
    type: 'PRESSURE',
    standard: 'ASME B31.3 Cap. VI / ASME Sect. VIII Div. 1',
    objectivePt: 'Garantir que os spools interligados de vaso de pressão resistam às cargas de projeto sob estanqueidade plena, certificando integridade por pressurização controlada.',
    objectiveEn: 'Ensure integrated vessel spool systems withstand nominal design pressures without loss of structural tight seal.',
    objectiveEs: 'Garantizar que los spools interconectados de vasijas resistan las cargas de diseño bajo total estanqueidad.',
    stepsPt: [
      'Bloquear o escopo sob teste com flanges cegas adequadas para a pressão nominal exigida.',
      'Preencher toda a tubulação com água limpa tratada contendo inibidor de corrosão.',
      'Expurgar ar acumulado pelas válvulas localizadas nos pontos elevados da linha.',
      'Elevar a pressão lentamente até a pressão regulamentar de teste (1.5x a pressão limite de projeto) e reter estável por no mínimo 30 minutos.'
    ],
    stepsEn: [
      'Isolate testing boundary utilizing blind flanges rated according to maximum pressure.',
      'Fill system slowly with clean treated water mixed with corrosion inhibitor.',
      'Vent accumulated air completely using high-point bleed valves scattered on line.',
      'Raise pressure gradually to specified hold pressure (1.5x design pressure) and monitor for min 30 minutes.'
    ],
    stepsEs: [
      'Bloquear el sistema bajo ensayo mediante bridas ciegas con rango de presión adecuado.',
      'Llenar el circuito lentamente con agua limpia que contenga inhibidor de corrosión.',
      'Purgar aire acumulado a través de las válvulas ubicadas en los puntos más altos de la línea.',
      'Incrementar presión gradualmente hasta el valor nominal de prueba (1.5x la presión de diseño) y sostener por un mínimo de 30 minutos.'
    ],
    instrumentsPt: ['Manômetro calibrado padrão (aferição na faixa de 1.5 a 4x o teste)', 'Bomba hidrostática de alta pressão', 'Registrador de cartas de pressão térmico (Chart Recorder)', 'Válvula de segurança calibrada (PSV)'],
    instrumentsEn: ['Standard calibrated pressure gauge (1.5x to 4x test size)', 'High pressure hydrostatic pump', 'Rotary paper pressure chart recorder', 'Calibrated relief valve (PSV)'],
    instrumentsEs: ['Manómetro patrón calibrado (escala 1.5 a 4 veces la presión objetivo)', 'Bomba de prueba hidrostática de alta presión', 'Registrador de presión continuo sobre papel térmico (Chart Recorder)', 'Válvula de alivio calibrada (PSV)'],
    linkedDocs: ['SUMA-49', 'SUMA-48']
  },
  {
    id: 'proc-5',
    code: 'PROC-QI-E-05',
    titlePt: 'Inspeção por Ultrassom Phased Array em Juntas',
    titleEn: 'Ultrasonic Phased Array Non-Destructive Inspection (UT)',
    titleEs: 'Inspección por Ultrasonido Phased Array en Uniones (UT)',
    type: 'NDT',
    standard: 'ASME Sect. V Article 4 / Petrobras N-2688',
    objectivePt: 'Definir os critérios e rotina de varrimento para detecção computadorizada de descontinuidades internas não aflorantes nas juntas e adjacências.',
    objectiveEn: 'Define search guidelines and sweep patterns for fully digital subsurface defect mapping along welding joint boundaries.',
    objectiveEs: 'Definir los criterios y rutina de barrido para la detección computada de discontinuidades internas bajo la superficie en las juntas.',
    stepsPt: [
      'Calibrar a resposta angular do transdutor no bloco padrão de ensaio tipo V1 ou V2.',
      'Realizar aplanação e lixamento preliminar da solda adjacente e aplicar gel acoplante acústico.',
      'Efetuar a varredura mecânica monitorando o sinal de acoplamento e o ângulo de inclinação do feixe sônico.',
      'Mapear e registrar as indicações no computador para classificação de defeitos volumétricos (como falta de fusão ou inclusão de escória).'
    ],
    stepsEn: [
      'Calibrate the transducer angular array using standard design test blocks like V1 or V2.',
      'Flatten and sand target side metal of weld; put down water-based acoustic couplant gel.',
      'Conduct mechanical sweeps keeping transducer coupling and probe angle steady.',
      'Trace and store signals within database software; characterize discontinuities (e.g. lack of sidewall fusion).'
    ],
    stepsEs: [
      'Calibrar la respuesta angular del transductor usando patrones oficiales de calibración V1 o V2.',
      'Realizar desbaste y lijado preliminar del material base lindante y aplicar gel acoplante acústico.',
      'Efectuar el escaneo mecánico monitoreando los ecos de acoplamiento y el haz refractado.',
      'Mapear y registrar las indicaciones en el software del equipo para clasificar la discontinuidad (falta de fusión, grietas o escorias).'
    ],
    instrumentsPt: ['Aparelho de Ultrassom Phased Array portátil', 'Transdutores lineares matriciais e sapatas de desgaste', 'Bloco padrão de calibração tipo V1 / V2', 'Gel acoplante acústico de carboximetilcelulose'],
    instrumentsEn: ['Portable Phased Array Ultrasonic equipment', 'Linear matrix transducers and wear shoe wedges', 'Calibration block V1 or V2 standard', 'Acoustic couplant polymer gel'],
    instrumentsEs: ['Equipo portátil de Ultrasonido Phased Array', 'Transductores de matriz lineal y zapatas de acople', 'Bloque patrón de calibración V1 ó V2', 'Gel acoplante hidrosoluble de base polímero'],
    linkedDocs: ['SUMA-33']
  }
];

export interface InspectionProceduresViewProps {
  language: Language;
}

export default function InspectionProceduresView({ language }: InspectionProceduresViewProps) {
  const [procedures, setProcedures] = useState<InspectionProcedure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedProcId, setSelectedProcId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Form State
  const [formId, setFormId] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formTitlePt, setFormTitlePt] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleEs, setFormTitleEs] = useState('');
  const [formType, setFormType] = useState<'RECEIVING' | 'WELDING' | 'NDT' | 'PRESSURE' | 'CIVIL' | 'GENERAL'>('GENERAL');
  const [formStandard, setFormStandard] = useState('');
  const [formObjectivePt, setFormObjectivePt] = useState('');
  const [formObjectiveEn, setFormObjectiveEn] = useState('');
  const [formObjectiveEs, setFormObjectiveEs] = useState('');
  const [formStepsPt, setFormStepsPt] = useState('');
  const [formStepsEn, setFormStepsEn] = useState('');
  const [formStepsEs, setFormStepsEs] = useState('');
  const [formInstrumentsPt, setFormInstrumentsPt] = useState('');
  const [formInstrumentsEn, setFormInstrumentsEn] = useState('');
  const [formInstrumentsEs, setFormInstrumentsEs] = useState('');
  const [formLinkedDocs, setFormLinkedDocs] = useState('');

  // Translations object
  const uiText = {
    PT: {
      sectionTitle: 'Biblioteca de Procedimentos de Inspeção (POP)',
      sectionSubtitle: 'Procedimentos Operacionais Padrão em conformidade com normas regulamentares (ASME / API / AWS / ISO)',
      searchPlaceholder: 'Buscar procedimento por código, título ou norma...',
      filterType: 'Tipo de Inspeção',
      allTypes: 'Todos os Tipos',
      addNewBtn: 'Novo Procedimento',
      resetBtn: 'Excluir Customizados & Resetar Originais',
      noProcs: 'Nenhum procedimento encontrado com os filtros aplicados.',
      editTooltip: 'Editar procedimento',
      deleteTooltip: 'Excluir procedimento',
      codeLabel: 'Código',
      standardLabel: 'Norma de Referência',
      objectiveLabel: 'Objetivo Operacional',
      stepsLabel: 'Fases / Etapas do Processo',
      instrumentsLabel: 'Instrumentos & Insumos Críticos',
      linkedDocsLabel: 'Itens do Checklist Vinculados (Tags)',
      addProcTitle: 'Registrar Novo Procedimento de Inspeção',
      editProcTitle: 'Editar Procedimento de Inspeção',
      titlePt: 'Título (Português) *',
      titleEn: 'Título (Inglês) *',
      titleEs: 'Título (Espanhol) *',
      typeLabel: 'Categoria da Inspeção *',
      objectivePt: 'Objetivo (Português) *',
      objectiveEn: 'Objetivo (Inglês) *',
      objectiveEs: 'Objetivo (Espanhol) *',
      stepsPt: 'Etapas (Português) - Uma por linha *',
      stepsEn: 'Etapas (Inglês) - Uma por linha *',
      stepsEs: 'Etapas (Espanhol) - Uma por linha *',
      instrumentsPt: 'Instrumentos (Português) - Um por linha',
      instrumentsEn: 'Instrumentos (Inglês) - Um por linha',
      instrumentsEs: 'Instrumentos (Espanhol) - Um por linha',
      linkedPlaceholder: 'Ex: SUMA-27, SUMA-30',
      saveBtn: 'Salvar Procedimento',
      cancelBtn: 'Cancelar',
      typeReceiving: 'Recebimento de Materiais',
      typeWelding: 'Soldagem e Caldeiraria',
      typeNdt: 'Ensaios Não Destruídos (END)',
      typePressure: 'Testes de Pressão e Estanqueidade',
      typeCivil: 'Obras Civis e Estruturais',
      typeGeneral: 'Inspeções Gerais',
      linkedDocsLabelTitle: 'Relacionamento Documental',
      expandDetails: 'Clique para expandir o roteiro técnico detalhado',
      attachmentsTitle: 'Arquivos Técnicos e Anexos',
      uploadFileBtn: 'Anexar Documento',
      noAttachments: 'Nenhum documento técnico anexado a este procedimento.',
      deleteAttachmentTooltip: 'Remover anexo'
    },
    EN: {
      sectionTitle: 'Inspection Procedures Library (SOP)',
      sectionSubtitle: 'Standard Operating Procedures compliant with regulatory boards (ASME / API / AWS / ISO)',
      searchPlaceholder: 'Search by procedure code, title, or reference standard...',
      filterType: 'Inspection Category',
      allTypes: 'All Categories',
      addNewBtn: 'Add New Procedure',
      resetBtn: 'Delete Customs & Reset System Defaults',
      noProcs: 'No procedures matched active filters.',
      editTooltip: 'Edit procedure details',
      deleteTooltip: 'Delete procedure',
      codeLabel: 'Code ID',
      standardLabel: 'Reference Standard',
      objectiveLabel: 'Operational Overview',
      stepsLabel: 'Operational Phases / Checklist Steps',
      instrumentsLabel: 'Required Metrology & Equipment',
      linkedDocsLabel: 'Linked Checklist Workflows (Tags)',
      addProcTitle: 'Register New Inspection SOP',
      editProcTitle: 'Edit Inspection SOP Details',
      titlePt: 'Title (Portuguese) *',
      titleEn: 'Title (English) *',
      titleEs: 'Title (Spanish) *',
      typeLabel: 'Inspection Class *',
      objectivePt: 'Objective (Portuguese) *',
      objectiveEn: 'Objective (English) *',
      objectiveEs: 'Objective (Spanish) *',
      stepsPt: 'Procedures Steps (Portuguese) - One per line *',
      stepsEn: 'Procedures Steps (English) - One per line *',
      stepsEs: 'Procedures Steps (Spanish) - One per line *',
      instrumentsPt: 'Instruments (Portuguese) - One per line',
      instrumentsEn: 'Instruments (English) - One per line',
      instrumentsEs: 'Instruments (Spanish) - One per line',
      linkedPlaceholder: 'Ex: SUMA-27, SUMA-30',
      saveBtn: 'Save Procedure',
      cancelBtn: 'Cancel',
      typeReceiving: 'Material Reception',
      typeWelding: 'Welding & Structural Fit-up',
      typeNdt: 'Non-Destructive Testing (NDT)',
      typePressure: 'Pressure & Tightness Testing',
      typeCivil: 'Civil Foundations & Topography',
      typeGeneral: 'General Inspection Control',
      linkedDocsLabelTitle: 'Document Correlation Logs',
      expandDetails: 'Click to expand critical engineering guidelines',
      attachmentsTitle: 'Technical Files & Attachments',
      uploadFileBtn: 'Attach Document',
      noAttachments: 'No technical documents attached to this procedure.',
      deleteAttachmentTooltip: 'Remove attachment'
    },
    ES: {
      sectionTitle: 'Biblioteca de Procedimientos de Inspección (POP)',
      sectionSubtitle: 'Procedimientos Operativos Estándar conformes a normativas técnicas (ASME/API/AWS/ISO)',
      searchPlaceholder: 'Buscar procedimiento por código, título o norma...',
      filterType: 'Tipo de Inspección',
      allTypes: 'Todos los Tipos',
      addNewBtn: 'Nuevo Procedimiento',
      resetBtn: 'Eliminar Personalizados y Reestablecer Iniciales',
      noProcs: 'Ningún procedimiento coincide con los filtros aplicados.',
      editTooltip: 'Editar procedimiento',
      deleteTooltip: 'Eliminar procedimiento',
      codeLabel: 'Código',
      standardLabel: 'Normativa de Referencia',
      objectiveLabel: 'Objetivo Operativo',
      stepsLabel: 'Pasos / Fases del Proceso',
      instrumentsLabel: 'Instrumentos y Materiales Críticos',
      linkedDocsLabel: 'Ítems del Checklist Relacionados (Tags)',
      addProcTitle: 'Registrar Nuevo Procedimiento POP',
      editProcTitle: 'Editar Procedimiento POP',
      titlePt: 'Título (Portugués) *',
      titleEn: 'Título (Inglés) *',
      titleEs: 'Título (Español) *',
      typeLabel: 'Categoría de Inspección *',
      objectivePt: 'Objetivo (Portugués) *',
      objectiveEn: 'Objetivo (Inglés) *',
      objectiveEs: 'Objetivo (Español) *',
      stepsPt: 'Pasos (Portugués) - Uno por línea *',
      stepsEn: 'Pasos (Inglés) - Uno por línea *',
      stepsEs: 'Pasos (Español) - Uno por línea *',
      instrumentsPt: 'Instrumentos (Portugués) - Uno por línea',
      instrumentsEn: 'Instrumentos (Inglés) - Uno por línea',
      instrumentsEs: 'Instrumentos (Español) - Uno por línea',
      linkedPlaceholder: 'Ej: SUMA-27, SUMA-30',
      saveBtn: 'Guardar Procedimiento',
      cancelBtn: 'Cancelar',
      typeReceiving: 'Recepción de Materiales',
      typeWelding: 'Soldadura y Calderería',
      typeNdt: 'Ensayos No Destructivos (END)',
      typePressure: 'Pruebas de Presión y Estanqueidad',
      typeCivil: 'Obras Civiles y Estructuras',
      typeGeneral: 'Inspecciones Generales',
      linkedDocsLabelTitle: 'Relación de Documentos Técnicos',
      expandDetails: 'Haga clic para expandir la guía de ingeniería de campo',
      attachmentsTitle: 'Archivos Técnicos y Anexos',
      uploadFileBtn: 'Adjuntar Documento',
      noAttachments: 'Ningún documento técnico adjunto a este procedimiento.',
      deleteAttachmentTooltip: 'Eliminar adjunto'
    }
  }[language];

  // Set initial list from cache or defaults
  const [uploadToast, setUploadToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleProcedureFileUpload = (procId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = procedures.map(proc => {
      if (proc.id === procId) {
        return {
          ...proc,
          uploadedFiles: [...(proc.uploadedFiles || []), newFile]
        };
      }
      return proc;
    });

    saveProceduresToStateAndCache(updated);

    setUploadToast({
      message: language === 'PT' 
        ? `✓ Arquivo "${file.name}" anexado ao procedimento com sucesso!`
        : `✓ File "${file.name}" attached to procedure successfully!`,
      type: 'success'
    });

    setTimeout(() => {
      setUploadToast(null);
    }, 5000);
  };

  const handleProcedureFileDelete = (procId: string, fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(language === 'PT' ? 'Deseja mesmo remover esse anexo?' : 'Are you sure you want to remove this attachment?')) {
      const updated = procedures.map(proc => {
        if (proc.id === procId) {
          return {
            ...proc,
            uploadedFiles: (proc.uploadedFiles || []).filter(f => f.id !== fileId)
          };
        }
        return proc;
      });
      saveProceduresToStateAndCache(updated);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('piramidy_procedures');
    if (cached) {
      setProcedures(JSON.parse(cached));
    } else {
      setProcedures(DEFAULT_PROCEDURES);
      localStorage.setItem('piramidy_procedures', JSON.stringify(DEFAULT_PROCEDURES));
    }
  }, []);

  const saveProceduresToStateAndCache = (newProcs: InspectionProcedure[]) => {
    setProcedures(newProcs);
    localStorage.setItem('piramidy_procedures', JSON.stringify(newProcs));
  };

  const handleOpenAddModal = () => {
    setModalMode('create');
    setFormId('');
    setFormCode(`PROC-QI-NEW-${Date.now().toString().slice(-4)}`);
    setFormTitlePt('');
    setFormTitleEn('');
    setFormTitleEs('');
    setFormType('GENERAL');
    setFormStandard('');
    setFormObjectivePt('');
    setFormObjectiveEn('');
    setFormObjectiveEs('');
    setFormStepsPt('');
    setFormStepsEn('');
    setFormStepsEs('');
    setFormInstrumentsPt('');
    setFormInstrumentsEn('');
    setFormInstrumentsEs('');
    setFormLinkedDocs('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proc: InspectionProcedure, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setFormId(proc.id);
    setFormCode(proc.code);
    setFormTitlePt(proc.titlePt);
    setFormTitleEn(proc.titleEn);
    setFormTitleEs(proc.titleEs);
    setFormType(proc.type);
    setFormStandard(proc.standard);
    setFormObjectivePt(proc.objectivePt);
    setFormObjectiveEn(proc.objectiveEn);
    setFormObjectiveEs(proc.objectiveEs);
    setFormStepsPt(proc.stepsPt.join('\n'));
    setFormStepsEn(proc.stepsEn.join('\n'));
    setFormStepsEs(proc.stepsEs.join('\n'));
    setFormInstrumentsPt(proc.instrumentsPt.join('\n'));
    setFormInstrumentsEn(proc.instrumentsEn.join('\n'));
    setFormInstrumentsEs(proc.instrumentsEs.join('\n'));
    setFormLinkedDocs(proc.linkedDocs.join(', '));
    setIsModalOpen(true);
  };

  const handleDeleteProcedure = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(language === 'PT' ? 'Deseja mesmo remover esse procedimento de inspeção?' : 'Are you sure you want to delete this inspection procedure?')) {
      const updated = procedures.filter(p => p.id !== id);
      saveProceduresToStateAndCache(updated);
      if (selectedProcId === id) setSelectedProcId(null);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm(language === 'PT' ? 'Tem certeza que quer apagar as customizações e restaurar os 5 procedimentos originais?' : 'Are you sure you want to reset all procedures to defaults?')) {
      saveProceduresToStateAndCache(DEFAULT_PROCEDURES);
      setSelectedProcId(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitlePt || !formStandard) {
      alert(language === 'PT' ? 'Preencha os campos obrigatórios.' : 'Please fill all mandatory fields.');
      return;
    }

    const stepsPtArray = formStepsPt.split('\n').map(s => s.trim()).filter(Boolean);
    const stepsEnArray = formStepsEn.split('\n').map(s => s.trim()).filter(Boolean);
    const stepsEsArray = formStepsEs.split('\n').map(s => s.trim()).filter(Boolean);

    const instPtArray = formInstrumentsPt.split('\n').map(i => i.trim()).filter(Boolean);
    const instEnArray = formInstrumentsEn.split('\n').map(i => i.trim()).filter(Boolean);
    const instEsArray = formInstrumentsEs.split('\n').map(i => i.trim()).filter(Boolean);

    const linkedArray = formLinkedDocs.split(',')
      .map(t => t.trim().toUpperCase())
      .filter(Boolean);

    if (modalMode === 'create') {
      const newProc: InspectionProcedure = {
        id: `proc-custom-${Date.now()}`,
        code: formCode,
        titlePt: formTitlePt,
        titleEn: formTitleEn || formTitlePt,
        titleEs: formTitleEs || formTitlePt,
        type: formType,
        standard: formStandard,
        objectivePt: formObjectivePt,
        objectiveEn: formObjectiveEn || formObjectivePt,
        objectiveEs: formObjectiveEs || formObjectivePt,
        stepsPt: stepsPtArray.length > 0 ? stepsPtArray : ['Executar instrução conforme regulamento.'],
        stepsEn: stepsEnArray.length > 0 ? stepsEnArray : ['Exceute procedure steps per norms.'],
        stepsEs: stepsEsArray.length > 0 ? stepsEsArray : ['Ejecutar instrucción según lo especificado.'],
        instrumentsPt: instPtArray,
        instrumentsEn: instEnArray,
        instrumentsEs: instEsArray,
        linkedDocs: linkedArray
      };
      
      const updated = [...procedures, newProc];
      saveProceduresToStateAndCache(updated);
    } else {
      const updated = procedures.map(p => {
        if (p.id === formId) {
          return {
            ...p,
            code: formCode,
            titlePt: formTitlePt,
            titleEn: formTitleEn,
            titleEs: formTitleEs,
            type: formType,
            standard: formStandard,
            objectivePt: formObjectivePt,
            objectiveEn: formObjectiveEn,
            objectiveEs: formObjectiveEs,
            stepsPt: stepsPtArray,
            stepsEn: stepsEnArray,
            stepsEs: stepsEsArray,
            instrumentsPt: instPtArray,
            instrumentsEn: instEnArray,
            instrumentsEs: instEsArray,
            linkedDocs: linkedArray
          };
        }
        return p;
      });
      saveProceduresToStateAndCache(updated);
    }

    setIsModalOpen(false);
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'RECEIVING': return uiText.typeReceiving;
      case 'WELDING': return uiText.typeWelding;
      case 'NDT': return uiText.typeNdt;
      case 'PRESSURE': return uiText.typePressure;
      case 'CIVIL': return uiText.typeCivil;
      default: return uiText.typeGeneral;
    }
  };

  const getCategoryBadgeColor = (type: string) => {
    switch (type) {
      case 'RECEIVING': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'WELDING': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'NDT': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'PRESSURE': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CIVIL': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Filter procedures list
  const filteredProcedures = procedures.filter(proc => {
    const isTypeMatch = selectedType === 'ALL' || proc.type === selectedType;
    const lowerSearch = searchTerm.toLowerCase();
    
    const isSearchMatch = 
      proc.code.toLowerCase().includes(lowerSearch) ||
      proc.standard.toLowerCase().includes(lowerSearch) ||
      proc.titlePt.toLowerCase().includes(lowerSearch) ||
      proc.titleEn.toLowerCase().includes(lowerSearch) ||
      proc.titleEs.toLowerCase().includes(lowerSearch);

    return isTypeMatch && isSearchMatch;
  });

  return (
    <div className="space-y-6">
      
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

      {/* Search and Filters panel */}
      <section className="bg-gray-900/40 p-4 border border-gray-800 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="flex-1 w-full relative">
          <span className="absolute left-3 top-2.5 text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={uiText.searchPlaceholder}
            className="w-full bg-[#111827] border border-gray-750 focus:border-cyan-500 rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none placeholder-gray-500"
          />
        </div>

        {/* Category filtering */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
            {uiText.filterType}:
          </span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#111827] border border-gray-750 text-xs text-gray-300 rounded p-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">-- {uiText.allTypes} --</option>
            <option value="RECEIVING">{uiText.typeReceiving}</option>
            <option value="WELDING">{uiText.typeWelding}</option>
            <option value="NDT">{uiText.typeNdt}</option>
            <option value="PRESSURE">{uiText.typePressure}</option>
            <option value="CIVIL">{uiText.typeCivil}</option>
            <option value="GENERAL">{uiText.typeGeneral}</option>
          </select>
        </div>

        {/* Action Triggers */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-xs rounded transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{uiText.addNewBtn}</span>
          </button>

          <button
            onClick={handleResetToDefaults}
            className="p-1.5 bg-gray-900 border border-gray-850 hover:bg-cyan-950/20 hover:border-cyan-900 hover:text-cyan-400 text-gray-500 rounded transition"
            title={uiText.resetBtn}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </section>

      {/* Grid of procedures list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProcedures.length === 0 ? (
          <div className="bg-[#111827]/30 border border-gray-800 p-8 rounded-xl text-center italic text-gray-500 text-xs font-mono">
            {uiText.noProcs}
          </div>
        ) : (
          filteredProcedures.map((proc) => {
            const isExpanded = selectedProcId === proc.id;
            const title = language === 'PT' ? proc.titlePt : language === 'ES' ? proc.titleEs : proc.titleEn;
            const objective = language === 'PT' ? proc.objectivePt : language === 'ES' ? proc.objectiveEs : proc.objectiveEn;
            const steps = language === 'PT' ? proc.stepsPt : language === 'ES' ? proc.stepsEs : proc.stepsEn;
            const instruments = language === 'PT' ? proc.instrumentsPt : language === 'ES' ? proc.instrumentsEs : proc.instrumentsEn;

            return (
              <article 
                key={proc.id} 
                className={`border rounded-xl transition-all cursor-pointer overflow-hidden ${
                  isExpanded 
                    ? 'bg-[#111827]/70 border-cyan-500/50 shadow-lg shadow-cyan-500/5' 
                    : 'bg-[#111827]/20 border-gray-800 hover:border-gray-750 hover:bg-[#111827]/30'
                }`}
                onClick={() => setSelectedProcId(isExpanded ? null : proc.id)}
              >
                
                {/* Executive Summary row */}
                <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-cyan-500 font-mono text-xs font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {proc.code}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        | {proc.standard}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded-full border ${getCategoryBadgeColor(proc.type)}`}>
                        {getCategoryLabel(proc.type)}
                      </span>
                    </div>

                    <h4 className="text-gray-100 font-bold text-sm tracking-tight pt-1">
                      {title}
                    </h4>

                    {!isExpanded && (
                      <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-gray-600" />
                        <span>{uiText.expandDetails}</span>
                      </p>
                    )}
                  </div>

                  {/* Inline Administration actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    
                    {/* Tags for connected checklist items */}
                    {proc.linkedDocs.length > 0 && (
                      <div className="flex gap-1 mr-2 hidden sm:flex">
                        {proc.linkedDocs.map(docCode => (
                          <span 
                            key={docCode} 
                            className="bg-gray-850 text-gray-400 text-[8.5px] px-1.5 py-0.5 rounded border border-gray-800 font-mono font-bold uppercase"
                            title={`Referente ao código do checklist: ${docCode}`}
                          >
                            {docCode}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-1">
                      {/* Direct upload quick button */}
                      <label 
                        className="p-2 bg-gray-950 border border-gray-850 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-500 rounded transition cursor-pointer"
                        title={uiText.uploadFileBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx"
                          onChange={(e) => handleProcedureFileUpload(proc.id, e)}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={(e) => handleOpenEditModal(proc, e)}
                        className="p-2 bg-gray-950 border border-gray-850 hover:border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition"
                        title={uiText.editTooltip}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteProcedure(proc.id, e)}
                        className="p-2 bg-gray-950 border border-gray-850 hover:border-cyan-900 hover:bg-cyan-950/20 text-gray-500 hover:text-cyan-400 rounded transition"
                        title={uiText.deleteTooltip}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>

                {/* Extended procedure contents instruction sheet */}
                {isExpanded && (
                  <div className="border-t border-gray-850 bg-gray-950/50 p-5 space-y-4">
                    
                    {/* 1 - OBJECTIVE */}
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-500" />
                        {uiText.objectiveLabel}
                      </h5>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#111827]/40 p-3 rounded border border-gray-850/60 font-mono">
                        {objective}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* 2 - PROCEDURES STEPS (LIST) */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-cyan-500" />
                          {uiText.stepsLabel}
                        </h5>
                        <ol className="space-y-2 text-xs font-mono text-gray-300">
                          {steps.map((st, sIdx) => (
                            <li key={sIdx} className="flex gap-2.5 items-start bg-gray-900/60 p-2.5 rounded border border-gray-850/40">
                              <span className="w-4 h-4 rounded bg-cyan-500/10 text-cyan-500 text-[10px] font-bold flex items-center justify-center shrink-0 border border-cyan-500/20">
                                {sIdx + 1}
                              </span>
                              <p className="leading-relaxed">{st}</p>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* 3 - METROLOGY INSTRUMENTS & CORRELATIONS */}
                      <div className="space-y-4">
                        
                        {/* Instruments Checklist */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                            {uiText.instrumentsLabel}
                          </h5>
                          <div className="bg-gray-900/60 p-3 rounded border border-gray-850/40 space-y-1.5">
                            {instruments.length === 0 ? (
                                <p className="text-[10px] text-gray-500 italic">Sem instrumentos específicos listados.</p>
                            ) : (
                              instruments.map((inst, iIdx) => (
                                <div key={iIdx} className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>{inst}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Document Connections log */}
                        <div className="space-y-1.5">
                          <h5 className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-cyan-500" />
                            {uiText.linkedDocsLabelTitle}
                          </h5>
                          <div className="bg-[#0f1524]/60 p-3 rounded border border-gray-850/60 flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] text-gray-500 font-mono font-medium">Linkages:</span>
                            {proc.linkedDocs.length === 0 ? (
                              <span className="text-[10px] text-gray-500 italic">Sem vínculos.</span>
                            ) : (
                              proc.linkedDocs.map(docCode => (
                                <span 
                                  key={docCode} 
                                  className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-2 py-0.5 rounded"
                                >
                                  {docCode}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* 4 - ATTACHED TECHNICAL DOCUMENTS (FILES) */}
                    <div className="pt-4 border-t border-gray-850 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h5 className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-cyan-500" />
                          {uiText.attachmentsTitle}
                        </h5>
                        
                        <label 
                          className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/25 text-cyan-400 rounded text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          onClick={(e) => e.stopPropagation()} // Stop accordion toggling
                        >
                          <Upload className="w-3 h-3 text-cyan-400" />
                          <span>{uiText.uploadFileBtn}</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx"
                            onChange={(e) => handleProcedureFileUpload(proc.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {(!proc.uploadedFiles || proc.uploadedFiles.length === 0) ? (
                        <p className="text-[11px] text-gray-500 italic bg-[#111827]/20 p-4 rounded border border-gray-850/60 font-mono">
                          {uiText.noAttachments}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {proc.uploadedFiles.map((file) => (
                            <div 
                              key={file.id} 
                              className="bg-gray-900/65 p-2.5 rounded border border-gray-850/60 flex items-center justify-between gap-2 text-xs font-mono group"
                              onClick={(e) => e.stopPropagation()} // Prevent accordion collapsing
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                                <div className="overflow-hidden">
                                  <p className="text-gray-200 font-semibold truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                  <p className="text-[9px] text-gray-500">
                                    {file.size} • {file.uploadedAt}
                                  </p>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={(e) => handleProcedureFileDelete(proc.id, file.id, e)}
                                className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-cyan-950/30 rounded transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title={uiText.deleteAttachmentTooltip}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </article>
            );
          })
        )}
      </div>

      {/* PROCEDURES MODAL EDITOR (ADD/EDIT FORM) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-gray-200 font-mono text-xs">
            
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {modalMode === 'create' ? uiText.addProcTitle : uiText.editProcTitle}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-lg p-1 hover:bg-gray-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Row 1: Code and standard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">{uiText.codeLabel} *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full bg-gray-950 border border-gray-750 rounded px-2.5 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
                    placeholder="Ex: PROC-QI-E-03"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">{uiText.standardLabel} *</label>
                  <input
                    type="text"
                    required
                    value={formStandard}
                    onChange={(e) => setFormStandard(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-750 rounded px-2.5 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
                    placeholder="Ex: ASME V Art. 6"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">{uiText.typeLabel}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-gray-950 border border-gray-750 text-xs rounded px-2.5 py-1.5 text-white mt-1 focus:border-cyan-500"
                  >
                    <option value="RECEIVING">{uiText.typeReceiving}</option>
                    <option value="WELDING">{uiText.typeWelding}</option>
                    <option value="NDT">{uiText.typeNdt}</option>
                    <option value="PRESSURE">{uiText.typePressure}</option>
                    <option value="CIVIL">{uiText.typeCivil}</option>
                    <option value="GENERAL">{uiText.typeGeneral}</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Multilanguage titles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">{uiText.titlePt}</label>
                  <input
                    type="text"
                    required
                    value={formTitlePt}
                    onChange={(e) => setFormTitlePt(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-750 rounded px-2.5 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
                    placeholder="Nome do procedimento em PT"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">{uiText.titleEn}</label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-750 rounded px-2.5 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
                    placeholder="Nome do procedimento em EN (opcional)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">{uiText.titleEs}</label>
                  <input
                    type="text"
                    value={formTitleEs}
                    onChange={(e) => setFormTitleEs(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-750 rounded px-2.5 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
                    placeholder="Nome do procedimento em ES (opcional)"
                  />
                </div>
              </div>

              {/* Row 3: Multilanguage objectives */}
              <div className="space-y-3.5 bg-gray-950/40 p-3 rounded-lg border border-gray-850/60">
                <h4 className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">{uiText.objectiveLabel}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.objectivePt}</label>
                    <textarea
                      required
                      value={formObjectivePt}
                      onChange={(e) => setFormObjectivePt(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.objectiveEn}</label>
                    <textarea
                      value={formObjectiveEn}
                      onChange={(e) => setFormObjectiveEn(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.objectiveEs}</label>
                    <textarea
                      value={formObjectiveEs}
                      onChange={(e) => setFormObjectiveEs(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Multilanguage steps (lists textareas) */}
              <div className="space-y-3.5 bg-gray-950/40 p-3 rounded-lg border border-gray-850/60">
                <h4 className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">{uiText.stepsLabel}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.stepsPt}</label>
                    <textarea
                      required
                      value={formStepsPt}
                      onChange={(e) => setFormStepsPt(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1 leading-normal"
                      placeholder="Identificar o lote...&#10;Fazer medições..."
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.stepsEn}</label>
                    <textarea
                      value={formStepsEn}
                      onChange={(e) => setFormStepsEn(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1 leading-normal"
                      placeholder="Identify the batch...&#10;Perform checks..."
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.stepsEs}</label>
                    <textarea
                      value={formStepsEs}
                      onChange={(e) => setFormStepsEs(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1 leading-normal"
                      placeholder="Identificar el lote...&#10;Hacer mediciones..."
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Multilanguage Instruments (lists textareas) */}
              <div className="space-y-3.5 bg-gray-950/40 p-3 rounded-lg border border-gray-850/60">
                <h4 className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">{uiText.instrumentsLabel}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.instrumentsPt}</label>
                    <textarea
                      value={formInstrumentsPt}
                      onChange={(e) => setFormInstrumentsPt(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1"
                      placeholder="Paquímetro&#10;Trena"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.instrumentsEn}</label>
                    <textarea
                      value={formInstrumentsEn}
                      onChange={(e) => setFormInstrumentsEn(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1"
                      placeholder="Caliper&#10;Tape measure"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase">{uiText.instrumentsEs}</label>
                    <textarea
                      value={formInstrumentsEs}
                      onChange={(e) => setFormInstrumentsEs(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-950 border border-gray-750 rounded p-2 text-xs text-white mt-1"
                      placeholder="Calibre&#10;Cinta métrica"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Document linkages */}
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold">{uiText.linkedDocsLabel}</label>
                <input
                  type="text"
                  value={formLinkedDocs}
                  onChange={(e) => setFormLinkedDocs(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-750 rounded px-2.5 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
                  placeholder={uiText.linkedPlaceholder}
                />
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-350 text-xs font-semibold rounded"
                >
                  {uiText.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-extrabold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-black" />
                  {uiText.saveBtn}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
