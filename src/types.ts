/**
 * Types and interfaces for the PYRAMID ENERGY GOVERNANCE system.
 */

export enum ChecklistStatus {
  PENDING = 'PENDING',        // Amarelo / Yellow
  ANALYSIS = 'ANALYSIS',      // Branco / Grayish-White
  REJECTED = 'REJECTED',      // Vermelho / Orange
  NOT_APPLICABLE = 'NOT_APPLICABLE', // Azul / Blue
  APPROVED = 'APPROVED'       // Verde / Green
}

export interface DigitalSignature {
  inspectorName: string;
  professionalId: string; // e.g. CREA, CFT
  nationalId: string; // CPF
  certificateAuthority: string; // e.g. ICP-Brasil, Piramidy CA
  signedAt: string;
  signatureHash: string;
  isValid: boolean;
}

export interface DocumentEmission {
  id: string;
  revision: string; // e.g. Rev. 0, Rev. A
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: ChecklistStatus;
  signature?: DigitalSignature;
}

export interface ChecklistItem {
  id: string;
  code: string; // e.g. CAPA-01, SUMA-05
  titlePt: string;
  titleEn: string;
  titleEs: string;
  category: 'CAPA' | 'CONTRA_CAPA' | 'SUMARIO';
  status: ChecklistStatus;
  emissions: DocumentEmission[];
}

export interface Project {
  id: string;
  name: string;
  // Capa/Contra-capa fields
  category: string; // e.g., Inspeção, Manutenção, Engenharia
  client: string;
  contract: string;
  techResponsible: string; // Responsável Técnico (e.g. Engenheiro CREA)
  docNumber: string;
  area: string;
  title: string;
  orderNumber: string; // Ordem de Serviço
  revision: string;
  createdAt: string;
  checklist: ChecklistItem[];
}

export interface Company {
  id: string;
  name: string;
  email: string;
  logoUrl?: string;
  createdAt?: string;
  isRegistered: boolean;
  isBlocked?: boolean;
  isManualBlock?: boolean;
  blockReason?: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING';
  emailAlertsSent: number;
  lastAlertSentAt?: string;
}

export interface CrmActivity {
  id: string;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'system';
  title: string;
  description: string;
  user: string;
}

export interface CrmContact {
  id: string;
  name: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  status: 'active' | 'negotiating' | 'inactive';
}

export type Language = 'PT' | 'EN' | 'ES';
