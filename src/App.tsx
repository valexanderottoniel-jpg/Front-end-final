import { useEffect, useMemo, useState } from 'react';
import { Package, Search, Users, Download, Printer, RefreshCw, Wrench, AlertCircle } from 'lucide-react';

type Page = 'buscar' | 'categorias' | 'facturas';
type Row = Record<string, unknown>;
const reports: Record<Page, { title: string; subtitle: string; endpoint: string; columns: { key: string; title: string; kind?: 'money' | 'date' }[] }> = {
  buscar: { title: 'Buscar artículos', subtitle: 'Consulta productos activos por nombre', endpoint: '/articulos/mostrarActivosFiltro', columns: [ { key: 'nombre', title: 'Artículo' }, { key: 'marca', title: 'Marca' }, { key: 'precio', title: 'Precio', kind: 'money' }, { key: 'stock', title: 'Existencias' } ] },
  categorias: { title: 'Artículos por categoría', subtitle: 'Listado de productos organizados por categoría', endpoint: '/articulos/reporteArticuloCategoria', columns: [ { key: 'nombre', title: 'Artículo' }, { key: 'marca', title: 'Marca' }, { key: 'categoria', title: 'Categoría' }, { key: 'precio', title: 'Precio', kind: 'money' }, { key: 'stock', title: 'Stock' } ] },
  facturas: { title: 'Facturas por cliente', subtitle: 'Historial de facturación registrado', endpoint: '/clientes/reporteClienteFactura', columns: [ { key: 'cliente', title: 'Cliente' }, { key: 'nit', title: 'NIT' }, { key: 'fecha', title: 'Fecha', kind: 'date' }, { key: 'total', title: 'Total', kind: 'money' } ] }
};
const menu: { id: Page; name: string; icon: typeof Search }[] = [ { id: 'buscar', name: 'Buscar artículos', icon: Search }, { id: 'categorias', name: 'Por categoría', icon: Package }, { id: 'facturas', name: 'Facturas', icon: Users } ];
const money = (value: unknown) => `Q ${Number(value ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value: unknown) => { if (!value) return '—'; const str = String(value); const parts = str.slice(0, 10).split('-'); return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : str; };
const text = (value: unknown) => value == null ? '—' : String(value);
function normalize(row: Row): Row { return { ...row, cliente: [row.nombre, row.apellido].filter(Boolean).join(' ') || row.cliente, fecha: row.fecha ?? row.fechaFactura }; }
function exportCsv(rows: Row[], columns: typeof reports.buscar.columns, filename: string) {
  const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const lines = [columns.map(c => esc(c.title)).join(';'), ...rows.map(r => columns.map(c => esc(c.kind === 'money' ? money(r[c.key]) : c.kind === 'date' ? date(r[c.key]) : r[c.key])).join(';'))];
  const blob = new Blob(['\ufeff', lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click(); URL.revokeObjectURL(url);
}
export default function App() {
  const [page, setPage] = useState<Page>('buscar'); const [query, setQuery] = useState(''); const [filter, setFilter] = useState(''); const [rows, setRows] = useState<Row[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [reload, setReload] = useState(0);
  const report = reports[page];
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(''); setRows([]);
      try {
        const params = page === 'buscar' ? `?nombre=${encodeURIComponent(query)}` : '';
        const response = await fetch(`/api${reports[page].endpoint}${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`El servidor respondió ${response.status}`);
        const data: unknown = await response.json(); if (!Array.isArray(data)) throw new Error('La respuesta no es una lista de registros');
        setRows(data.map((r: Row) => normalize(r)));
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Error de conexión'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [page, query, reload]);
  const visible = useMemo(() => rows.filter(r => Object.values(r).some(v => String(v ?? '').toLocaleLowerCase().includes(filter.toLocaleLowerCase()))), [rows, filter]);
  function changePage(next: Page) { setPage(next); setQuery(''); setFilter(''); }
  return <div className="app">
    <header className="header"><div className="brand"><div className="brand-icon"><Wrench size={23}/></div><div><strong>FerreControl</strong><small>Panel de consultas</small></div></div><span className="header-tag">Sistema de ferretería</span></header>
    <div className="layout"><aside className="side"><p className="side-label">REPORTES</p><nav>{menu.map(item => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? 'nav active' : 'nav'} onClick={() => changePage(item.id)}><Icon size={18}/>{item.name}</button>; })}</nav><div className="side-bottom">Proyecto académico<br/>React + TypeScript</div></aside>
      <main className="main"><div className="intro"><div><p className="eyebrow">CONSULTAS / {report.title.toUpperCase()}</p><h1>{report.title}</h1><p>{report.subtitle}</p></div><button className="refresh" onClick={() => setReload(n => n + 1)}><RefreshCw size={16}/> Actualizar</button></div>
        <section className="summary"><div className="summary-icon"><Package size={22}/></div><div><span>Registros encontrados</span><strong>{loading ? '...' : visible.length}</strong></div><span className="summary-note">Datos del sistema</span></section>
        <section className="panel"><div className="panel-head"><div><h2>Listado de resultados</h2><p>Información obtenida desde el backend</p></div><div className="actions"><button className="outline" onClick={() => exportCsv(visible, report.columns, page)} disabled={loading || visible.length === 0}><Download size={16}/> Excel (CSV)</button><button className="primary" onClick={() => window.print()} disabled={loading || visible.length === 0}><Printer size={16}/> Imprimir / PDF</button></div></div>
          <div className="filters">{page === 'buscar' && <form className="search-form" onSubmit={e => { e.preventDefault(); setQuery((e.currentTarget.elements.namedItem('nombre') as HTMLInputElement).value.trim()); }}><input name="nombre" placeholder="Nombre del artículo (ej. martillo)" defaultValue={query}/><button type="submit"><Search size={16}/> Buscar</button></form>}<div className="filter"><Search size={17}/><input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar esta tabla..."/></div></div>
          {error ? <div className="notice"><AlertCircle size={20}/><div><strong>No se pudo cargar el reporte.</strong><p>{error}. Comprueba que el backend esté ejecutándose en localhost:8080.</p></div></div> : <div className="table-wrap"><table><thead><tr><th>#</th>{report.columns.map(c => <th key={c.key}>{c.title}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={report.columns.length + 1} className="empty">Cargando información...</td></tr> : visible.length === 0 ? <tr><td colSpan={report.columns.length + 1} className="empty">No hay registros para mostrar.</td></tr> : visible.map((r, i) => <tr key={i}><td className="index">{i + 1}</td>{report.columns.map(c => <td key={c.key}>{c.kind === 'money' ? money(r[c.key]) : c.kind === 'date' ? date(r[c.key]) : text(r[c.key])}</td>)}</tr>)}</tbody></table></div>}
          <div className="panel-footer">Mostrando {visible.length} de {rows.length} registros</div>
        </section><footer>FerreControl · Sistema de reportes</footer>
      </main></div></div>;
}
