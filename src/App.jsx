// IBCC Pipeline 2026 â Centro Oeste Â· v2 (arquivo Ãºnico)
import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ââ PALETAS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const LIGHT = {
  mode:"light", navy:"#0D2240", navyMid:"#163466",
  accent:"#E8751A", accentSoft:"#FAEBD7",
  bg:"#F4F2EC", card:"#FFFFFF", cardAlt:"#F9F7F2",
  border:"#E1DBD0", borderSoft:"#EDE9E1",
  text:"#1C1C1C", textMid:"#4A4A4A", textLight:"#8A8A8A",
  green:"#1A6B45", greenSoft:"#E7F2EB",
  red:"#C0392B", redSoft:"#FBEBE9",
  gold:"#C49A1A", goldSoft:"#FBF5E0",
  purple:"#7B5EA7", purpleSoft:"#F1ECF8",
  blue:"#2680C2", blueSoft:"#EAF2FA",
  headerBg:"#0D2240",
};
const DARK = {
  mode:"dark", navy:"#0B1B33", navyMid:"#1B2C4A",
  accent:"#F2842B", accentSoft:"#3A2A1A",
  bg:"#0F1621", card:"#1A2332", cardAlt:"#212D3E",
  border:"#2C3A4E", borderSoft:"#243040",
  text:"#E9EDF3", textMid:"#AEB8C6", textLight:"#6E7A8C",
  green:"#2ECC71", greenSoft:"#16301F",
  red:"#F0584B", redSoft:"#331917",
  gold:"#E0B831", goldSoft:"#332B12",
  purple:"#A588D6", purpleSoft:"#26203A",
  blue:"#4AA3E8", blueSoft:"#132433",
  headerBg:"#0B1B33",
};
const ThemeCtx = createContext({ C:LIGHT, dark:false, toggle:()=>{} });
const useTheme = () => useContext(ThemeCtx);

// ââ STORAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function saveData(key, value) {
  try {
    if (typeof window!=="undefined" && window.storage) await window.storage.set(key, JSON.stringify(value));
    else localStorage.setItem(key, JSON.stringify(value));
  } catch(e) { console.warn(e); }
}
async function loadData(key, fallback) {
  try {
    if (typeof window!=="undefined" && window.storage) { const r=await window.storage.get(key); return r?JSON.parse(r.value):fallback; }
    else { const r=localStorage.getItem(key); return r?JSON.parse(r):fallback; }
  } catch { return fallback; }
}

// ââ CONSTANTES ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const FUNNEL = [
  { key:"Nova Empresa",     colorKey:"textLight" },
  { key:"Enviar Proposta",  colorKey:"accent"    },  // â nova etapa de aÃ§Ã£o
  { key:"Proposta Enviada", colorKey:"purple" },
  { key:"Proposta Aceita",  colorKey:"blue" },
  { key:"Ficha Preenchida", colorKey:"gold" },
  { key:"Boleto Enviado",   colorKey:"green" },
];
const FUNNEL_KEYS = FUNNEL.map(f=>f.key);
const NATUREZA_LIST = ["InstituiÃ§Ã£o","Empresa"];
const TIPO_LEAD_LIST = ["Institucional","ServiÃ§o","Parceiro"];
const PRIORIDADES = ["Alta","MÃ©dia","Monitorar"];
// Lista-seed â substituta gerenciada por estado no App (editÃ¡vel pelo usuÃ¡rio)
const SEED_RESP = ["Isa","Marcel","Athena","Guilherme","Leonardo","LÃ©o"];
const prioCfg = C => ({
  "Alta":      { color:C.red,      bg:C.redSoft,    label:"Alta" },
  "MÃ©dia":     { color:C.gold,     bg:C.goldSoft,   label:"MÃ©dia" },
  "Monitorar": { color:C.textLight,bg:C.borderSoft, label:"Monitorar" },
});

