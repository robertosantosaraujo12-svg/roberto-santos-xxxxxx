import React, { useState } from 'react';
import { Company, Language } from '../types';
import { CHANNELS_LANG, PASSWORDS_MAPPING } from '../data';
import { Shield, Cpu, Building2, Globe, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';

interface LoginProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  companies: Company[];
  onRegisterCompany: (name: string, email: string, logo?: string) => void;
  onLoginSuccess: (companyId: string, isAdmin: boolean) => void;
}

export default function Login({
  language,
  setLanguage,
  companies,
  onRegisterCompany,
  onLoginSuccess
}: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regLogo, setRegLogo] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const t = CHANNELS_LANG[language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isAdminMode) {
      if (adminPassword === 'master2026') {
        onLoginSuccess('master', true);
      } else {
        setErrorMsg(language === 'PT' ? 'Senha mestra incorreta.' : language === 'ES' ? 'Contraseña maestra incorrecta.' : 'Incorrect master key.');
      }
      return;
    }

    if (!selectedCompanyId) {
      setErrorMsg(language === 'PT' ? 'Selecione uma empresa.' : language === 'ES' ? 'Seleccione una empresa.' : 'Please select a company.');
      return;
    }

    const correctPass = PASSWORDS_MAPPING[selectedCompanyId] || 'piramidy123';
    if (password === correctPass) {
      onLoginSuccess(selectedCompanyId, selectedCompanyId === 'master');
    } else {
      setErrorMsg(language === 'PT' ? 'Senha incorreta para a empresa selecionada.' : language === 'ES' ? 'Contraseña incorrecta.' : 'Incorrect password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      setErrorMsg(language === 'PT' ? 'Preencha os campos obrigatórios.' : language === 'ES' ? 'Complete los campos.' : 'Please fill all fields.');
      return;
    }

    onRegisterCompany(regName, regEmail, regLogo || undefined);
    
    // Auto map the registered password
    const compId = regName.toLowerCase().replace(/\s+/g, '-');
    PASSWORDS_MAPPING[compId] = regPasswordInput || '123456';
    
    setRegSuccess(true);
    setTimeout(() => {
      setIsRegisterMode(false);
      setRegSuccess(false);
      setSelectedCompanyId(compId);
      setPassword(regPasswordInput || '123456');
      setRegName('');
      setRegEmail('');
      setRegLogo('');
      setRegPasswordInput('');
      setErrorMsg('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-gray-100 flex flex-col justify-between p-4 selection:bg-orange-500 selection:text-black">
      
      {/* Top Header & Language Bar */}
      <header className="max-w-6xl w-full mx-auto flex justify-between items-center py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-400 p-[1.5px] rounded">
            <div className="w-full h-full bg-[#0a0f18] flex items-center justify-center rounded">
              <span className="font-mono text-xl font-bold tracking-tighter text-orange-500">P</span>
            </div>
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-white flex items-center gap-1.5">
              PIRAMID <span className="text-orange-500 text-xs border border-orange-500/40 px-1 py-0.2 rounded font-mono uppercase">ENERGY GOVERNANCE</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider">QUALITY HYBRID NETWORK</p>
          </div>
        </div>

        {/* Change Language Selector */}
        <div className="flex items-center gap-2 bg-gray-900/60 p-1 border border-gray-800 rounded-md">
          <Globe className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-gray-400 hidden sm:inline font-mono">{t.switchLang}:</span>
          <div className="flex gap-1">
            {(['PT', 'EN', 'ES'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 text-xs rounded font-mono font-medium transition-all ${
                  language === lang
                    ? 'bg-orange-500 text-black shadow-sm font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-12 px-2">
        <div className="max-w-md w-full bg-[#111827] border border-gray-800 shadow-2xl rounded-xl p-8 relative overflow-hidden">
          
          {/* Accent decorative strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600" />
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">{t.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{t.subtitle}</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-orange-950/40 border border-orange-800/80 rounded flex items-start gap-2 text-orange-200 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {regSuccess && (
            <div className="mb-6 p-3 bg-green-950/40 border border-green-800/80 rounded flex items-center gap-2 text-green-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span>{language === 'PT' ? 'Empresa cadastrada com sucesso!' : language === 'ES' ? '¡Empresa registrada con éxito!' : 'Company successfully registered!'}</span>
            </div>
          )}

          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Admin toggle checkbox */}
              <div className="flex items-center justify-between p-2.5 bg-gray-900/60 border border-gray-800/80 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdminMode}
                    onChange={(e) => {
                      setIsAdminMode(e.target.checked);
                      setErrorMsg('');
                    }}
                    className="accent-orange-500 w-4 h-4 rounded border-gray-700 bg-gray-800 text-orange-500 cursor-pointer"
                  />
                  <span className="text-xs text-orange-500 font-mono flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {t.adminLabel}
                  </span>
                </label>
              </div>

              {isAdminMode ? (
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider">
                    {language === 'PT' ? 'Chave Mestra Admin' : language === 'ES' ? 'Firma Administrativa' : 'Admin Master Password'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-orange-500">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-[#1f2937] border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-3 py-2 pl-10 text-sm text-white focus:outline-none placeholder-gray-500 font-mono"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    * {language === 'PT' ? 'Senha padrão: master2026' : language === 'ES' ? 'Contraseña por defecto: master2026' : 'Default pass: master2026'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Select Company */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-orange-500" />
                      {t.companyCode}
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full bg-[#1f2937] border border-gray-700 focus:border-orange-500 rounded px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">
                        {language === 'PT' ? '-- Escolha sua Empresa --' : language === 'ES' ? '-- Seleccione Empresa --' : '-- Choose Company --'}
                      </option>
                      {companies.filter(c => c.id !== 'master').map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password block */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider">
                      {t.companyPass}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1f2937] border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-3 py-2 text-sm text-white focus:outline-none placeholder-gray-500 font-mono"
                    />
                    {selectedCompanyId && (
                      <p className="text-[10px] text-gray-500 font-mono">
                        * {language === 'PT' ? `Dica de Senha de Acesso: ${PASSWORDS_MAPPING[selectedCompanyId] || '123456'}` : `Default password: ${PASSWORDS_MAPPING[selectedCompanyId] || '123456'}`}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Action trigger Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold rounded focus:outline-none transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-sm mt-3"
              >
                <Cpu className="w-4 h-4 text-black animate-pulse" />
                {t.login}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMsg('');
                  }}
                  className="text-xs text-orange-500/90 hover:text-orange-400 hover:underline transition-all cursor-pointer font-mono"
                >
                  {t.registerBtn}
                </button>
              </div>

            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <h3 className="text-lg font-bold text-center text-orange-500 mb-2">
                {language === 'PT' ? 'Novo Cadastro de Empresa' : language === 'ES' ? 'Registro de Nueva Empresa' : 'Register New Company'}
              </h3>

              <div className="space-y-1">
                <label className="block text-xs text-gray-400">{language === 'PT' ? 'Nome da Empresa *' : 'Company Name *'}</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cliente S.A. ou Prestadora"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#1f2937] border border-gray-700 focus:border-orange-500 rounded px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-gray-400">{language === 'PT' ? 'E-mail Corporativo *' : 'Corporate Email *'}</label>
                <input
                  type="email"
                  required
                  placeholder="qualidade@corporativo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#1f2937] border border-gray-700 focus:border-orange-500 rounded px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-gray-400">{language === 'PT' ? 'Definir Senha de Acesso *' : 'Set Password *'}</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPasswordInput}
                  onChange={(e) => setRegPasswordInput(e.target.value)}
                  className="w-full bg-[#1f2937] border border-gray-700 focus:border-orange-500 rounded px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-gray-400">{language === 'PT' ? 'URL do Logotipo (Opcional)' : 'Logo Image URL'}</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={regLogo}
                  onChange={(e) => setRegLogo(e.target.value)}
                  className="w-full bg-[#1f2937] border border-gray-700 focus:border-orange-500 rounded px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="flex-1 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded transition"
                >
                  {language === 'PT' ? 'Cadastrar' : 'Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer credits and system compliance */}
      <footer className="max-w-6xl w-full mx-auto py-6 border-t border-gray-900 text-center space-y-4 font-mono tracking-wider">
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 max-w-3xl mx-auto text-left space-y-3 font-sans">
          <div className="flex items-center gap-2 text-orange-500">
            <Shield className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold font-mono tracking-wide uppercase">
              {language === 'PT' ? 'AVISO DE PROTEÇÃO DE PROPRIEDADE INTELECTUAL E SEGREDOS COMERCIAIS' : 
               language === 'ES' ? 'AVISO DE PROTECCIÓN DE PROPIEDAD INTELECTUAL Y PATENTE' : 
               'INTELLECTUAL PROPERTY & TRADE SECRET PROTECTION STATEMENT'}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            {language === 'PT' ? (
              'Este software, incluindo sua estrutura exclusiva de Checklist Metrológico com 71 quesitos regulamentares, layout visual, algoritmos de verificação criptográfica de assinaturas (ICP-Brasil) e compilador sequencial de Databooks técnicos, constitui segredo comercial de valor industrial e propriedade industrial protegida. Qualquer cópia, imitação, engenharia reversa, reprodução de layout ou extração de processos sem autorização prévia por escrito constitui infração criminal e civil de propriedade intelectual (Lei Federal Nº 9.279/96 de Propriedade Industrial e Lei Nº 9.609/98 de Proteção de Software).'
            ) : language === 'ES' ? (
              'Este software, incluyendo su estructura exclusiva de Lista de Verificación con 71 criterios, su interfaz visual y su compilador sequencial de Databooks técnicos, constituye secreto comercial y propiedad intelectual protegida. Cualquier copia, imitación o ingeniería inversa no autorizada por escrito constituye infracción legal civil y penal según las leyes de propiedad industrial vigentes.'
            ) : (
              'This software platform, including its proprietary 71-point Metrological Checklist framework, user interface design, ICP-compliant cryptographic signature validation mechanisms, and sequential Technical Databook compiler, constitutes a highly protected trade secret and industrial asset. Any unauthorized duplication, reverse-engineering, visual plagiarism, or process copying is strictly prohibited and subject to severe civil and criminal legal action.'
            )}
          </p>
        </div>
        <p className="text-[10px] text-gray-600">
          PIRAMID ENERGY GOVERNANCE - COMPLIANCE REGULATION STANDARDS v2.26 | ALL SYSTEMS ENCRYPTED SHA256 & PROTECTED BY INTERNATIONAL COPYRIGHT LAWS © 2026
        </p>
      </footer>

    </div>
  );
}
