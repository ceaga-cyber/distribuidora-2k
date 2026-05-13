
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CORES = ["#34d399", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa", "#38bdf8", "#fbbf24", "#4ade80", "#f87171", "#e879f9"];
const ADMIN_SENHA = "2k2025";

function gerarSKU(nome, categoria, id) {
  const nomeSlug = (nome || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 12);
  const catSlug = (categoria || "GEN")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
  const num = String(id).padStart(3, "0");
  return `2K-${catSlug}-${nomeSlug}-${num}`;
}

// Gera EAN-13 automático baseado no ID da peça
// Prefixo 789 (Brasil) + 2K (50) + ID com dígito verificador
function gerarCodigoBarras(id) {
  const base = `789205${String(id).padStart(6, "0")}`;
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const dv = (10 - (soma % 10)) % 10;
  return base + dv;
}

function Badge({ children, color }) {
  const colors = {
    green: "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50",
    red: "bg-red-900/40 text-red-300 border border-red-700/50",
    yellow: "bg-yellow-900/40 text-yellow-300 border border-yellow-700/50",
    blue: "bg-blue-900/40 text-blue-300 border border-blue-700/50",
    purple: "bg-purple-900/40 text-purple-300 border border-purple-700/50",
    gray: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color] || colors.gray}`}>{children}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FieldInput({ label, hint, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-zinc-400 text-sm font-medium">{label}</label>}
      {hint && <p className="text-zinc-600 text-xs -mt-0.5">{hint}</p>}
      <input className={`bg-zinc-800 border ${error ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-600`} {...props} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Estado vazio ──
function Vazio({ icone, titulo, sub, acao, onAcao }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl mb-4">{icone}</div>
      <p className="text-zinc-300 font-medium mb-1">{titulo}</p>
      <p className="text-zinc-600 text-sm mb-5">{sub}</p>
      {acao && <button onClick={onAcao} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">{acao}</button>}
    </div>
  );
}

// ── Admin Login ──
function AdminLogin({ onSuccess }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [show, setShow] = useState(false);
  function tentar() {
    if (senha === ADMIN_SENHA) { setErro(false); onSuccess(); }
    else { setErro(true); setSenha(""); }
  }
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl mb-3">🔐</div>
          <h2 className="text-white font-semibold text-lg">Área Administrativa</h2>
          <p className="text-zinc-500 text-sm mt-1">Acesso restrito · Distribuidora 2K</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input type={show ? "text" : "password"} value={senha}
              onChange={e => { setSenha(e.target.value); setErro(false); }}
              onKeyDown={e => e.key === "Enter" && tentar()}
              placeholder="Senha de acesso..."
              className={`w-full bg-zinc-800 border ${erro ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 pr-16 text-sm focus:outline-none focus:border-purple-500 transition-colors`} />
            <button onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs">{show ? "ocultar" : "ver"}</button>
          </div>
          {erro && <p className="text-red-400 text-xs">Senha incorreta.</p>}
          <button onClick={tentar} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors w-full">Entrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel ──
function PainelAdmin({ pecas, movs, setPecas, setMovs, onLogout }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const valorCusto = pecas.reduce((s, p) => s + p.quantidade * p.custo, 0);
  const valorVenda = pecas.reduce((s, p) => s + p.quantidade * p.preco, 0);
  const pecasCriticas = pecas.filter(p => p.quantidade > 0 && p.quantidade <= p.minimo);
  const pecasSemEstoque = pecas.filter(p => p.quantidade === 0);
  const topPecas = [...pecas].sort((a, b) => (b.quantidade * b.preco) - (a.quantidade * a.preco)).slice(0, 5);

  function exportarBackup() {
    const dados = {
      versao: "1.0",
      exportadoEm: new Date().toISOString(),
      pecas, movs, modelos, categorias, marcas, nextId, nextMovId,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribuidora2k_backup_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const dados = JSON.parse(ev.target.result);
        if (!dados.pecas) { alert("Arquivo inválido."); return; }
        if (!confirm("Isso vai substituir todos os dados atuais. Continuar?")) return;
        setPecas(dados.pecas || []);
        setMovs(dados.movs || []);
        setModelos(dados.modelos || []);
        setCategorias(dados.categorias || []);
        setMarcas(dados.marcas || []);
        setNextId(dados.nextId || 1);
        setNextMovId(dados.nextMovId || 1);
        alert("Backup restaurado com sucesso!");
      } catch { alert("Erro ao ler o arquivo."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Administração</h1>
          <Badge color="purple">Restrito</Badge>
        </div>
        <button onClick={onLogout} className="text-xs text-zinc-500 hover:text-red-400 border border-zinc-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors">Sair do Admin</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Custo total em estoque", value: `R$ ${valorCusto.toLocaleString("pt-BR")}`, color: "text-yellow-400" },
          { label: "Valor de venda", value: `R$ ${valorVenda.toLocaleString("pt-BR")}`, color: "text-emerald-400" },
          { label: "Margem potencial", value: `R$ ${(valorVenda - valorCusto).toLocaleString("pt-BR")}`, color: "text-purple-400" },
          { label: "Movimentações", value: movs.length, color: "text-blue-400" },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs mb-2">{k.label}</p>
            <p className={`text-xl font-semibold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Saúde do Estoque</h3>
          {pecas.length === 0
            ? <p className="text-zinc-600 text-sm">Nenhuma peça cadastrada.</p>
            : [
              { label: "Total SKUs", val: pecas.length, c: "text-white" },
              { label: "Normal", val: pecas.length - pecasCriticas.length - pecasSemEstoque.length, c: "text-emerald-400" },
              { label: "Crítico", val: pecasCriticas.length, c: "text-yellow-400" },
              { label: "Sem estoque", val: pecasSemEstoque.length, c: "text-red-400" },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
                <span className="text-zinc-400 text-sm">{r.label}</span>
                <span className={`font-semibold text-sm ${r.c}`}>{r.val}</span>
              </div>
            ))}
        </div>
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Top 5 por Valor em Estoque</h3>
          {topPecas.length === 0
            ? <p className="text-zinc-600 text-sm">Nenhuma peça cadastrada ainda.</p>
            : <table className="w-full">
              <thead><tr className="text-xs text-zinc-500 border-b border-zinc-800">
                <th className="text-left pb-2">Peça</th><th className="text-left pb-2">SKU</th>
                <th className="text-right pb-2">Qtd</th><th className="text-right pb-2">Valor venda</th><th className="text-right pb-2">Margem</th>
              </tr></thead>
              <tbody>{topPecas.map(p => (
                <tr key={p.id} className="border-b border-zinc-800/40 last:border-0">
                  <td className="py-2 text-sm text-white">{p.nome}</td>
                  <td className="py-2 text-xs font-mono text-emerald-500/70">{p.sku}</td>
                  <td className="py-2 text-sm text-right text-zinc-300">{p.quantidade}</td>
                  <td className="py-2 text-sm text-right text-emerald-400">R$ {(p.quantidade * p.preco).toLocaleString("pt-BR")}</td>
                  <td className="py-2 text-sm text-right text-purple-400">R$ {p.preco - p.custo}</td>
                </tr>
              ))}</tbody>
            </table>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Backup & Restore */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-1">💾 Backup & Restauração</h3>
          <p className="text-zinc-600 text-xs mb-4">Exporte seus dados em JSON ou restaure um backup anterior</p>
          <div className="flex flex-col gap-2">
            <button onClick={exportarBackup}
              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-700/40 font-medium text-sm px-4 py-2 rounded-xl transition-colors w-full text-left">
              ↓ Exportar backup (JSON)
            </button>
            <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium text-sm px-4 py-2 rounded-xl transition-colors w-full text-left cursor-pointer">
              ↑ Restaurar backup
              <input type="file" accept=".json" onChange={importarBackup} className="hidden" />
            </label>
          </div>
          <p className="text-zinc-700 text-xs mt-3">Os dados são salvos automaticamente no navegador (localStorage). O backup garante segurança extra.</p>
        </div>

        {/* Zona de perigo */}
        <div className="bg-zinc-900 border border-red-900/40 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-red-400 mb-1">⚠ Zona de Perigo</h3>
          <p className="text-zinc-600 text-xs mb-4">Ações irreversíveis — use com cuidado</p>
          {!confirmReset
            ? <button onClick={() => setConfirmReset(true)} className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 text-sm px-4 py-2 rounded-xl w-full">Apagar todos os dados</button>
            : <div className="flex flex-col gap-2">
              <p className="text-red-300 text-sm font-medium">Isso apaga tudo do sistema e do navegador. Tem certeza?</p>
              <div className="flex gap-2">
                <button onClick={() => {
                  setPecas([]); setMovs([]); setModelos([]); setCategorias([]); setMarcas([]);
                  setNextId(1); setNextMovId(1);
                  setConfirmReset(false);
                }}
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold text-sm px-4 py-2 rounded-xl flex-1">Sim, apagar tudo</button>
                <button onClick={() => setConfirmReset(false)} className="bg-zinc-800 text-zinc-300 text-sm px-4 py-2 rounded-xl">Cancelar</button>
              </div>
            </div>}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs">Distribuidora 2K · iPartsControl v1.0 · {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Barcode Visual Renderer ──
function BarcodeVisual({ code }) {
  // Simple visual barcode using SVG bars derived from the code string
  const bars = [];
  const totalBars = 80;
  // Generate pseudo-bar pattern from char codes (visual only, not scannable)
  for (let i = 0; i < totalBars; i++) {
    const charCode = code.charCodeAt(i % code.length) || 0;
    const bit = (charCode >> (i % 8)) & 1;
    const extra = (charCode + i) % 3;
    bars.push({ wide: bit === 1 || extra === 0, space: (charCode + i * 3) % 5 === 0 });
  }
  const barWidth = 2;
  const spaceWidth = 1;
  let x = 0;
  const elements = [];
  bars.forEach((b, i) => {
    const w = b.wide ? barWidth * 2 : barWidth;
    elements.push(<rect key={`b${i}`} x={x} y={0} width={w} height={50} fill="#000" />);
    x += w;
    const sw = b.space ? spaceWidth * 2 : spaceWidth;
    x += sw;
  });
  return (
    <svg width={x} height={50} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {elements}
    </svg>
  );
}

// ── Cadastro de Peças ──
function CadastroPeca({ pecas, setPecas, nextId, setNextId, modelos, categorias, marcas, irParaEstoque }) {
  const formVazio = { nome: "", sku: "", modelo: "", categoria: "", marca: "", codigoBarras: "", quantidade: "", minimo: "", custo: "", preco: "", fornecedor: "" };
  const [form, setForm] = useState(formVazio);
  const [editando, setEditando] = useState(null);
  const [sucesso, setSucesso] = useState("");
  const [erros, setErros] = useState({});

  function handleNome(nome) {
    setForm(f => ({
      ...f,
      nome,
      sku: editando ? f.sku : gerarSKU(nome, f.categoria, nextId),
      codigoBarras: editando ? f.codigoBarras : gerarCodigoBarras(nextId),
    }));
    if (erros.nome) setErros(e => ({ ...e, nome: "" }));
  }

  function handleCategoria(categoria) {
    setForm(f => ({
      ...f,
      categoria,
      sku: editando ? f.sku : gerarSKU(f.nome, categoria, nextId),
    }));
  }

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = "Nome obrigatório";
    if (!form.modelo) e.modelo = "Modelo obrigatório";
    if (!form.categoria) e.categoria = "Categoria obrigatória";
    if (form.quantidade === "" || isNaN(Number(form.quantidade)) || Number(form.quantidade) < 0) e.quantidade = "Quantidade inválida";
    if (form.minimo === "" || isNaN(Number(form.minimo)) || Number(form.minimo) < 0) e.minimo = "Mínimo inválido";
    if (form.custo === "" || isNaN(Number(form.custo)) || Number(form.custo) < 0) e.custo = "Custo inválido";
    if (form.preco === "" || isNaN(Number(form.preco)) || Number(form.preco) < 0) e.preco = "Preço inválido";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function salvar() {
    if (!validar()) return;
    const sku = form.sku || gerarSKU(form.nome, form.categoria, editando ? editando.id : nextId);
    const codigoBarras = form.codigoBarras || gerarCodigoBarras(editando ? editando.id : nextId);
    if (editando) {
      setPecas(prev => prev.map(p => p.id === editando.id ? { ...p, ...form, sku, codigoBarras, quantidade: Number(form.quantidade), minimo: Number(form.minimo), custo: Number(form.custo), preco: Number(form.preco) } : p));
      setSucesso(`Peça "${form.nome}" atualizada!`);
      setEditando(null);
    } else {
      setPecas(prev => [...prev, { ...form, id: nextId, sku, codigoBarras, quantidade: Number(form.quantidade), minimo: Number(form.minimo), custo: Number(form.custo), preco: Number(form.preco) }]);
      setNextId(n => n + 1);
      setSucesso(`Peça "${form.nome}" cadastrada! SKU: ${sku}`);
    }
    setForm(formVazio);
    setTimeout(() => setSucesso(""), 4000);
  }

  function iniciarEdicao(p) {
    setEditando(p);
    setForm({ nome: p.nome, sku: p.sku, modelo: p.modelo, categoria: p.categoria, marca: p.marca || "", codigoBarras: p.codigoBarras || "", quantidade: p.quantidade, minimo: p.minimo, custo: p.custo, preco: p.preco, fornecedor: p.fornecedor || "" });
    setErros({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function excluir(id) {
    if (confirm("Excluir esta peça?")) setPecas(prev => prev.filter(p => p.id !== id));
  }

  const margem = Number(form.preco) - Number(form.custo);
  const margemPct = Number(form.custo) > 0 ? ((margem / Number(form.custo)) * 100).toFixed(1) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{editando ? "Editar Peça" : "Cadastro de Peças"}</h1>
          <p className="text-zinc-500 text-sm">{editando ? `Editando: ${editando.nome}` : "Preencha os dados para cadastrar uma nova peça"}</p>
        </div>
        {editando && <button onClick={() => { setEditando(null); setForm(formVazio); setErros({}); }}
          className="text-sm text-zinc-400 hover:text-white border border-zinc-700 px-4 py-2 rounded-xl transition-colors">✕ Cancelar edição</button>}
      </div>

      {sucesso && (
        <div className="mb-5 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <p className="text-emerald-300 text-sm">{sucesso}</p>
        </div>
      )}

      {modelos.length === 0 || categorias.length === 0 ? (
        <div className="mb-5 bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-4 py-3">
          <p className="text-yellow-300 text-sm">⚠ Cadastre pelo menos um <strong>modelo</strong> e uma <strong>categoria</strong> na aba "Modelos & Categorias" antes de adicionar peças.</p>
        </div>
      ) : null}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-5">Dados da Peça</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400 text-sm font-medium">Nome da peça *</label>
            <input value={form.nome} onChange={e => handleNome(e.target.value)} placeholder="Ex: Tela OLED Premium"
              className={`bg-zinc-800 border ${erros.nome ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-600`} />
            {erros.nome && <p className="text-red-400 text-xs">{erros.nome}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400 text-sm font-medium">SKU gerado automaticamente</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 flex items-center gap-2 min-w-0">
                <span className="text-zinc-600 text-xs font-mono shrink-0">#</span>
                <span className={`text-sm font-mono truncate ${form.sku ? "text-emerald-400" : "text-zinc-600"}`}>
                  {form.sku || "aguardando nome..."}
                </span>
              </div>
              {form.sku && <button onClick={() => navigator.clipboard?.writeText(form.sku)}
                className="shrink-0 text-zinc-500 hover:text-white text-xs px-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-colors">copiar</button>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400 text-sm font-medium">Modelo *</label>
            <select value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
              className={`bg-zinc-800 border ${erros.modelo ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors`}>
              <option value="">Selecione o modelo...</option>
              {modelos.map(m => <option key={m}>{m}</option>)}
            </select>
            {erros.modelo && <p className="text-red-400 text-xs">{erros.modelo}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400 text-sm font-medium">Categoria *</label>
            <select value={form.categoria} onChange={e => handleCategoria(e.target.value)}
              className={`bg-zinc-800 border ${erros.categoria ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors`}>
              <option value="">Selecione a categoria...</option>
              {categorias.map(c => <option key={c}>{c}</option>)}
            </select>
            {erros.categoria && <p className="text-red-400 text-xs">{erros.categoria}</p>}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400 text-sm font-medium">Marca</label>
            <select value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
              className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors">
              <option value="">Selecione a marca...</option>
              {marcas.map(m => <option key={m}>{m}</option>)}
            </select>
            {marcas.length === 0 && <p className="text-zinc-600 text-xs mt-1">Nenhuma marca cadastrada. Adicione em "Modelos & Categorias".</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: "Qtd. inicial *", key: "quantidade", error: erros.quantidade, placeholder: "0" },
            { label: "Estoque mínimo *", key: "minimo", error: erros.minimo, placeholder: "0" },
            { label: "Custo (R$) *", key: "custo", error: erros.custo, placeholder: "0,00" },
            { label: "Preço de venda (R$) *", key: "preco", error: erros.preco, placeholder: "0,00" },
          ].map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-zinc-400 text-sm font-medium">{f.label}</label>
              <input type="number" min="0" step={f.key === "custo" || f.key === "preco" ? "0.01" : "1"}
                value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={`bg-zinc-800 border ${f.error ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors`} />
              {f.error && <p className="text-red-400 text-xs">{f.error}</p>}
            </div>
          ))}
        </div>

        {form.custo && form.preco && Number(form.preco) > 0 && (
          <div className="mb-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 flex gap-8">
            <div><p className="text-zinc-500 text-xs">Margem unit.</p><p className="text-emerald-400 font-semibold text-sm">R$ {margem.toFixed(2)}</p></div>
            {margemPct && <div><p className="text-zinc-500 text-xs">Margem %</p><p className="text-emerald-400 font-semibold text-sm">{margemPct}%</p></div>}
            <div><p className="text-zinc-500 text-xs">Valor estoque inicial</p><p className="text-yellow-400 font-semibold text-sm">R$ {(Number(form.quantidade || 0) * Number(form.custo)).toFixed(2)}</p></div>
          </div>
        )}

        <div className="mb-5">
          <FieldInput label="Fornecedor" value={form.fornecedor} onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))} placeholder="Nome do fornecedor" />
        </div>

        {/* Código de Barras */}
        <div className="mb-5">
          <label className="text-zinc-400 text-sm font-medium block mb-1">Código de Barras</label>
          <p className="text-zinc-600 text-xs mb-2">Gerado automaticamente no formato EAN-13. Você pode substituir pelo código real do produto.</p>
          <div className="flex gap-2">
            <input
              value={form.codigoBarras}
              onChange={e => setForm(f => ({ ...f, codigoBarras: e.target.value.replace(/\s/g, "") }))}
              placeholder="Gerado ao digitar o nome..."
              maxLength={48}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-600 tracking-widest"
            />
            {form.codigoBarras && !editando && (
              <button onClick={() => setForm(f => ({ ...f, codigoBarras: gerarCodigoBarras(nextId) }))}
                title="Regenerar código"
                className="text-zinc-500 hover:text-emerald-400 text-xs px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-colors">
                ↺
              </button>
            )}
          </div>
          {form.codigoBarras && (
            <div className="mt-3 bg-white rounded-xl px-6 py-4 flex flex-col items-center gap-1">
              <BarcodeVisual code={form.codigoBarras} />
              <span className="text-black text-xs font-mono tracking-[0.25em] mt-1">{form.codigoBarras}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={salvar} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
            {editando ? "Salvar alterações" : "Cadastrar peça"}
          </button>
          {!editando && <button onClick={() => { setForm(formVazio); setErros({}); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 py-2.5 rounded-xl transition-colors">Limpar</button>}
          <button onClick={irParaEstoque} className="ml-auto text-zinc-500 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-colors">Ver estoque →</button>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Peças cadastradas ({pecas.length})</h2>
        {pecas.length === 0
          ? <div className="bg-zinc-900 border border-zinc-800 rounded-2xl"><Vazio icone="📦" titulo="Nenhuma peça cadastrada" sub="Preencha o formulário acima para adicionar a primeira peça." /></div>
          : <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Peça</th><th className="text-left px-4 py-3">SKU</th>
                  <th className="text-left px-4 py-3">Marca</th><th className="text-left px-4 py-3">Modelo</th><th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-right px-4 py-3">Qtd</th><th className="text-right px-4 py-3">Custo</th>
                  <th className="text-right px-4 py-3">Venda</th><th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pecas.map(p => (
                  <tr key={p.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${editando?.id === p.id ? "bg-emerald-950/20" : ""}`}>
                    <td className="px-5 py-3"><p className="text-sm font-medium text-white">{p.nome}</p><p className="text-xs text-zinc-500">{p.fornecedor || "—"}</p></td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-emerald-500/80 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded-md block w-fit">{p.sku}</span>
                      {p.codigoBarras && <span className="text-xs font-mono text-zinc-500 mt-0.5 block tracking-wider">▌{p.codigoBarras}</span>}
                    </td>
                    <td className="px-4 py-3"><Badge color="blue">{p.categoria}</Badge></td>
                    <td className="px-4 py-3 text-right"><span className={`text-sm font-semibold ${p.quantidade <= p.minimo ? "text-red-400" : "text-white"}`}>{p.quantidade}</span></td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-400">R$ {p.custo}</td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-400">R$ {p.preco}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => iniciarEdicao(p)} className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-zinc-700 transition-colors">Editar</button>
                        <button onClick={() => excluir(p.id)} className="text-zinc-500 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-zinc-700 transition-colors">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </div>
    </div>
  );
}

// ── Modelos & Categorias ──
function GerenciarModelos({ modelos, setModelos, categorias, setCategorias, marcas, setMarcas, pecas }) {
  const [novoModelo, setNovoModelo] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaMarca, setNovaMarca] = useState("");
  const [erroModelo, setErroModelo] = useState("");
  const [erroCategoria, setErroCategoria] = useState("");
  const [erroMarca, setErroMarca] = useState("");

  function adicionarModelo() {
    const v = novoModelo.trim();
    if (!v) { setErroModelo("Digite um nome."); return; }
    if (modelos.includes(v)) { setErroModelo("Já existe."); return; }
    setModelos(prev => [...prev, v]);
    setNovoModelo(""); setErroModelo("");
  }

  function removerModelo(m) {
    if (pecas.some(p => p.modelo === m)) { alert(`O modelo "${m}" está em uso por peças cadastradas.`); return; }
    if (confirm(`Remover modelo "${m}"?`)) setModelos(prev => prev.filter(x => x !== m));
  }

  function adicionarCategoria() {
    const v = novaCategoria.trim();
    if (!v) { setErroCategoria("Digite um nome."); return; }
    if (categorias.includes(v)) { setErroCategoria("Já existe."); return; }
    setCategorias(prev => [...prev, v]);
    setNovaCategoria(""); setErroCategoria("");
  }

  function removerCategoria(c) {
    if (pecas.some(p => p.categoria === c)) { alert(`A categoria "${c}" está em uso por peças cadastradas.`); return; }
    if (confirm(`Remover categoria "${c}"?`)) setCategorias(prev => prev.filter(x => x !== c));
  }

  function adicionarMarca() {
    const v = novaMarca.trim();
    if (!v) { setErroMarca("Digite um nome."); return; }
    if (marcas.includes(v)) { setErroMarca("Já existe."); return; }
    setMarcas(prev => [...prev, v]);
    setNovaMarca(""); setErroMarca("");
  }

  function removerMarca(m) {
    if (pecas.some(p => p.marca === m)) { alert(`A marca "${m}" está em uso por peças cadastradas.`); return; }
    if (confirm(`Remover marca "${m}"?`)) setMarcas(prev => prev.filter(x => x !== m));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Modelos, Categorias & Marcas</h1>
      <p className="text-zinc-500 text-sm mb-6">Cadastre os modelos de iPhone, categorias e marcas antes de adicionar peças</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Modelos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">Modelos de iPhone</h2>
            <p className="text-zinc-600 text-xs">{modelos.length} modelo{modelos.length !== 1 ? "s" : ""} cadastrado{modelos.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input value={novoModelo} onChange={e => { setNovoModelo(e.target.value); setErroModelo(""); }}
                onKeyDown={e => e.key === "Enter" && adicionarModelo()}
                placeholder="Ex: iPhone 16 Pro"
                className={`w-full bg-zinc-800 border ${erroModelo ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-600`} />
              {erroModelo && <p className="text-red-400 text-xs mt-1">{erroModelo}</p>}
            </div>
            <button onClick={adicionarModelo} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-3 py-2 rounded-xl transition-colors shrink-0">+</button>
          </div>
          {modelos.length === 0
            ? <div className="py-8 text-center"><p className="text-zinc-600 text-sm">Nenhum modelo</p></div>
            : <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {modelos.map(m => {
                const qtd = pecas.filter(p => p.modelo === m).length;
                return (
                  <div key={m} className="flex items-center justify-between bg-zinc-800/60 hover:bg-zinc-800 rounded-xl px-3 py-2.5 group transition-colors">
                    <div><span className="text-sm text-white">{m}</span>{qtd > 0 && <span className="text-xs text-zinc-500 ml-2">· {qtd} peça{qtd > 1 ? "s" : ""}</span>}</div>
                    <button onClick={() => removerModelo(m)} className="text-zinc-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all px-2 py-0.5 rounded hover:bg-zinc-700">✕</button>
                  </div>
                );
              })}
            </div>}
        </div>

        {/* Categorias */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">Categorias de Peças</h2>
            <p className="text-zinc-600 text-xs">{categorias.length} categoria{categorias.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input value={novaCategoria} onChange={e => { setNovaCategoria(e.target.value); setErroCategoria(""); }}
                onKeyDown={e => e.key === "Enter" && adicionarCategoria()}
                placeholder="Ex: Tela, Bateria..."
                className={`w-full bg-zinc-800 border ${erroCategoria ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-600`} />
              {erroCategoria && <p className="text-red-400 text-xs mt-1">{erroCategoria}</p>}
            </div>
            <button onClick={adicionarCategoria} className="bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm px-3 py-2 rounded-xl transition-colors shrink-0">+</button>
          </div>
          {categorias.length === 0
            ? <div className="py-8 text-center"><p className="text-zinc-600 text-sm">Nenhuma categoria</p></div>
            : <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {categorias.map(c => {
                const qtd = pecas.filter(p => p.categoria === c).length;
                return (
                  <div key={c} className="flex items-center justify-between bg-zinc-800/60 hover:bg-zinc-800 rounded-xl px-3 py-2.5 group transition-colors">
                    <div className="flex items-center gap-2"><Badge color="blue">{c}</Badge>{qtd > 0 && <span className="text-xs text-zinc-500">{qtd} peça{qtd > 1 ? "s" : ""}</span>}</div>
                    <button onClick={() => removerCategoria(c)} className="text-zinc-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all px-2 py-0.5 rounded hover:bg-zinc-700">✕</button>
                  </div>
                );
              })}
            </div>}
        </div>

        {/* Marcas */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">Marcas</h2>
            <p className="text-zinc-600 text-xs">{marcas.length} marca{marcas.length !== 1 ? "s" : ""} cadastrada{marcas.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input value={novaMarca} onChange={e => { setNovaMarca(e.target.value); setErroMarca(""); }}
                onKeyDown={e => e.key === "Enter" && adicionarMarca()}
                placeholder="Ex: Apple Original, Foxconn..."
                className={`w-full bg-zinc-800 border ${erroMarca ? "border-red-500" : "border-zinc-700"} text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-zinc-600`} />
              {erroMarca && <p className="text-red-400 text-xs mt-1">{erroMarca}</p>}
            </div>
            <button onClick={adicionarMarca} className="bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-3 py-2 rounded-xl transition-colors shrink-0">+</button>
          </div>
          {marcas.length === 0
            ? <div className="py-8 text-center"><p className="text-zinc-600 text-sm">Nenhuma marca</p><p className="text-zinc-700 text-xs mt-1">Ex: Apple Original, Compatível, Foxconn</p></div>
            : <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {marcas.map(m => {
                const qtd = pecas.filter(p => p.marca === m).length;
                return (
                  <div key={m} className="flex items-center justify-between bg-zinc-800/60 hover:bg-zinc-800 rounded-xl px-3 py-2.5 group transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{m}</span>
                      {qtd > 0 && <span className="text-xs text-zinc-500">· {qtd} peça{qtd > 1 ? "s" : ""}</span>}
                    </div>
                    <button onClick={() => removerMarca(m)} className="text-zinc-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all px-2 py-0.5 rounded hover:bg-zinc-700">✕</button>
                  </div>
                );
              })}
            </div>}
        </div>
      </div>
    </div>
  );
}

// ── Hook de estado persistido no localStorage ──
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setPersisted(value) {
    setState(prev => {
      const next = typeof value === "function" ? value(prev) : value;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return [state, setPersisted];
}

// ── App Principal ──
export default function App() {
  const [aba, setAba] = useState("modelos");
  const [adminLogado, setAdminLogado] = useState(false);
  const [pecas, setPecas] = useLocalStorage("2k_pecas", []);
  const [movs, setMovs] = useLocalStorage("2k_movs", []);
  const [nextId, setNextId] = useLocalStorage("2k_nextId", 1);
  const [nextMovId, setNextMovId] = useLocalStorage("2k_nextMovId", 1);
  const [modelos, setModelos] = useLocalStorage("2k_modelos", []);
  const [categorias, setCategorias] = useLocalStorage("2k_categorias", []);
  const [marcas, setMarcas] = useLocalStorage("2k_marcas", []);
  const [filtroModelo, setFiltroModelo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [modalMov, setModalMov] = useState(false);
  const [formMov, setFormMov] = useState({});

  const pecasFiltradas = useMemo(() => pecas.filter(p =>
    (!filtroModelo || p.modelo === filtroModelo) &&
    (!filtroCategoria || p.categoria === filtroCategoria) &&
    (!filtroNome || p.nome.toLowerCase().includes(filtroNome.toLowerCase()) || (p.sku || "").toLowerCase().includes(filtroNome.toLowerCase()))
  ), [pecas, filtroModelo, filtroCategoria, filtroNome]);

  const alertas = pecas.filter(p => p.quantidade <= p.minimo);
  const totalItens = pecas.reduce((s, p) => s + p.quantidade, 0);
  const valorEstoque = pecas.reduce((s, p) => s + p.quantidade * p.custo, 0);
  const valorVenda = pecas.reduce((s, p) => s + p.quantidade * p.preco, 0);

  const estoquePorCategoria = useMemo(() => {
    const map = {};
    pecas.forEach(p => { map[p.categoria] = (map[p.categoria] || 0) + p.quantidade; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [pecas]);

  const estoquePorModelo = useMemo(() => {
    const map = {};
    pecas.forEach(p => { map[p.modelo] = (map[p.modelo] || 0) + p.quantidade; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [pecas]);

  const movsRecentes = [...movs].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5);

  function salvarMov() {
    if (!formMov.pecaId || !formMov.quantidade || !formMov.data) return;
    const qty = Number(formMov.quantidade);
    setMovs(prev => [...prev, { id: nextMovId, pecaId: Number(formMov.pecaId), tipo: formMov.tipo, quantidade: qty, data: formMov.data, obs: formMov.obs || "" }]);
    setNextMovId(n => n + 1);
    setPecas(prev => prev.map(p => p.id === Number(formMov.pecaId)
      ? { ...p, quantidade: formMov.tipo === "entrada" ? p.quantidade + qty : Math.max(0, p.quantidade - qty) } : p));
    setModalMov(false);
  }

  const abas = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "modelos", label: "Modelos & Categorias", icon: "⊞" },
    { id: "cadastro", label: "Cadastro de Peças", icon: "＋" },
    { id: "estoque", label: "Estoque", icon: "▦" },
    { id: "movimentacoes", label: "Movimentações", icon: "⇅" },
    { id: "admin", label: "Admin", icon: "🔐", restrito: true },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40">
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-xs">2K</div>
            <span className="font-semibold text-white text-sm">Distribuidora 2K</span>
          </div>
          <p className="text-zinc-500 text-xs ml-9">Peças para iPhone</p>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {abas.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all w-full text-left
                ${aba === a.id
                  ? a.restrito ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <span className="text-base leading-none">{a.icon}</span>
              {a.label}
              {a.restrito && adminLogado && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
            </button>
          ))}
        </nav>
        {alertas.length > 0 && (
          <div className="px-3 pb-2">
            <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-3">
              <p className="text-red-400 text-xs font-semibold mb-1">⚠ Estoque Crítico</p>
              {alertas.slice(0, 3).map(p => <p key={p.id} className="text-red-300 text-xs truncate">{p.nome}</p>)}
              {alertas.length > 3 && <p className="text-red-400 text-xs mt-1">+{alertas.length - 3} mais</p>}
            </div>
          </div>
        )}
        <div className="px-4 py-3 border-t border-zinc-800 mt-auto">
          <p className="text-zinc-600 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
            Dados salvos automaticamente
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 min-h-screen">
        <div className="px-8 py-6 max-w-6xl">

          {/* DASHBOARD */}
          {aba === "dashboard" && (
            <div>
              <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
              <p className="text-zinc-500 text-sm mb-6">Visão geral · Distribuidora 2K</p>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total de Peças", value: pecas.length, sub: "SKUs cadastrados", color: "text-blue-400" },
                  { label: "Unidades em Estoque", value: totalItens.toLocaleString(), sub: "itens disponíveis", color: "text-emerald-400" },
                  { label: "Valor de Custo", value: `R$ ${valorEstoque.toLocaleString("pt-BR")}`, sub: "capital investido", color: "text-yellow-400" },
                  { label: "Valor de Venda", value: `R$ ${valorVenda.toLocaleString("pt-BR")}`, sub: "potencial de receita", color: "text-purple-400" },
                ].map(k => (
                  <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <p className="text-zinc-500 text-xs mb-2">{k.label}</p>
                    <p className={`text-2xl font-semibold ${k.color}`}>{k.value}</p>
                    <p className="text-zinc-600 text-xs mt-1">{k.sub}</p>
                  </div>
                ))}
              </div>
              {pecas.length === 0
                ? <Vazio icone="📊" titulo="Sem dados ainda" sub="Cadastre modelos, categorias e peças para ver os gráficos." acao="Começar cadastro" onAcao={() => setAba("modelos")} />
                : <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                      <h3 className="text-sm font-medium text-zinc-300 mb-4">Estoque por Categoria</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={estoquePorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                            {estoquePorCategoria.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                          <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ color: "#a1a1aa", fontSize: 10 }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                      <h3 className="text-sm font-medium text-zinc-300 mb-4">Unidades por Modelo</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={estoquePorModelo} layout="vertical" margin={{ left: 8, right: 16 }}>
                          <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                          <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                          <Bar dataKey="value" fill="#34d399" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">⚠ Estoque Crítico</h3>
                      {alertas.length === 0 ? <p className="text-zinc-500 text-sm">Tudo em ordem!</p>
                        : alertas.map(p => (
                          <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                            <div><p className="text-sm text-white">{p.nome}</p><p className="text-xs text-zinc-500">{p.modelo}</p></div>
                            <div className="text-right"><Badge color="red">{p.quantidade} un</Badge><p className="text-xs text-zinc-600 mt-0.5">mín: {p.minimo}</p></div>
                          </div>
                        ))}
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">Últimas Movimentações</h3>
                      {movsRecentes.length === 0 ? <p className="text-zinc-500 text-sm">Nenhuma movimentação ainda.</p>
                        : movsRecentes.map(m => {
                          const peca = pecas.find(p => p.id === m.pecaId);
                          return (
                            <div key={m.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                              <div><p className="text-sm text-white">{peca?.nome || "—"}</p><p className="text-xs text-zinc-500">{m.data}</p></div>
                              <Badge color={m.tipo === "entrada" ? "green" : "red"}>{m.tipo === "entrada" ? "+" : "-"}{m.quantidade}</Badge>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>}
            </div>
          )}

          {/* MODELOS & CATEGORIAS */}
          {aba === "modelos" && (
            <GerenciarModelos modelos={modelos} setModelos={setModelos} categorias={categorias} setCategorias={setCategorias} marcas={marcas} setMarcas={setMarcas} pecas={pecas} />
          )}

          {/* CADASTRO */}
          {aba === "cadastro" && (
            <CadastroPeca pecas={pecas} setPecas={setPecas} nextId={nextId} setNextId={setNextId}
              modelos={modelos} categorias={categorias} marcas={marcas} irParaEstoque={() => setAba("estoque")} />
          )}

          {/* ESTOQUE */}
          {aba === "estoque" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-semibold mb-1">Estoque</h1><p className="text-zinc-500 text-sm">{pecasFiltradas.length} peças encontradas</p></div>
                <button onClick={() => setAba("cadastro")} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-colors">+ Cadastrar peça</button>
              </div>
              {pecas.length > 0 && (
                <div className="flex gap-3 mb-5">
                  <input value={filtroNome} onChange={e => setFiltroNome(e.target.value)} placeholder="Buscar por nome ou SKU..."
                    className="bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 flex-1 placeholder-zinc-600" />
                  <select value={filtroModelo} onChange={e => setFiltroModelo(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                    <option value="">Todos os modelos</option>
                    {modelos.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                    <option value="">Todas as categorias</option>
                    {categorias.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {pecas.length === 0
                ? <div className="bg-zinc-900 border border-zinc-800 rounded-2xl"><Vazio icone="📦" titulo="Estoque vazio" sub="Cadastre peças para vê-las aqui." acao="Ir para Cadastro" onAcao={() => setAba("cadastro")} /></div>
                : <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                        <th className="text-left px-5 py-3">Peça</th><th className="text-left px-4 py-3">SKU</th>
                        <th className="text-left px-4 py-3">Marca</th><th className="text-left px-4 py-3">Modelo</th><th className="text-left px-4 py-3">Categoria</th>
                        <th className="text-right px-4 py-3">Qtd</th><th className="text-right px-4 py-3">Custo</th>
                        <th className="text-right px-4 py-3">Venda</th><th className="text-left px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pecasFiltradas.map(p => (
                        <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-5 py-3"><p className="text-sm font-medium text-white">{p.nome}</p><p className="text-xs text-zinc-500">{p.fornecedor || "—"}</p></td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-emerald-500/80 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded-md block w-fit">{p.sku}</span>
                            {p.codigoBarras && <span className="text-xs font-mono text-zinc-500 mt-0.5 block tracking-wider">▌{p.codigoBarras}</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-300">{p.marca || <span className="text-zinc-600">—</span>}</td>
                          <td className="px-4 py-3 text-sm text-zinc-300">{p.modelo}</td>
                          <td className="px-4 py-3"><Badge color="blue">{p.categoria}</Badge></td>
                          <td className="px-4 py-3 text-right"><span className={`text-sm font-semibold ${p.quantidade <= p.minimo ? "text-red-400" : "text-white"}`}>{p.quantidade}</span></td>
                          <td className="px-4 py-3 text-right text-sm text-zinc-400">R$ {p.custo}</td>
                          <td className="px-4 py-3 text-right text-sm text-emerald-400 font-medium">R$ {p.preco}</td>
                          <td className="px-4 py-3"><Badge color={p.quantidade === 0 ? "red" : p.quantidade <= p.minimo ? "yellow" : "green"}>{p.quantidade === 0 ? "Sem estoque" : p.quantidade <= p.minimo ? "Crítico" : "Normal"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pecasFiltradas.length === 0 && <div className="py-10 text-center text-zinc-500 text-sm">Nenhuma peça encontrada com esses filtros.</div>}
                </div>}
            </div>
          )}

          {/* MOVIMENTAÇÕES */}
          {aba === "movimentacoes" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-semibold mb-1">Movimentações</h1><p className="text-zinc-500 text-sm">Entradas e saídas do estoque</p></div>
                {pecas.length > 0 && (
                  <div className="flex gap-2">
                    <button onClick={() => { setFormMov({ tipo: "entrada", data: new Date().toISOString().slice(0, 10) }); setModalMov(true); }}
                      className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-medium text-sm px-4 py-2 rounded-xl transition-colors">+ Entrada</button>
                    <button onClick={() => { setFormMov({ tipo: "saida", data: new Date().toISOString().slice(0, 10) }); setModalMov(true); }}
                      className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-medium text-sm px-4 py-2 rounded-xl transition-colors">− Saída</button>
                  </div>
                )}
              </div>
              {movs.length === 0
                ? <div className="bg-zinc-900 border border-zinc-800 rounded-2xl"><Vazio icone="⇅" titulo="Nenhuma movimentação" sub={pecas.length === 0 ? "Cadastre peças primeiro para registrar entradas e saídas." : "Use os botões acima para registrar entradas e saídas."} /></div>
                : <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                        <th className="text-left px-5 py-3">Data</th><th className="text-left px-4 py-3">Tipo</th>
                        <th className="text-left px-4 py-3">Peça</th><th className="text-left px-4 py-3">SKU</th>
                        <th className="text-left px-4 py-3">Modelo</th><th className="text-right px-4 py-3">Qtd</th>
                        <th className="text-left px-4 py-3">Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...movs].sort((a, b) => new Date(b.data) - new Date(a.data)).map(m => {
                        const peca = pecas.find(p => p.id === m.pecaId);
                        return (
                          <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                            <td className="px-5 py-3 text-sm text-zinc-400">{m.data}</td>
                            <td className="px-4 py-3"><Badge color={m.tipo === "entrada" ? "green" : "red"}>{m.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}</Badge></td>
                            <td className="px-4 py-3 text-sm text-white">{peca?.nome || "—"}</td>
                            <td className="px-4 py-3"><span className="text-xs font-mono text-emerald-500/70">{peca?.sku || "—"}</span></td>
                            <td className="px-4 py-3 text-sm text-zinc-400">{peca?.modelo || "—"}</td>
                            <td className="px-4 py-3 text-right"><span className={`text-sm font-semibold ${m.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>{m.tipo === "entrada" ? "+" : "-"}{m.quantidade}</span></td>
                            <td className="px-4 py-3 text-sm text-zinc-500">{m.obs || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>}
            </div>
          )}

          {/* ADMIN */}
          {aba === "admin" && (
            adminLogado
              ? <PainelAdmin pecas={pecas} movs={movs} setPecas={setPecas} setMovs={setMovs} onLogout={() => setAdminLogado(false)} />
              : <AdminLogin onSuccess={() => setAdminLogado(true)} />
          )}
        </div>
      </div>

      {/* Modal Movimentação */}
      {modalMov && (
        <Modal title={formMov.tipo === "entrada" ? "Registrar Entrada" : "Registrar Saída"} onClose={() => setModalMov(false)}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-zinc-400 text-sm font-medium">Peça *</label>
              <select value={formMov.pecaId || ""} onChange={e => setFormMov(f => ({ ...f, pecaId: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500">
                <option value="">Selecione a peça...</option>
                {pecas.map(p => <option key={p.id} value={p.id}>[{p.sku}] {p.nome} — {p.modelo} (estoque: {p.quantidade})</option>)}
              </select>
            </div>
            <FieldInput label="Quantidade *" type="number" min="1" value={formMov.quantidade || ""} onChange={e => setFormMov(f => ({ ...f, quantidade: e.target.value }))} />
            <FieldInput label="Data *" type="date" value={formMov.data || ""} onChange={e => setFormMov(f => ({ ...f, data: e.target.value }))} />
            <div className="col-span-2">
              <FieldInput label="Observação" value={formMov.obs || ""} onChange={e => setFormMov(f => ({ ...f, obs: e.target.value }))} placeholder="Ex: Venda cliente, Reposição..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalMov(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancelar</button>
            <button onClick={salvarMov}
              className={`font-semibold text-sm px-5 py-2 rounded-xl transition-colors ${formMov.tipo === "entrada" ? "bg-emerald-500 hover:bg-emerald-400 text-black" : "bg-red-500 hover:bg-red-400 text-white"}`}>
              Confirmar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