// ââ DADOS SEED ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SEED_PIPELINE = [
  { id:"fiemt",       empresa:"FIEMT",          natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Proposta Enviada", responsavel:"Guilherme", prioridade:"Alta",      proximaAcao:"Retomar contato: gestores jÃ¡ avaliaram a proposta?", dataInicio:"2026-06-20" },
  { id:"fecomercio",  empresa:"FECOMÃRCIO MT",  natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Proposta Enviada", responsavel:"Isa",       prioridade:"Alta",      proximaAcao:"Agendar apresentaÃ§Ã£o apÃ³s definiÃ§Ã£o da INVEST MT",   dataInicio:"2026-06-22" },
  { id:"investmt",    empresa:"INVEST MT",      natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Proposta Enviada", responsavel:"Isa",       prioridade:"Alta",      proximaAcao:"Confirmar novo interlocutor apÃ³s troca de gestÃ£o",  dataInicio:"2026-06-15" },
  { id:"fcdlmt",      empresa:"FCDL MT",        natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Proposta Aceita",  responsavel:"Isa",       prioridade:"MÃ©dia",     proximaAcao:"Cobrar assinatura do memorando",                    dataInicio:"2026-06-10" },
  { id:"aprofi",      empresa:"APROFI / IMAFIR",natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Proposta Aceita",  responsavel:"Isa",       prioridade:"MÃ©dia",     proximaAcao:"Cobrar assinatura do memorando",                    dataInicio:"2026-06-10" },
  { id:"apexmt",      empresa:"APEX MT",        natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Nova Empresa",     responsavel:"Isa",       prioridade:"Monitorar", proximaAcao:"Definir abordagem e primeiro contato",              dataInicio:"2026-07-01" },
  { id:"agroclub",    empresa:"AgroClub",       natureza:"InstituiÃ§Ã£o", tipo:"Parceiro",      etapa:"Proposta Enviada", responsavel:"Isa",       prioridade:"Alta",      proximaAcao:"ReuniÃ£o em julho + citar missÃ£o tÃ©cnica",           dataInicio:"2026-06-25" },
  { id:"prefeitura",  empresa:"Prefeitura",     natureza:"InstituiÃ§Ã£o", tipo:"ServiÃ§o",       etapa:"Proposta Enviada", responsavel:"Isa",       prioridade:"Alta",      proximaAcao:"Falar com Kamil sobre alinhamento (Indian Day)",    dataInicio:"2026-06-28" },
  { id:"sipal",       empresa:"Sipal",          natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Nova Empresa",     responsavel:"Athena",    prioridade:"MÃ©dia",     proximaAcao:"Aguardar retorno da agenda",                        dataInicio:"2026-07-05" },
  { id:"kamil",       empresa:"Kamil Produtora",natureza:"Empresa",     tipo:"ServiÃ§o",       etapa:"Proposta Enviada", responsavel:"Isa",       prioridade:"MÃ©dia",     proximaAcao:"Alinhar produÃ§Ã£o do Indian Day",                    dataInicio:"2026-07-02" },
  { id:"prosmart",    empresa:"Prosmart",       natureza:"Empresa",     tipo:"ServiÃ§o",       etapa:"Nova Empresa",     responsavel:"Marcel",    prioridade:"MÃ©dia",     proximaAcao:"Follow-up com Cleiton",                             dataInicio:"2026-07-08" },
  { id:"copercotton", empresa:"Copercotton",    natureza:"Empresa",     tipo:"Institucional", etapa:"Proposta Enviada", responsavel:"Marcel",    prioridade:"Monitorar", proximaAcao:"Aguardar retorno do Victor",                        dataInicio:"2026-07-03" },
  { id:"ibraf",       empresa:"IBRAF",          natureza:"InstituiÃ§Ã£o", tipo:"Institucional", etapa:"Nova Empresa",     responsavel:"LÃ©o",       prioridade:"MÃ©dia",     proximaAcao:"Follow-up IBRAF",                                   dataInicio:"2026-07-06" },
  { id:"prosoja",     empresa:"Pro Soja",       natureza:"Empresa",     tipo:"Institucional", etapa:"Nova Empresa",     responsavel:"Marcel",    prioridade:"Monitorar", proximaAcao:"Primeiro contato",                                  dataInicio:"2026-07-09" },
];

// MOU assinados (Arquivo com caminhos)
const SEED_ARQUIVO = [
  { id:"mou1", empresa:"LIDE MT",    natureza:"InstituiÃ§Ã£o", tipo:"Institucional", resultado:"Ganho", motivo:"MOU assinado â parceria ativa",   dataEncerramento:"2026-05-20", responsavel:"Isa",       linkDoc:"https://drive.google.com/drive/folders/LIDE_MT_MOU" },
  { id:"mou2", empresa:"LIDE ÃNDIA", natureza:"InstituiÃ§Ã£o", tipo:"Institucional", resultado:"Ganho", motivo:"MOU assinado â parceria ativa",   dataEncerramento:"2026-06-04", responsavel:"Isa",       linkDoc:"https://drive.google.com/drive/folders/LIDE_INDIA_MOU" },
  { id:"mou3", empresa:"FCDL MT",    natureza:"InstituiÃ§Ã£o", tipo:"Institucional", resultado:"Ganho", motivo:"Memorando assinado â aguard. ratificaÃ§Ã£o", dataEncerramento:"2026-07-01", responsavel:"Isa", linkDoc:"" },
  { id:"mou4", empresa:"APROFI / IMAFIR",natureza:"InstituiÃ§Ã£o",tipo:"Institucional",resultado:"Ganho",motivo:"Memorando assinado â aguard. ratificaÃ§Ã£o", dataEncerramento:"2026-07-01", responsavel:"Isa", linkDoc:"" },
];

// Metas para a MissÃ£o â conteÃºdo real do planejamento estratÃ©gico
const SEED_METAS = {
  delegados: [
    { inst:"FIEMT",           delegados:4 },
    { inst:"FECOMÃRCIO MT",   delegados:4 },
    { inst:"FCDL MT",         delegados:4 },
    { inst:"INVEST MT",       delegados:4 },
    { inst:"LIDE MT",         delegados:4 },
    { inst:"APROFI / IMAFIR", delegados:4 },
    { inst:"APEX MT",         delegados:4 },
    { inst:"AgroClub",        delegados:4 },
    { inst:"LIDE Ãndia",      delegados:4 },
    { inst:"InstituiÃ§Ã£o 10",  delegados:4 },
    { inst:"InstituiÃ§Ã£o 11",  delegados:4 },
    { inst:"InstituiÃ§Ã£o 12",  delegados:3 },
    { inst:"InstituiÃ§Ã£o 13",  delegados:3 },
  ],
  cenarioAtivo: "A",       // "A" ou "B"
  subcenario: "conservador", // "conservador" ou "otimista"
  convertidosReais: 0,       // preenchido conforme avanÃ§o
};

const SEED_TAREFAS = [
  { id:"t1",  tarefa:"Articular reuniÃ£o com Fiemt (aguardar material da LetÃ­cia)", responsavel:"â",         feito:true  },
  { id:"t2",  tarefa:"Pedir Ã  Luciana reuniÃ£o com FecomÃ©rcio",                      responsavel:"Marcel",    feito:false },
  { id:"t3",  tarefa:"Agendar reuniÃ£o de atualizaÃ§Ã£o com Investe",                  responsavel:"Marcel",    feito:false },
  { id:"t4",  tarefa:"Follow-up com Cleiton (Prosmart)",                            responsavel:"Marcel",    feito:false },
  { id:"t5",  tarefa:"Aguardar Victor (Copercotton)",                               responsavel:"â",         feito:true  },
  { id:"t6",  tarefa:"Acompanhar MOUs: Governo do Estado e Assembleia Legislativa", responsavel:"Marcel",    feito:false },
  { id:"t7",  tarefa:"Primeiros contatos: Pro Soja, Tribunal de Contas, Sind. Rural de Canarana", responsavel:"Marcel", feito:false },
  { id:"t8",  tarefa:"Follow-up IBRAF",                                             responsavel:"LÃ©o / Gui", feito:false },
  { id:"t9",  tarefa:"Confirmar participaÃ§Ã£o da FederaÃ§Ã£o CDLs (aguardar contexto)",responsavel:"Bia / LÃ©o", feito:false },
  { id:"t10", tarefa:"Emitir passagens e reservar hotÃ©is do evento de outubro",     responsavel:"Isabella",  feito:false },
  { id:"t11", tarefa:"Comunicar Durval sobre logo da CÃ¢mara na divulgaÃ§Ã£o",         responsavel:"Marcel",    feito:false },
  { id:"t12", tarefa:"Mandar lista de providÃªncias do Marcel para ele",             responsavel:"Isabella",  feito:false },
];

// ââ HELPERS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const uid = (p="id") => `${p}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
const fmtDate = d => { if(!d)return"â"; const p=String(d).split("-"); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d; };
const funnelColor = (C,etapa) => { const f=FUNNEL.find(x=>x.key===etapa); return f?C[f.colorKey]:C.textLight; };
const makeStyles = C => ({
  inp:  { width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.card,boxSizing:"border-box",outline:"none",fontFamily:"inherit" },
  lbl:  { display:"block",fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8,marginBottom:4 },
  btnP: { padding:"8px 16px",borderRadius:8,border:"none",background:C.accent,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer" },
  btnS: { padding:"8px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:C.card,color:C.textMid,fontWeight:600,fontSize:12,cursor:"pointer" },
  card: { background:C.card,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.mode==="light"?"0 1px 3px rgba(0,0,0,.05)":"0 1px 3px rgba(0,0,0,.3)" },
});

// ââ PRIMITIVOS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Chakra({ size=18, color }) {
  const { C } = useTheme(); const col=color||C.accent;
  const sp=Array.from({length:24},(_,i)=>i*15);
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={col} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" stroke={col} strokeWidth="1.5"/>
    {sp.map((a,i)=>{const r=a*Math.PI/180;return <line key={i} x1={12+4*Math.cos(r)} y1={12+4*Math.sin(r)} x2={12+10*Math.cos(r)} y2={12+10*Math.sin(r)} stroke={col} strokeWidth=".8"/>;})}</svg>);
}
function PatternBg() {
  return (<svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.09,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="ibcc-bg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth=".8"/>
      <circle cx="20" cy="20" r="4" fill="none" stroke="white" strokeWidth=".5"/>
      <line x1="20" y1="12" x2="20" y2="0" stroke="white" strokeWidth=".5"/>
      <line x1="20" y1="28" x2="20" y2="40" stroke="white" strokeWidth=".5"/>
      <line x1="12" y1="20" x2="0" y2="20" stroke="white" strokeWidth=".5"/>
      <line x1="28" y1="20" x2="40" y2="20" stroke="white" strokeWidth=".5"/>
    </pattern></defs>
    <rect width="100%" height="100%" fill="url(#ibcc-bg)"/></svg>);
}
function PrioBadge({ prioridade }) {
  const { C }=useTheme(); const cfg=prioCfg(C)[prioridade]||prioCfg(C)["Monitorar"];
  return (<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:cfg.bg,color:cfg.color}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:cfg.color}}/>{cfg.label}</span>);
}
function Pill({ children, color, bg }) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:bg,color}}>{children}</span>;
}
function ProgressBar({ value, max, color }) {
  const {C}=useTheme(); const pct=max>0?Math.min(100,Math.round((value/max)*100)):0;
  return (<div style={{height:9,background:C.borderSoft,borderRadius:20,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${pct}%`,background:color||C.accent,borderRadius:20,transition:"width .4s"}}/></div>);
}

// ââ KPI CARD ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Kpi({ label, value, sub, color, valueColor }) {
  const {C}=useTheme(); const s=makeStyles(C);
  return (<div style={{...s.card,padding:"15px 18px",borderLeft:`3px solid ${color||C.navy}`}}>
    <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>{label}</div>
    <div style={{fontSize:24,fontWeight:800,color:valueColor||C.text,lineHeight:1.1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.textMid,marginTop:4}}>{sub}</div>}
  </div>);
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  VISÃO EXECUTIVA (sem receita / tempo mÃ©dio / mais rÃ¡pida / demorada)    â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
function VisaoExecutiva({ pipeline, metas, onGoPipeline }) {
  const {C}=useTheme(); const s=makeStyles(C);
  const instLeads = pipeline.filter(l=>l.tipo==="Institucional");
  const servLeads = pipeline.filter(l=>l.tipo==="ServiÃ§o");
  const alta      = pipeline.filter(l=>l.prioridade==="Alta").length;
  const totalDel  = metas.delegados.reduce((a,d)=>a+d.delegados,0);
  const instCount = pipeline.filter(l=>l.natureza==="InstituiÃ§Ã£o").length;
  const empCount  = pipeline.filter(l=>l.natureza==="Empresa").length;

  const funilCounts = FUNNEL_KEYS.map(k=>({ etapa:k, n:instLeads.filter(l=>l.etapa===k).length }));
  const maxFunil = Math.max(1,...funilCounts.map(f=>f.n));
  const acoes = [...pipeline].filter(l=>l.proximaAcao)
    .sort((a,b)=>PRIORIDADES.indexOf(a.prioridade)-PRIORIDADES.indexOf(b.prioridade)).slice(0,8);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* KPIs linha 1 */}
      <div className="g4">
        <Kpi label="Leads Ativos"            value={pipeline.length} sub={`${instLeads.length} institucional Â· ${servLeads.length} serviÃ§os`} color={C.navy}/>
        <Kpi label="Alta Prioridade"          value={alta}            sub="em acompanhamento" color={C.red} valueColor={C.red}/>
        <Kpi label="InstituiÃ§Ãµes no pipeline"value={instCount}       sub="ðï¸ entidades" color={C.navyMid}/>
        <Kpi label="Empresas no pipeline"    value={empCount}        sub="ð¢ empresas" color={C.accent}/>
      </div>
      {/* KPIs linha 2 */}
      <div className="g3">
        <Kpi label="Meta de delegados"  value={totalDel}                     sub="13 instituiÃ§Ãµes" color={C.blue}/>
        <Kpi label="InstituiÃ§Ãµes ativas"value={metas.delegados.filter(d=>!d.inst.startsWith("InstituiÃ§Ã£o")).length} sub="nomes confirmados" color={C.green}/>
        <Kpi label="CenÃ¡rio ativo"      value={`CenÃ¡rio ${metas.cenarioAtivo}`} sub={metas.subcenario} color={C.purple}/>
      </div>

      {/* Funil */}
      <div style={{...s.card,padding:"18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:800,color:C.text}}>Funil Â· Leads Institucionais</div>
          <button onClick={onGoPipeline} style={s.btnS}>Ver pipeline â</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {funilCounts.map(f=>{
            const col=funnelColor(C,f.etapa);
            const pct=Math.round((f.n/maxFunil)*100);
            return (<div key={f.etapa} style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:140,flexShrink:0,fontSize:12,fontWeight:600,color:C.textMid}}>{f.etapa}</div>
              <div style={{flex:1,height:22,background:C.borderSoft,borderRadius:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.max(pct,f.n>0?6:0)}%`,background:col,borderRadius:6,transition:"width .4s"}}/>
              </div>
              <div style={{width:26,textAlign:"right",montSize:14,fontWeight:800,color:C.text}}>{f.n}</div>
            </div>);
          })}
        </div>
      </div>

      {/* PrÃ³ximas aÃ§Ãµes */}
      <div style={{...s.card,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:800,color:C.text}}>PrÃ³ximas AÃ§Ãµes</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
            <thead><tr style={{background:C.cardAlt}}>
              {["Prioridade","Empresa","Tipo","AÃ§Ã£o Pendente","Resp."].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"10px 16px",montSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.6}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {acoes.map(l=>(
                <tr key={l.id} style={{borderTop:`1px solid ${C.borderSoft}`}}>
                  <td style={{padding:"11px 16px"}}><PrioBadge prioridade={l.prioridade}/></td>
                  <td style={{padding:"11px 16px",fontSize:13,fontWeight:700,color:C.text}}>{l.empresa}</td>
                  <td style={{padding:"11px 16px"}}><Pill color={l.tipo==="Institucional"?C.blue:l.tipo==="Parceiro"?C.green:C.purple} bg={l.tipo==="Institucional"?C.blueSoft:l.tipo==="Parceiro"?C.greenSoft:C.purpleSoft}>{l.tipo==="Parceiro"?"ð¤ ":""}{l.tipo}</Pill></td>
                  <td style={{padding:"11px 16px",fontSize:12,color:C.textMid,maxWidth:300}}>{l.proximaAcao}</td>
                  <td style={{padding:"11px 16px",fontSize:12,color:C.textMid,whiteSpace:"nowrap"}}>{l.responsavel}</td>
                </tr>
              ))}
              {acoes.length===0&&<tr><td colSpan={5} style={{padding:"28px",textAlign:"center",color:C.textLight,fontSize:13}}>Nenhuma aÃ§Ã£o pendente.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
/â  PIPELINE (sem coluna Valor; "AssociaÃ§Ã£o" â "Institucional")             â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
function PipelineTab({ pipeline, setPipeline, onArquivar, responsaveis }) {
  const {C}=useTheme(); const s=makeStyles(C);
  const [fTipo,setFTipo]=useState("Todos");
  const [fEtapa,setFEtapa]=useState("Todos");
  const [fNat,setFNat]=useState("Todos");
  const [busca,setBusca]=useState("");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(null);

  const respList = responsaveis&&responsaveis.length?responsaveis:["â"];
  const novo=()=>{ setForm({id:uid("l"),empresa:"",natureza:"InstituiÃ§Ã£o",tipo:"Institucional",etapa:"Nova Empresa",responsavel:respList[0],prioridade:"MÃ©dia",proximaAcao:"",dataInicio:new Date().toISOString().split("T")[0]}); setShowForm(true); };
  const editar=l=>{ setForm({...l}); setShowForm(true); };
  const salvar=()=>{ if(!form.empresa.trim())return; setPipeline(prev=>prev.some(p=>p.id===form.id)?prev.map(p=>p.id===form.id?form:p):[...prev,form]); setShowForm(false); setForm(null); };
  const remover=id=>setPipeline(prev=>prev.filter(p=>p.id!==id));
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  const filtered=pipeline.filter(l=>{
    const mt=fTipo==="Todos"||l.tipo===fTipo;
    const me=fEtapa==="Todos"||l.etapa===fEtapa;
    const mn=fNat==="Todos"||l.natureza===fNat;
    const mq=!busca||l.empresa.toLowerCase().includes(busca.toLowerCase());
    return mt&&me&&mn&&mq;
  });

  const Seg=({options,value,onChange})=>(
    <div style={{display:"inline-flex",border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
      {options.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"7px 13px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:value===o?C.accent:C.card,color:value===o?"#fff":C.textMid}}>{o}</button>)}
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <input placeholder="ð Buscar..." value={busca} onChange={e=>setBusca(e.target.value)} style={{...s.inp,flex:"1 1 180px",maxWidth:240}}/>
        <Seg options={["Todos","Institucional","ServiÃ§o","Parceiro"]} value={fTipo} onChange={setFTipo}/>
        <Seg options={["Todos","InstituiÃ§Ã£o","Empresa"]}   value={fNat}  onChange={setFNat}/>
        <select value={fEtapa} onChange={e=>setFEtapa(e.target.value)} style={{...s.inp,width:"auto"}}>
          <option>Todos</option>{FUNNEL_KEYS.map(k=><option key={k}>{k}</option>)}
        </select>
        <button onClick={novo} style={{...s.btnP,marginLeft:"auto"}}>+ Novo lead</button>
      </div>

      {showForm&&form&&(
        <div style={{...s.card,padding:"18px 20px"}}>
          <div className="gform" style={{marginBottom:12}}>
            <div><label style={s.lbl}>Empresa / InstituiÃ§Ã£o *</label><input value={form.empresa} onChange={e=>set("empresa",e.target.value)} style={s.inp}/></div>
            <div><label style={s.lbl}>Natureza</label><select value={form.natureza} onChange={e=>set("natureza",e.target.value)} style={s.inp}>{NATUREZA_LIST.map(x=><option key={x}>{x}</option>)}</select></div>
            <div><label style={s.lbl}>Tipo</label><select value={form.tipo} onChange={e=>set("tipo",e.target.value)} style={s.inp}>{TIPO_LEAD_LIST.map(x=><option key={x}>{x}</option>)}</select></div>
            <div><label style={s.lbl}>Etapa do funil</label><select value={form.etapa} onChange={e=>set("etapa",e.target.value)} style={s.inp}>{FUNNEL_KEYS.map(x=><option key={x}>{x}</option>)}</select></div>
            <div><label style={s.lbl}>ResponsÃ¡vel</label><select value={form.responsavel} onChange={e=>set("responsavel",e.target.value)} style={s.inp}>{respList.map(x=><option key={x}>{x}</option>)}</select></div>
            <div><label style={s.lbl}>Prioridade</label><select value={form.prioridade} onChange={e=>set("prioridade",e.target.value)} style={s.inp}>{PRIORIDADES.map(x=><option key={x}>{x}</option>)}</select></div>
            <div><label style={s.lbl}>Data de inÃ­cio</label><input type="date" value={form.dataInicio} onChange={e=>set("dataInicio",e.target.value)} style={s.inp}/></div>
          </div>
          <div style={{marginBottom:12}}><label style={s.lbl}>PrÃ³xima aÃ§Ã£o</label><input value={form.proximaAcao} onChange={e=>set("proximaAcao",e.target.value)} style={s.inp}/></div>
     0    <div style={{display:"flex",gap:8}}>
            <button onClick={salvar} style={s.btnP}>Salvar</button>
            <button onClick={()=>{setShowForm(false);setForm(null);}} style={s.btnS}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{...s.card,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
            <thead><tr style={{background:C.navy}}>
              {["Empresa","Natureza","Tipo","Etapa","Prioridade","Resp.",""].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"11px 14px",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.65)",textTransform:"uppercase",letterSpacing:.6}}>{h}</th>
  3           ))}
            </tr></thead>
            <tbody>
              {filtered.map(l=>(
                <tr key={l.id} style={{borderTop:`1px solid ${C.borderSoft}`}}>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{l.empresa}</div>
                    {l.proximaAcao&&<div style={{fontSize:11,color:C.textLight,marginTop:2}}>{l.proximaAcao}</div>}
                  </td>
                  <td style={{padding:"11px 14px"}}>
                    <Pill color={l.natureza==="InstituiÃ§Ã£o"?C.navyMid:C.accent} bg={l.natureza==="InstituiÃ§Ã£o"?C.blueSoft:C.accentSoft}>
                      {l.natureza==="InstituiÃ§Ã£o"?"ðï¸":"ð¢"} {l.natureza}
            0       </Pill>
                  </td>
                  <td style={{padding:"11px 14px"}}><Pill color={l.tipo==="Institucional"?C.blue:l.tipo==="Parceiro"?C.green:C.purple} bg={l.tipo==="Institucional"?C.blueSoft:l.tipo==="Parceiro"?C.greenSoft:C.purpleSoft}>{l.tipo==="Parceiro"?"ð¤ ":""}{l.tipo}</Pill></td>
                  <td style={{padding:"11px 14px"}}>
        0           <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:funnelColor(C,l.etapa)}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:funnelColor(C,l.etapa)}}/>{l.etapa}
                    </span>
                  </td>
                  <td style={{padding:"11px 14px"}}><PrioBadge prioridade={l.prioridade}/></td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.textMid,whiteSpace:"nowrap"}}>{l.responsavel}</td>
                  <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>editar(l)} style={{...s.btnS,padding:"4px 9px",marginRight:4}}>âï¸</button>
                    <button onClick={()=>onArquivar(l)} style={{...s.btnS,padding:"4px 9px",marginRight:4}}>ð¥</button>
                    <button onClick={()=>remover(l.id)} style={{...s.btnS,padding:"4px 9px"}}>ðï¸</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={7} style={{padding:"32px",textAlign:"center",color:C.textLight,fontSize:13}}>Nenhum lead encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  METAS PARA MISSÃO â cenÃ¡rios do planejamento estratÃ©gico                â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
const CENARIOS = {
  A: {
    conservador: { label:"CenÃ¡rio A Â· Conservador (30%)", inst:10, taj:5,  total:15, receita:43000 },
    otimista:    { label:"CenÃ¡rio A Â· Otimista (50%)",    inst:18, taj:7,  total:25, receita:68600 },
  },
  B: {
    conservador: { label:"CenÃ¡rio B Â· Conservador (30%)", inst:5,  taj:10, total:15, receita:54500 },
    otimista:    { label:"CenÃ¡rio B Â· Otimista (50%)",    inst:7,  taj:18, total:25, receita:93900 },
  },
};
const PLANOS = {
  inst: { label:"Institucional", valor:"US$ 2.100/ano",  cor:"#2680C2" },
  taj:  { label:"TAJ",          valor:"US$ 4.400 (1Âº sem.)", cor:"#E8751A" },
};

function MetasMissao({ metas, setMetas }) {
  const {C}=useTheme(); const s=makeStyles(C);
  const cn = metas.cenarioAtivo || "A";
  const sc = metas.subcenario   || "conservador";
  const cenario = CENARIOS[cn][sc];
  const totalDel = metas.delegados.reduce((a,d)=>a+d.delegados,0);
  const conv = Number(metas.convertidosReais)||0;
  const pctConv = cenario.total>0?Math.min(100,Math.round((conv/cenario.total)*100)):0;
  const receita = conv>0 ? Math.round((conv/cenario.total)*cenario.receita) : 0;

  const updDel=(inst,v)=>setMetas(m=>({...m,delegados:m.delegados.map(d=>d.inst===inst?{...d,delegados:Number(v)||0}:d)}));
  const fmtUSD = v => `US$ ${Number(v).toLocaleString("pt-BR")}`;

  const Seg2=({options,value,onChange})=>(
    <div style={{display:"inline-flex",border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
      {options.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"8px 16px",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:value===o?C.navy:C.card,color:value===o?"#fff":C.textMid}}>{o}</button>)}
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* CabeÃ§alho informativo */}
      <div style={{...s.card,padding:"16px 20px",borderLeft:`3px solid ${C.accent}`,background:C.mode==="light"?"#FFFBF5":C.card}}>
        <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:4}}>MissÃ£o TÃ©cnica Ã  Ãndia â Planejamento de ConversÃ£o 2027</div>
        <div style={{fontSize:12,color:C.textMid,lineHeight:1.6}}>
          Meta: <b>50 delegados</b> Â· 13 instituiÃ§Ãµes Â· Planos disponÃ­veis: <b>Institucional</b> (US$ 2.100/ano) e <b>TAJ</b> (US$ 500 adesÃ£o + 6Ã US$ 650). O TAJ MAHAL Ã© tratado como oportunidade eventual (grandes empresas), nÃ£o como meta de conversÃ£o padrÃ£o.
        </div>
      </div>

      {/* Seletor de cenÃ¡rio */}
      <div style={{...s.card,padding:"18px 20px"}}>
        <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>CenÃ¡rio estratÃ©gico ativo</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>EstratÃ©gia de conversÃ£o</div>
            <Seg2 options={["A","B"]} value={cn} onChange={v=>setMetas(m=>({...m,cenarioAtivo:v}))}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>ProjeÃ§Ã£o</div>
            <Seg2 options={["conservador","otimista"]} value={sc} onChange={v=>setMetas(m=>({...m,subcenario:v}))}/>
          </div>
        </div>

        {/* DescriÃ§Ã£o do cenÃ¡rio */}
        <div style={{background:C.cardAlt,borderRadius:8,padding:"12px 16px",marginBottom:16,fontSize:12,color:C.textMid,lineHeight:1.7}}>
          {cn==="A"
            ? <><b>CenÃ¡rio A â Maioria Institucional.</b> Prioriza o plano Institucional como porta de entrada (custo acessÃ­vel). Ideal para gestores pÃºblicos, tÃ©cnicos e pequenos empresÃ¡rios. Momento de abordagem: durante a missÃ£o ou nos primeiros 15 dias apÃ³s o retorno.</>
            : <><b>CenÃ¡rio B â Maioria TAJ.</b> MissÃ£o posicionada como acelerador de negÃ³cios para empresÃ¡rios com intenÃ§Ã£o concreta de operar no mercado indiano. Abordagem ideal ainda durante a missÃ£o, quando a percepÃ§Ã£o de valor estÃ¡ no pico.</>}
        </div>

        {/* Cards de projeÃ§Ã£o */}
        <div className="g4">
          {[
            { label:"Delegados na missÃ£o", value:totalDel,            color:C.navy,   icon:"âï¸" },
            { label:"Meta de conversÃ£o",   value:`${cenario.total}`,  color:C.accent, icon:"ð¯" },
            { label:"Institucional",       value:`${cenario.inst}`,   color:C.blue,   icon:"ðï¸" },
            { label:"TAJ",                 value:`${cenario.taj}`,    color:C.gold,   icon:"â­" },
          ].map(k=>(
            <div key={k.label} style={{background:C.cardAlt,borderRadius:10,padding:"14px 16px",borderTop:`3px solid ${k.color}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>{k.icon} {k.label}</div>
              <div style={{fontSize:26,fontWeight:800,color:k.color}}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Acompanhamento real + receita projetada */}
      <div style={{...s.card,padding:"18px 20px"}}>
        <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>Acompanhamento de conversÃ£o pÃ³s-missÃ£o</div>
        <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",marginBottom:16}}>
          <div>
            <label style={{...s.lbl,marginBottom:6}}>Convertidos atÃ© agora</label>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input type="number" min="0" max={cenario.total} value={conv}
                onChange={e=>setMetas(m=>({...m,convertidosReais:Number(e.target.value)||0}))}
                style={{...s.inp,width:80,textAlign:"center",fontSize:20,fontWeight:800}}/>
              <span style={{fontSize:13,color:C.textLight}}>de {cenario.total} meta</span>
            </div>
          </div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.textMid}}>Progresso</span>
              <span style={{fontSize:12,fontWeight:700,color:C.green}}>{pctConv}%</span>
            </div>
            <div style={{height:14,background:C.borderSoft,borderRadius:20,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pctConv}%`,background:C.green,borderRadius:20,transition:"width .4s"}}/>
            </div>
          </div>
        </div>
        {/* Receita projetada */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{background:C.greenSoft,borderRadius:10,padding:"12px 18px",flex:1,minWidth:180,borderLeft:`3px solid ${C.green}`}}>
            <div style={{fontSize:10,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Receita projetada (cenÃ¡rio)</div>
            <div style={{fontSize:22,fontWeight:800,color:C.green}}>{fmtUSD(cenario.receita)}</div>
            <div style={{fontSize:11,color:C.textMid,marginTop:2}}>{cenario.label}</div>
          </div>
          {conv>0&&(
            <div style={{background:C.accentSoft,borderRadius:10,padding:"12px 18px",flex:1,minWidth:180,borderLeft:`3px solid ${C.accent}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Receita parcial estimada</div>
              <div style={{fontSize:22,fontWeight:800,color:C.accent}}>{fmtUSD(receita)}</div>
              <div style={{fontSize:11,color:C.textMid,marginTop:2}}>proporcional aos {conv} convertidos</div>
            </div>
          )}
        </div>
      </div>

      {/* DistribuiÃ§Ã£o de delegados */}
      <div style={{...s.card,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:13,fontWeight:800,color:C.text}}>DistribuiÃ§Ã£o de delegados por instituiÃ§Ã£o</div>
          <div style={{fontSize:11,color:C.textLight}}>Total: {totalDel} delegados</div>
        </div>
        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
          {metas.delegados.map((d,i)=>{
            const isTbd=d.inst.startsWith("InstituiÃ§Ã£o ");
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:170,flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12}}>{isTbd?"â¬":"ðï¸"}</span>
                  <span style={{fontSize:12,fontWeight:isTbd?400:600,color:isTbd?C.textLight:C.text}}>{d.inst}</span>
                </div>
                <div style={{flex:1,height:18,background:C.borderSoft,borderRadius:20,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.round((d.delegados/4)*100)}%`,background:isTbd?C.borderSoft:C.navyMid,borderRadius:20,transition:"width .4s"}}/>
                </div>
                <input type="number" min="0" max="10" value={d.delegados}
                  onChange={e=>updDel(d.inst,e.target.value)}
                  style={{...s.inp,width:50,padding:"3px 6px",textAlign:"center",fontSize:13,fontWeight:700}}/>
                <span style={{fontSize:11,color:C.textLight,width:30,flexShrink:0}}>del.</span>
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.textLight,background:C.cardAlt}}>
          ð¡ InstituiÃ§Ãµes marcadas com â¬ ainda nÃ£o tiveram nome confirmado. Edite o nÃºmero de delegados conforme o mapeamento avanÃ§a.
        </div>
      </div>

      {/* Nota TAJ Mahal */}
      <div style={{...s.card,padding:"14px 18px",background:C.purpleSoft,border:`1px solid ${C.purple}22`}}>
        <div style={{fontSize:12,fontWeight:700,color:C.purple,marginBottom:4}}>â­ TAJ MAHAL â Nota estratÃ©gica</div>
        <div style={{fontSize:12,color:C.textMid,lineHeight:1.7}}>NÃ£o entra como meta de conversÃ£o padrÃ£o. Destinado a grandes empresas com operaÃ§Ãµes bilaterais estabelecidas. Identificar previamente 2â3 perfis entre os 50 delegados e realizar abordagem individualizada e consultiva, separada do processo de conversÃ£o em grupo.</div>
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  ARQUIVO â MOUs e encerrados com caminhos de documento                   â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
function ArquivoTab({ arquivo, setArquivo, onRestaurar, responsaveis }) {
  const {C}=useTheme(); const s=makeStyles(C);
  const respList = responsaveis&&responsaveis.length?responsaveis:["â"];
  const [fRes,setFRes]=useState("Todos");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(null);

  const novo=()=>{ setForm({id:uid("arq"),empresa:"",natureza:"InstituiÃ§Ã£o",tipo:"Institucional",resultado:"Ganho",motivo:"",dataEncerramento:new Date().toISOString().split("T")[0],responsavel:respList[0],linkDoc:""}); setShowForm(true); };
  const editar=a=>{ setForm({...a}); setShowForm(true); };
  const salvar=()=>{ if(!form.empresa.trim())return; setArquivo(prev=>prev.some(x=>x.id===form.id)?prev.map(x=>x.id===form.id?form:x):[...prev,form]); setShowForm(false); setForm(null); };
  const remover=id=>setArquivo(prev=>prev.filter(a=>a.id!==id));
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  const filtered=arquivo.filter(a=>fRes==="Todos"||a.resultado===fRes);
  const ganhos=arquivo.filter(a=>a.resultado==="Ganho").length;
  const perdidos=arquivo.filter(a=>a.resultado==="Perdido").length;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div className="g2">
        <div style={{...s.card,padding:"15px 18px",borderLeft:`3px solid ${C.green}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8}}>â MOUs / Ganhos</div>
          <div style={{fontSize:28,fontWeight:800,color:C.green}}>{ganhos}</div>
        </div>
        <div style={{...s.card,padding:"15px 18px",borderLeft:`3px solid ${C.red}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.8}}>â Perdidos /`Encerrados</div>
          <div style={{fontSize:28,fontWeight:800,color:C.red}}>{perdidos}</div>
        </div>
      </div>

      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"inline-flex",border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          {["Todos","Ganho","Perdido"].map(o=><button key={o} onClick={()=>setFRes(o)} style={{padding:"7px 14px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:fRes===o?C.accent:C.card,color:fRes===o?"#fff":C.textMid}}>{o}</button>)}
        </div>
        <button onClick={novo} style={{...s.btnP,marginLeft:"auto"}}>+ Adicionar registro</button>
      </div>

      {showForm&&form&&(
        <div style={{...s.card,padding:"18px 20px"}}>
          <div className="gform" style={{marginBottom:12}}>
            <div><label style={s.lbl}>Empresa *</label><input value={form.empresa} onChange={e=>set("empresa",e.target.value)} style={s.inp}/></div>
            <div><label style={s.lbl}>Natureza</label><select value={form.natureza} onChange={e=>set("natureza",e.target.value)} style={s.inp}>{NATUREZA_LIST.map(x=><option key={x}>{x}</option>)}</select></div>
            <div><label style={s.lbl}>Resultado</label><select value={form.resultado} onChange={e=>set("resultado",e.target.value)} style={s.inp}><option>Ganho</option><option>Perdido</option></select></div>
            <div><label style={s.lbl}>Data</label><input type="date" value={form.dataEncerramento} onChange={e=>set("dataEncerramento",e.target.value)} style={s.inp}/></div>
            <div><label style={s.lbl}>ResponsÃ¡vel</label><select value={form.responsavel} onChange={e=>set("responsavel",e.target.value)} style={s.inp}>{respList.map(x=><option key={x}>{x}</option>)}</select></div>
          </div>
          <div style={{marginBottom:10}}><label style={s.lbl}>HistÃ³rico / Motivo</label><input value={form.motivo} onChange={e=>set("motivo",e.target.value)} style={s.inp}/></div>
          <div style={{marginBottom:12}}><label style={s.lbl}>Link do documento (Drive, SharePoint etc.)</label><input value={form.linkDoc} onChange={e=>set("linkDoc",e.target.value)} placeholder="https://drive.google.com/..." style={s.inp}/></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={salvar} style={s.btnP}>Salvar</button>
            <button onClick={()=>{setShowForm(false);setForm(null);}} style={s.btnS}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{...s.card,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead><tr style={{background:C.navy}}>
              {["Empresa","Resultado","Tipo","HistÃ³rico","Documento","Data","Resp.",""].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"11px 14px",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.65)",textTransform:"uppercase",letterSpacing:.6}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id} style={{borderTop:`1px solid ${C.borderSoft}`}}>
                  <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.text}}>{a.empresa}</td>
                  <td style={{padding:"11px 14px"}}>
                    <Pill color={a.resultado==="Ganho"?C.green:C.red} bg={a.resultado==="Ganho"?C.greenSoft:C.redSoft}>
                      {a.resultado==="Ganho"?"â":"â"} {a.resultado}
                    </Pill>
                  </td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.textMid}}>{a.tipo||"â"}</td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.textMid,maxWidth:260}}>{a.motivo||"â"}</td>
                  <td style={{padding:"11px 14px"}}>
                    {a.linkDoc
                      ? <a href={a.linkDoc} target="_blank" rel="noreferrer"
                          style={{fontSize:12,color:C.blue,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>
  3                       ð Abrir
                        </a>
                      : <span style={{fontSize:12,color:C.textLight}}>â</span>}
                  </td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.textMid,whiteSpace:"nowrap"}}>{fmtDate(a.dataEncerramento)}</td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.textMid}}>{a.responsavel}</td>
                  <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}>
                    <button onClick={()=>editar(a)} style={{...s.btnS,padding:"4px 9px",marginRight:4}}>âï¸</button>
                    <button onClick={()=>onRestaurar(a)} title="Voltar ao pipeline" style={{...s.btnS,padding:"4px 9px",marginRight:4}}>â©ï¸</button>
                    <button onClick={()=>remover(a.id)} style={{...s.btnS,padding:"4px 9px"}}>ðï¸</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={8} style={{padding:"32px",textAlign:"center",color:C.textLight,fontSize:13}}>Nenhum registro.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{...s.card,padding:"12px 16px",background:C.blueSoft,border:`1px solid ${C.border}`,fontSize:11,color:C.textMid,display:"flex",gap:8,alignItems:"flex-start"}}>
        <span>ð¡</span><span>Para vincular MOUs assinados, cole o link direto do Google Drive ou SharePoint no campo "Link do documento". O arquivo abrirÃ¡ direto do painel sem precisar navegar atÃ© a pasta.</span>
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  TAREFAS                                                                   â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
function TarefasTab({ tarefas, setTarefas, responsaveis }) {
  const {C}=useTheme(); const s=makeStyles(C);
  const respList = responsaveis&&responsaveis.length?responsaveis:["â"];
  const [nova,setNova]=useState(""); const [resp,setResp]=useState(respList[0]||"â");
  const [editId,setEditId]=useState(null);
  const [editVal,setEditVal]=useState({tarefa:"",responsavel:""});

  const toggle  = id=>setTarefas(prev=>prev.map(t=>t.id===id?{...t,feito:!t.feito}:t));
  const remover = id=>setTarefas(prev=>prev.filter(t=>t.id!==id));
  const add     = ()=>{ if(!nova.trim())return; setTarefas(prev=>[...prev,{id:uid("t"),tarefa:nova,responsavel:resp,feito:false}]); setNova(""); };
  const iniciarEd = t=>{ setEditId(t.id); setEditVal({tarefa:t.tarefa,responsavel:t.responsavel}); };
  const salvarEd  = ()=>{ if(!editVal.tarefa.trim())return; setTarefas(prev=>prev.map(t=>t.id===editId?{...t,...editVal}:t)); setEditId(null); };
  const cancelarEd= ()=>setEditId(null);

  const pendentes=tarefas.filter(t=>!t.feito);
  const feitas   =tarefas.filter(t=>t.feito);
  const pct      =tarefas.length?Math.round((feitas.length/tarefas.length)*100):0;

  const Linha=({t})=>{
    const editing = editId===t.id;
    return (
      <div style={{borderTop:`1px solid ${C.borderSoft}`}}>
        {editing ? (
          /* ââ modo ediÃ§Ã£o ââ */
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",flexWrap:"wrap",background:C.cardAlt}}>
            <input autoFocus value={editVal.tarefa} onChange={e=>setEditVal(p=>({...p,tarefa:e.target.value}))}
              onKeyDown={e=>{ if(e.key==="Enter")salvarEd(); if(e.key==="Escape")cancelarEd(); }}
              style={{...s.inp,flex:"1 1 220px",fontSize:13}}/>
            <select value={editVal.responsavel} onChange={e=>setEditVal(p=>({...p,responsavel:e.target.value}))}
              style={{...s.inp,width:"auto",flexShrink:0}}>
              {respList.map(r=><option key={r}>{r}</option>)}
            </select>
            <button onClick={salvarEd}   style={{...s.btnP,padding:"6px 12px",fontSize:11}}>â Salvar</button>
            <button onClick={cancelarEd} style={{...s.btnS,padding:"6px 10px",fontSize:11}}>Ã Cancelar</button>
          </div>
        ) : (
          /* ââ modo leitura ââ */
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px"}}>
            <button onClick={()=>toggle(t.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",
              border:`2px solid ${t.feito?C.green:C.border}`,background:t.feito?C.green:"transparent",
              color:"#fff",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {t.feito?"â":""}
            </button>
            <div style={{flex:1,minWidth:0,fontSize:13,color:t.feito?C.textLight:C.text,textDecoration:t.feito?"line-through":"none",lineHeight:1.4}}>{t.tarefa}</div>
            <span style={{fontSize:11,fontWeight:700,color:C.textMid,background:C.cardAlt,borderRadius:20,padding:"3px 10px",whiteSpace:"nowrap",flexShrink:0}}>{t.responsavel}</span>
            <button onClick={()=>iniciarEd(t)} title="Editar" style={{background:"transparent",border:"none",cursor:"pointer",color:C.textLight,fontSize:14,flexShrink:0,padding:"0 2px"}}>âï¸</button>
            <button onClick={()=>remover(t.id)} title="Remover" style={{background:"transparent",border:"none",cursor:"pointer",color:C.textLight,fontSize:16,flexShrink:0}}>Ã</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{...s.card,padding:"16px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:800,color:C.text}}>Progresso das aÃ§Ãµes</div>
          <div style={{fontSize:13,fontWeight:700,color:C.green}}>{feitas.length}/{tarefas.length} concluÃ­das Â· {pct}%</div>
        </div>
        <div style={{height:10,background:C.borderSoft,borderRadius:20,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:C.green,borderRadius:20,transition:"width .4s"}}/>
        </div>
      </div>
      <div style={{...s.card,padding:"14px 18px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input placeholder="Nova aÃ§Ã£o..." value={nova} onChange={e=>setNova(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} style={{...s.inp,flex:"1 1 220px"}}/>
        <select value={resp} onChange={e=>setResp(e.target.value)} style={{...s.inp,width:"auto"}}>{respList.map(r=><option key={r}>{r}</option>)}</select>
        <button onClick={add} style={s.btnP}>+ Adicionar</button>
      </div>
      <div style={{...s.card,overflow:"hidden"}}>
        <div style={{padding:"13px 18px",fontSize:13,fontWeight:800,color:C.text,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:C.accent}}/> A fazer ({pendentes.length})
        </div>
        {pendentes.map(t=><Linha key={t.id} t={t}/>)}
        {pendentes.length===0&&<div style={{padding:"24px",textAlign:"center",color:C.textLight,fontSize:13,borderTop:`1px solid ${C.borderSoft}`}}>Tudo concluÃ­do! ð</div>}
      </div>
      <div style={{...s.card,overflow:"hidden"}}>
        <div style={{padding:"13px 18px",fontSize:13,fontWeight:800,color:C.text,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:C.green}}/> ConcluÃ­das ({feitas.length})
        </div>
        {feitas.map(t=><Linha key={t.id} t={t}/>)}
        {feitas.length===0&&<div style={{padding:"24px",textAlign:"center",color:C.textLight,fontSize:13,borderTop:`1px solid ${C.borderSoft}`}}>Nenhuma ainda.</div>}
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  AGENDA                                                                    â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
const MESES=["Janeiro","Fevereiro","MarÃ§o","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA=["Dom","Seg","Ter","Qua","Qui","Sex","SÃ¡b"];

function AgendaTab({ eventos, setEventos }) {
  const {C}=useTheme(); const s=makeStyles(C);
  const CORES=[C.accent,C.green,C.navyMid,C.purple,C.red,C.gold];
  const hoje=new Date();
  const [mes,setMes]=useState(hoje.getMonth());
  const [ano,setAno]=useState(hoje.getFullYear());
  const [diaSel,setDiaSel]=useState(hoje.getDate());
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({titulo:"",hora:"",instituicao:"",cor:""});

  const primeiroDia=new Date(ano,mes,1).getDay();
  const diasNoMes=new Date(ano,mes+1,0).getDate();
  const celulas=Array.from({length:primeiroDia+diasNoMes},(_,i)=>i<primeiroDia?null:i-primeiroDia+1);
  while(celulas.length%7!==0)celulas.push(null);
  const chave=d=>`${ano}-${String(mes+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const evsDia=d=>eventos.filter(e=>e.data===chave(d));
  const evsSel=diaSel?evsDia(diaSel):[];
  const isHoje=d=>d===hoje.getDate()&&mes===hoje.getMonth()&&ano===hoje.getFullYear();
  const navMes=dir=>{ let nm=mes+dir,na=ano; if(nm<0){nm=11;na--;} if(nm>11){nm=0;na++;} setMes(nm);setAno(na);setDiaSel(null); };
  const addEv=()=>{ if(!form.titulo.trim()||!diaSel)return; setEventos(prev=>[...prev,{...form,cor:form.cor||CORES[0],data:chave(diaSel),id:uid("ev")}]); setForm({titulo:"",hora:"",instituicao:"",cor:""}); setShowForm(false); };
  const delEv=id=>setEventos(prev=>prev.filter(e=>e.id!==id));

  return (
    <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
      {/* Grade */}
      <div style={{...s.card,overflow:"hidden",flex:1,minWidth:320}}>
        <div style={{background:C.navy,padding:"14px 22px",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <PatternBg/>
          <button onClick={()=>navMes(-1)} style={{position:"relative",zIndex:1,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",borderRadius:7,width:32,height:32,cursor:"pointer",fontSize:16}}>â¹</button>
          <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
            <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{MESES[mes]}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.55)"}}>{ano}</div>
          </div>
          <button onClick={()=>navMes(1)} style={{position:"relative",zIndex:1,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",borderRadius:7,width:32,height:32,cursor:"pointer",fontSize:16}}>âº</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:`1px solid ${C.border}`}}>
          {DIAS_SEMANA.map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:C.textLight,padding:"9px 0",background:C.cardAlt}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {celulas.map((d,i)=>{
            if(!d)return <div key={`x${i}`} style={{minHeight:72,borderRight:`1px solid ${C.borderSoft}`,borderBottom:`1px solid ${C.borderSoft}`,background:C.cardAlt}}/>;
            const evs=evsDia(d),sel=diaSel===d,hj=isHoje(d),col=i%7;
            return (
              <div key={d} onClick={()=>{setDiaSel(d);setShowForm(false);}}
                style={{minHeight:72,padding:"5px 6px",cursor:"pointer",borderRight:col<6?`1px solid ${C.borderSoft}`:"none",borderBottom:`1px solid ${C.borderSoft}`,background:sel?C.accentSoft:C.card}}>
                <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:hj||sel?800:500,
     0            background:hj?C.navy:sel?C.accent:"transparent",color:hj||sel?"#fff":C.text,marginBottom:3}}>{d}</div>
                {evs.slice(0,2).map((ev,ei)=>(
                  <div key={ei} style={{fontSize:9,fontWeight:600,color:"#fff",background:ev.cor||C.accent,borderRadius:4,padding:"1px 5px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {ev.hora?`${ev.hora} `:""}{ev.titulo}
                  </div>
                ))}
                {evs.length>2&&<div style={{fontSize:9,color:C.textLight}}>+{evs.length-2}</div>}
              </div>
            );
          })}
        </div>
      </div>
      {/* Painel lateral */}
      <div style={{...s.card,width:280,flexShrink:0,overflow:"hidden"}}>
        <div style={{background:diaSel?C.navy:C.cardAlt,padding:"13px 18px",borderBottom:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
          {diaSel&&<PatternBg/>}
          <div style={{position:"relative",zIndex:1}}>
            {diaSel
              ? <><div style={{fontSize:10,color:C.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Dia selecionado</div>
                  <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{String(diaSel).padStart(2,"0")} <span style={{fontSize:13,fontWeight:500}}>{MESES[mes].slice(0,3)} {ano}</span></div></>
              : <div style={{fontSize:13,color:C.textLight,textAlign:"center"}}>Clique em um dia</div>}
          </div>
        </div>
    0   {diaSel&&(
          <div style={{padding:"14px 16px"}}>
            {!showForm&&<button onClick={()=>setShowForm(true)} style={{...s.btnP,width:"100%",marginBottom:12}}>+ Adicionar evento</button>}
            {showForm&&(
              <div style={{background:C.cardAlt,borderRadius:8,padding:12,marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{marginBottom:8}}><label style={s.lbl}>TÃ­tulo *</label><input value={form.titulo} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} style={{...s.inp,fontSize:12}} autoFocus/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div><label style={s.lbl}>Hora</label><input type="time" value={form.hora} onChange={e=>setForm(p=>({...p,hora:e.target.value}))} style={{...s.inp,fontSize:12}}/></div>
                  <div><label style={s.lbl}>Cor</label><div style={{display:"flex",gap:4,paddingTop:5,flexWrap:"wrap"}}>{CORES.map(cor=><div key={cor} onClick={()=>setForm(p=>({...p,cor}))} style={{width:18,height:18,borderRadius:"50%",background:cor,cursor:"pointer",border:(form.cor||CORES[0])===cor?`2px solid ${C.text}`:"2px solid transparent"}}/>)}</div></div>
                </div>
                <div style={{marginBottom:10}}><label style={s.lbl}>InstituiÃ§Ã£o</label><input value={form.instituicao} onChange={e=>setForm(p=>({...p,instituicao:e.target.value}))} style={{...s.inp,fontSize:12}}/></div>
                <div style={{display:"flex",gap:6}}><button onClick={addEv} style={{...s.btnP,fontSize:11,flex:1}}>Salvar</button><button onClick={()=>setShowForm(false)} style={{...s.btnS,fontSize:11}}>Cancelar</button></div>
              </div>
            )}
            {evsSel.length===0&&!showForm&&<div style={{textAlign:"center",color:C.textLight,fontSize:12,padding:"20px 0"}}>Nenhum evento neste dia.</div>}
            {evsSel.slice().sort((a,b)=>(a.hora||"").localeCompare(b.hora||"")).map(ev=>(
              <div key={ev.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 11px",borderRadius:8,marginBottom:8,border:`1px solid ${C.border}`,background:C.card}}>
                <div style={{width:4,borderRadius:4,background:ev.cor||C.accent,alignSelf:"stretch",minHeight:36}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{ev.titulo}</div>
                  <div style={{display:"flex",gap:8,fontSize:11,color:C.textLight,marginTop:2}}>{ev.hora&&<span>ð {ev.hora}</span>}{ev.instituicao&&<span>ðï¸ {ev.instituicao}</span>}</div>
           0    </div>
                <button onClick={()=>delEv(ev.id)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:15,color:C.textLight}}>Ã</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  MODO APRESENTAÃÃO                                                         â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
function Apresentacao({ pipeline, metas, onClose, dark }) {
  const C=dark?DARK:LIGHT;
  const totalDel=metas.delegados.reduce((a,d)=>a+d.delegados,0);
  const cn=metas.cenarioAtivo||"A"; const sc=metas.subcenario||"conservador";
  const cenario=CENARIOS[cn][sc];
  const fmtUSD=v=>`US$ ${Number(v).toLocaleString("pt-BR")}`;
  const Big=({label,value,color,icon})=>(
    <div style={{background:C.card,borderRadius:16,padding:"26px 28px",border:`1px solid ${C.border}`,flex:"1 1 200px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{icon} {label}</div>
      <div style={{fontSize:36,fontWeight:800,color:color||C.text,lineHeight:1}}>{value}</div>
    </div>
  );
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:C.bg,overflow:"auto",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      <div style={{background:C.headerBg,position:"relative",overflow:"hidden",padding:"26px 40px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <PatternBg/>
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:16}}>
          <svg width={42} height={42} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" stroke={C.accent} strokeWidth="1.5"/>
            {Array.from({length:24},(_,i)=>i*15).map((a,i)=>{const r=a*Math.PI/180;return<line key={i} x1={12+4*Math.cos(r)} y1={12+4*Math.sin(r)} x2={12+10*Math.cos(r)} y2={12+10*Math.sin(r)} stroke={C.accent} strokeWidth=".8"/>;  })}
          </svg>
          <div>
            <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>CCIB Â· Centro-Oeste</div>
            <div style={{fontSize:24,color:"#fff",fontWeight:800}}>IBCC Pipeline 2026 â Centro Oeste</div>
          </div>
        </div>
        <button onClick={onClose} style={{position:"relative",zIndex:1,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",borderRadius:10,padding:"10px 18px",cursor:"pointer",fontSize:14,fontWeight:700}}>â Sair</button>
      </div>
      <div style={{padding:"36px 40px",maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",gap:18}}>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <Big label="Leads ativos"         value={pipeline.length}   color={C.navy}   icon="ð"/>
          <Big label="Alta prioridade"      value={pipeline.filter(l=>l.prioridade==="Alta").length} color={C.red} icon="ð´"/>
          <Big label="Delegados Â· meta"     value={totalDel}           color={C.blue}   icon="âï¸"/>
          <Big label="Meta de conversÃ£o"    value={cenario.total}      color={C.accent} icon="ð¯"/>
        </div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <Big label="CenÃ¡rio ativo"       value={`${cn} Â· ${sc}`}                color={C.purple} icon="ð"/>
          <Big label="Receita projetada"   value={fmtUSD(cenario.receita)}        color={C.green}  icon="ð°"/>
          <Big label="Ticket institucional" value="US$ 2.100/ano"                 color={C.blue}   icon="ðï¸"/>
          <Big label="Ticket TAJ"          value="US$ 4.400 (1Âº sem.)"           color={C.gold}   icon="â­"/>
        </div>
        {/* Funil */}
        <div style={{background:C.card,borderRadius:16,padding:"24px 28px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:16}}>Funil de captaÃ§Ã£o</div>
          {FUNNEL_KEYS.map(k=>{
            const n=pipeline.filter(l=>l.tipo==="Institucional"&&l.etapa===k).length;
            const max=Math.max(1,...FUNNEL_KEYS.map(k2=>pipeline.filter(l=>l.tipo==="Institucional"&&l.etapa===k2).length));
            const col=funnelColor(C,k);
            return (
              <div key={k} style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
                <div style={{width:160,flexShrink:0,fontSize:13,color:C.textMid}}>{k}</div>
                <div style={{flex:1,height:24,background:C.borderSoft,borderRadius:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.round((n/max)*100)}%`,background:col,borderRadius:6}}/>
                </div>
                <div style={{width:28,textAlign:"right",fontSize:16,fontWeight:800,color:C.text}}>{n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  MODAL: GERENCIAR RESPONSÃVEIS                                            â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
function GerenciarResponsaveis({ responsaveis, setResponsaveis, onClose }) {
  const {C}=useTheme(); const s=makeStyles(C);
  const [novo,setNovo]=useState("");
  const [editIdx,setEditIdx]=useState(null);
  const [editVal,setEditVal]=useState("");

  const add=()=>{ const v=novo.trim(); if(!v||responsaveis.includes(v))return; setResponsaveis(p=>[...p,v]); setNovo(""); };
  const remover=i=>setResponsaveis(p=>p.filter((_,idx)=>idx!==i));
  const iniciarEdit=(i)=>{ setEditIdx(i); setEditVal(responsaveis[i]); };
  const salvarEdit=()=>{ const v=editVal.trim(); if(!v)return; setResponsaveis(p=>p.map((x,i)=>i===editIdx?v:x)); setEditIdx(null); };

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{...s.card,width:"100%",maxWidth:420,padding:"24px",position:"relative"}}>
        <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:4}}>ð¥ ResponsÃ¡veis</div>
        <div style={{fontSize:12,color:C.textLight,marginBottom:18}}>Edite a lista de pessoas disponÃ­veis nos selects do painel.</div>

        {/* Lista */}
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {responsaveis.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:C.cardAlt,border:`1px solid ${C.border}`}}>
              {editIdx===i
                ? <>
                    <input value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&salvarEdit()}
                      autoFocus style={{...s.inp,flex:1,padding:"4px 8px",fontSize:13}}/>
                    <button onClick={salvarEdit} style={{...s.btnP,padding:"4px 10px",fontSize:11}}>OK</button>
                    <button onClick={()=>setEditIdx(null)} style={{...s.btnS,padding:"4px 10px",fontSize:11}}>Ã</button>
   0              </>
                : <>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:C.text}}>{r}</span>
                    <button onClick={()=>iniciarEdit(i)} title="Editar" style={{background:"transparent",border:"none",cursor:"pointer",fontSize:14,color:C.textLight,padding:"0 4px"}}>âï¸</button>
                    <button onClick={()=>remover(i)} title="Remover" style={{background:"transparent",border:"none",cursor:"pointer",fontSize:14,color:C.red,padding:"0 4px"}}>Ã</button>
                  </>}
            </div>
          ))}
          {responsaveis.length===0&&<div style={{textAlign:"center",color:C.textLight,fontSize:12,padding:"12px 0"}}>Nenhum responsÃ¡vel cadastrado.</div>}
        </div>

 0      {/* Adicionar */}
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <input placeholder="Nome do responsÃ¡vel..." value={novo} onChange={e=>setNovo(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()} style={{...s.inp,flex:1}}/>
          <button onClick={add} style={s.btnP}>+ Adicionar</button>
        </div>

        <button onClick={onClose} style={{...s.btnS,width:"100%"}}>Fechar</button>
      </div>
    </div>
  );
}

// â­âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ®
// â  APP PRINCIPAL                                                             â
// â°âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¯
const CSS=`
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.gform{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.tabbar{display:flex;gap:4px;flex-wrap:wrap;}
@media(max-width:1060px){.g4{grid-template-columns:repeat(2,1fr);}}
@media(max-width:680px){.g4{grid-template-columns:1fr;}.g3{grid-template-columns:1fr;}.g2{grid-template-columns:1fr;}.gform{grid-template-columns:1fr;}}
`;

const TABS=[
  {key:"exec",     label:"VisÃ£o Executiva"},
  {key:"pipeline", label:"Pipeline"},
  {key:"metas",    label:"Metas para MissÃ£o"},
  {key:"arquivo",  label:"Arquivo / MOUs"},
  {key:"tarefas",  label:"Tarefas"},
  {key:"agenda",   label:"Agenda"},
];

export default function IBCCApp() {
  const [dark,setDark]=useState(false);
  const [tab,setTab]=useState("exec");
  const [present,setPresent]=useState(false);
  const [loaded,setLoaded]=useState(false);

  const [pipeline,setPipeline]=useState(SEED_PIPELINE);
  const [arquivo,setArquivo]=useState(SEED_ARQUIVO);
  const [metas,setMetas]=useState(SEED_METAS);
  const [tarefas,setTarefas]=useState(SEED_TAREFAS);
  const [eventos,setEventos]=useState([]);
  const [responsaveis,setResponsaveis]=useState(SEED_RESP);
  const [showResp,setShowResp]=useState(false);
  const C=dark?DARK:LIGHT;
  const s=makeStyles(C);

  useEffect(()=>{(async()=>{
    const [p,ar,m,t,e,th,rs]=await Promise.all([
      loadData("ibcc2_pipeline",null),loadData("ibcc2_arquivo",null),loadData("ibcc2_metas",null),
  0   loadData("ibcc2_tarefas",null),loadData("ibcc2_eventos",null),loadData("ibcc2_tema",null),
      loadData("ibcc2_resp",null),
    ]);
    if(p)setPipeline(p);if(ar)setArquivo(ar);if(m)setMetas(m);
    if(t)setTarefas(t);if(e)setEventos(e);if(th==="dark")setDark(true);
    if(rs&&rs.length)setResponsaveis(rs);
    setLoaded(true);
  })();},[]);

  useEffect(()=>{if(!loaded)return;const id=setTimeout(()=>saveData("ibcc2_pipeline",pipeline),600);return()=>clearTimeout(id);},[pipeline,loaded]);
  useEffect(()=>{if(!loaded)return;const id=setTimeout(()=>saveData("ibcc2_arquivo",arquivo),600);return()=>clearTimeout(id);},[arquivo,loaded]);
  useEffect(()=>{if(!loaded)return;const id=setTimeout(()=>saveData("ibcc2_metas",metas),600);return()=>clearTimeout(id);},[metas,loaded]);
  useEffect(()=>{if(!loaded)return;const id=setTimeout(()=>saveData("ibcc2_tarefas",tarefas),600);return()=>clearTimeout(id);},[tarefas,loaded]);
  useEffect(()=>{if(!loaded)return;const id=setTimeout(()=>saveData("ibcc2_eventos",eventos),600);return()=>clearTimeout(id);},[eventos,loaded]);
  useEffect(()=>{if(!loaded)return;const id=setTimeout(()=>saveData("ibcc2_resp",responsaveis),600);return()=>clearTimeout(id);},[responsaveis,loaded]);
  useEffect(()=>{if(!loaded)return;saveData("ibcc2_tema",dark?"dark":"light");},[dark,loaded]);

  const arquivar=useCallback(lead=>{
    const r=window.confirm(`Marcar "${lead.empresa}" como GATHO?\nOK = Ganho Â· Cancelar = Perdido`)?"Ganho":"Perdido";
    setArquivo(prev=>[...prev,{id:uid("arq"),empresa:lead.empresa,natureza:lead.natureza,tipo:lead.tipo,resultado:r,
      motivo:r==="Ganho"?"Fechado com sucesso":"Encerrado sem conversÃ£o",dataEncerramento:new Date().toISOString().split("T")[0],
      responsavel:lead.responsavel||"â",linkDoc:""}]);
    setPipeline(prev=>prev.filter(p=>p.id!==lead.id));
  },[]);

  const restaurar=useCallback(a=>{
    setPipeline(prev=>[...prev,{id:uid("l"),empresa:a.empresa,natureza:a.natureza||"InstituiÃ§Ã£o",tipo:a.tipo||"Institucional",
      etapa:"Nova Empresa",responsavel:a.responsavel||"Isa",prioridade:"Monitorar",proximaAcao:"Retomado do arquivo",
      dataInicio:new Date().toISOString().split("T")[0]}]);
    setArquivo(prev=>prev.filter(x=>x.id!==a.id));
  },[]);

  const renderTab=()=>{
    switch(tab){
      case"exec":     return <VisaoExecutiva pipeline={pipeline} metas={metas} onGoPipeline={()=>setTab("pipeline")}/>;
      case"pipeline": return <PipelineTab pipeline={pipeline} setPipeline={setPipeline} onArquivar={arquivar} responsaveis={responsaveis}/>;
      case"metas":    return <MetasMissao metas={metas} setMetas={setMetas}/>;
      case"arquivo":  return <ArquivoTab arquivo={arquivo} setArquivo={setArquivo} onRestaurar={restaurar} responsaveis={responsaveis}/>;
      case"tarefas":  return <TarefasTab tarefas={tarefas} setTarefas={setTarefas} responsaveis={responsaveis}/>;
      case"agenda":   return <AgendaTab eventos={eventos} setEventos={setEventos}/>;
      default: return null;
    }
  };

  return (
    <ThemeCtx.Provider value={{C,dark,toggle:()=>setDark(d=>!d)}}>
      <style>{CSS}</style>
      <div style={{fontFamily:"'Inter','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,transition:"background .2s"}}>
        {/* HEADER */}
        <div style={{background:C.headerBg,position:"relative",overflow:"hidden",padding:"16px 24px 0"}}>
          <PatternBg/>
          <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:13}}>
              <Chakra size={28} color={C.accent}/>
              <div>
                <div style={{fontSize:10,color:C.accent,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>CÃ¢mara de ComÃ©rcio Ãndia-Brasil</div>
                <div style={{fontSize:17,color:"#fff",fontWeight:800,lineHeight:1.2}}>IBCC Pipeline 2026 â Centro Oeste</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:1}}>CaptaÃ§Ã£o Â· MissÃ£o TÃ©cnica Ãndia 2027 Â· Mato Grosso</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setShowResp(true)} style={{background:"rgba(255,255,255,.12)",border:"none",color:"#fff",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                ð¥ Equipe
              </button>
   0          <button onClick={()=>setDark(d=>!d)} style={{background:"rgba(255,255,255,.12)",border:"none",color:"#fff",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                {dark?"âï¸ Claro":"ð Escuro"}
              </button>
              <button onClick={()=>setPresent(true)} style={{background:C.accent,border:"none",color:"#fff",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:700}}>
                ð ApresentaÃ§Ã£o
              </button>
            </div>
          </div>
          <div className="tabbar" style={{position:"relative",zIndex:1,marginTop:14,overflowX:"auto",paddingBottom:0}}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                padding:"9px 15px",border:"none",cursor:"pointer",fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",
                borderRadius:"8px 8px 0 0",
                background:tab===t.key?C.bg:"rgba(255,255,255,.08)",
                color:tab===t.key?C.text:"rgba(255,255,255,.7)",
                transition:"all .15s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        {/* CORPO */}
        <div style={{padding:"20px 24px 48px",maxWidth:1280,margin:"0 auto"}}>
          {renderTab()}
        </div>
      </div>
      {present&&<Apresentacao pipeline={pipeline} metas={metas} onClose={()=>setPresent(false)} dark={dark}/>}
      {showResp&&<GerenciarResponsaveis responsaveis={responsaveis} setResponsaveis={setResponsaveis} onClose={()=>setShowResp(false)}/>}
    </ThemeCtx.Provider>
  );
}
