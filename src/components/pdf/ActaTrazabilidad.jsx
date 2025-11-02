import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf, Font } from '@react-pdf/renderer';
import img from '../image/image';

// Evita cortes raros de palabras
Font.registerHyphenationCallback(word => [word]);

const BANNER_DEFAULT = (img && img.cintillo) ? img.cintillo : '/assets/cintillo.png';
const LOGO_SICIC = (img && (img.sicic5 || img.logo)) ? (img.sicic5 || img.logo) : '/assets/logo-sisic.png';

const s = StyleSheet.create({
  // Reserva espacio para firma y footer
  page: { paddingTop: 90, paddingBottom: 130, paddingHorizontal: 48, fontFamily: 'Helvetica', fontSize: 11 },
  band: { position: 'absolute', top: 18, left: 12, right: 12, height: 50 },
  bandImg: { width: '100%', height: '100%' },

  h1: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase' },
  h2: { fontSize: 12.5, fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
  p: { lineHeight: 1.25, textAlign: 'justify', marginBottom: 6 },
  bold: { fontWeight: 'bold' },

  chipWrap: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { border: '1pt solid #90ce6f', borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, marginRight: 6, marginBottom: 4, fontSize: 10 },

  table: { display: 'flex', border: '1pt solid #DADADA', borderRadius: 4, marginTop: 6 },
  tr: { display: 'flex', flexDirection: 'row' },
  th: { flex: 1, backgroundColor: '#F6F6F6', padding: 6, fontSize: 10, fontWeight: 'bold', borderRight: '1pt solid #EAEAEA' },
  td: { flex: 1, padding: 6, fontSize: 10, lineHeight: 1.15, borderTop: '1pt solid #EAEAEA', borderRight: '1pt solid #F2F2F2' },
  tdSmall: { fontSize: 9 },
  tdCode: { fontSize: 7.5 },

  muted: { color: '#666', fontSize: 10 },

  // Nota técnica (exclusiva del reporte), justo encima de la firma
  noteTitle: { fontSize: 11.5, fontWeight: 'bold', marginTop: 10, marginBottom: 6, textAlign: 'center' },
  noteText: { fontSize: 10.5, lineHeight: 1.25, color: '#222', textAlign: 'justify' },
  noteBox: { marginTop: 8, padding: 10, border: '1pt solid #E6E6E6', borderRadius: 4, backgroundColor: '#FAFAFA' },
  noteKVWrap: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginBottom: 6 },
  noteKVItem: { flexGrow: 1, flexBasis: '50%', paddingRight: 8, marginBottom: 4 },
  noteKVLabel: { fontSize: 9.5, fontWeight: 'bold', color: '#555' },
  noteKVValue: { fontSize: 10.5, color: '#111' },

  // Firma fija: siempre al final, solo en la última página
  signatureFixed: { position: 'absolute', left: 48, right: 48, bottom: 60, textAlign: 'center' },
  signatureText: { fontSize: 10, color: '#333' },

  // Footer centrado
  footerRow: { position: 'absolute', left: 48, right: 48, bottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerLogo: { width: 20, height: 20, marginRight: 8 },
  footerText: { fontSize: 9, color: '#444' }
});

const fmtFecha = (f) => {
  if (!f) return '—';
  try {
    const d = new Date(f);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch { return String(f); }
};

const fmtFechaHora = (f = new Date().toISOString()) => {
  try {
    const d = new Date(f);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  } catch { return String(f); }
};

// Cortes suaves en textos largos
const breakable = (v) => {
  if (!v) return '';
  return String(v)
    .replace(/-/g, '\u200B-\u200B')
    .replace(/\./g, '\u200B.\u200B')
    .replace(/_/g, '\u200B_\u200B');
};

const timeSince = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr); const now = new Date();
  let s = Math.floor((now.getTime() - d.getTime())/1000);
  const y = Math.floor(s/31536000); if (y>=1) return `${y} año${y>1?'s':''}`;
  const m = Math.floor(s/2592000);  if (m>=1) return `${m} mes${m>1?'es':''}`;
  const w = Math.floor(s/604800);   if (w>=1) return `${w} semana${w>1?'s':''}`;
  const dd= Math.floor(s/86400);    if (dd>=1) return `${dd} día${dd>1?'s':''}`;
  const hh= Math.floor(s/3600);     if (hh>=1) return `${hh} hora${hh>1?'s':''}`;
  const mi= Math.floor(s/60);       if (mi>=1) return `${mi} minuto${mi>1?'s':''}`;
  return `${s} segundo${s!==1?'s':''}`;
};

// Pagina la tabla para repetir encabezado
const chunk = (arr, size = 18) => {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const ActaTrazabilidadDoc = ({
  propiedad = {},
  productores = [],
  cultivos = [],
  inspecciones = [],
  seleccion = null,
  inspectores = [],
  programas = [],
  plagas = [],
  medidas = '',
  observaciones = '',
  // Párrafo exclusivo opcional
  notaReporte,
  fechaEmision = new Date().toISOString().slice(0,10),
  coordinador = 'ING. GUSTAVO MUJICA',
  coordinadorCedula = 'V-9.601.781'
}) => {
  const totalIns = Array.isArray(inspecciones) ? inspecciones.length : 0;
  const ordenadas = [...(inspecciones || [])].sort((a,b)=>new Date(a.fecha_inspeccion)-new Date(b.fecha_inspeccion));
  const primera = ordenadas[0]?.fecha_inspeccion || null;
  const ultima   = ordenadas[ordenadas.length-1]?.fecha_inspeccion || null;

  const grupos = chunk(inspecciones, 18);

  // Cifras para la nota técnica (profesional)
  const totalProg = Array.isArray(programas) ? programas.length : 0;
  const totalPlagas = Array.isArray(plagas) ? plagas.length : 0;
  const periodoTxt = (primera && ultima) ? `${fmtFecha(primera)} — ${fmtFecha(ultima)}` : (ultima ? `hasta ${fmtFecha(ultima)}` : '—');

  const progNames = (Array.isArray(programas) ? programas : [])
    .map(p => p.programa_nombre || p.nombre || String(p || '')).filter(Boolean);
  const plagaNames = (Array.isArray(plagas) ? plagas : [])
    .map(x => x.nombre || String(x || '')).filter(Boolean);

  const progLine = progNames.length
    ? `Programas aplicados (muestra): ${progNames.slice(0, 3).join(', ')}${progNames.length > 3 ? ' …' : ''}.` : '';
  const plagaLine = plagaNames.length
    ? `Principales registros fitosanitarios (muestra): ${plagaNames.slice(0, 3).join(', ')}${plagaNames.length > 3 ? ' …' : ''}.` : '';

  const notaDefault =
    `Con base en los registros oficiales del SICIC‑INSAI, este informe consolida la trazabilidad de actuaciones para la propiedad ${propiedad?.propiedad_nombre || '—'}. ` +
    `Periodo evaluado: ${periodoTxt}. Se registran ${totalIns} inspección(es), con última actuación el ${ultima ? fmtFecha(ultima) : '—'}. ` +
    `Se identifican ${totalProg} programa(s) fitosanitario(s) asociado(s) y ${totalPlagas} registro(s) de plagas/enfermedades. ` +
    `La información permite valorar el cumplimiento de medidas y la efectividad de las acciones de control, conforme a la Ley de Salud Agrícola Integral y normativa interna vigente. ` +
    `Fuentes: actos administrativos y registros cargados por personal autorizado. Alcance: documento técnico‑informativo para soporte de decisiones de gestión sanitaria.`;

  const notaFinal = (typeof notaReporte === 'string' && notaReporte.trim()) ? notaReporte : notaDefault;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.band} fixed><Image src={BANNER_DEFAULT} style={s.bandImg} /></View>

        <Text style={s.h1}>Acta de Trazabilidad de Inspección</Text>

        <Text style={s.h2}>Identificación de la Propiedad</Text>
        <Text style={s.p}>
          Propiedad: <Text style={s.bold}>{propiedad?.propiedad_nombre || '—'}</Text> · RIF:{' '}
          <Text style={s.bold}>{propiedad?.propiedad_rif || '—'}</Text>
        </Text>
        <Text style={s.p}>Ubicación: {propiedad?.propiedad_ubicacion || '—'}</Text>

        <Text style={s.h2}>Productores Asociados</Text>
        <View style={s.chipWrap}>
          {(productores || []).length > 0
            ? productores.map((p,i)=>(
                <Text key={i} style={s.chip}>
                  {(p.nombre || '—') + ' ' + (p.apellido || '')} · C.I: {p.cedula || '—'}
                </Text>
              ))
            : <Text style={s.muted}>—</Text>
          }
        </View>

        <Text style={s.h2}>Cultivos</Text>
        <View style={s.chipWrap}>
          {(cultivos || []).length > 0
            ? cultivos.map((c,i)=>(<Text key={i} style={s.chip}>{c.nombre}</Text>))
            : <Text style={s.muted}>—</Text>
          }
        </View>

        <Text style={s.h2}>Resumen de Trazabilidad</Text>
        <Text style={s.p}>
          Total de inspecciones: <Text style={s.bold}>{totalIns}</Text>
          {primera ? ` · En seguimiento desde hace ${timeSince(primera)}` : ''}
          {ultima ? ` · Última: ${fmtFecha(ultima)}` : ''}
        </Text>

        {/* Línea de tiempo con encabezado repetido */}
        {grupos.length === 0 ? (
          <View style={s.table}><View style={s.tr}><Text style={[s.td,{flex:1}]}>—</Text></View></View>
        ) : grupos.map((group, gi) => (
          <View key={`grp-${gi}`} style={s.table} wrap>
            <View style={s.tr}>
              <Text style={[s.th, {flex:1.0}]}>Fecha</Text>
              <Text style={[s.th, {flex:0.9}]}>Estado</Text>
              <Text style={[s.th, {flex:1.9}]}>Código</Text>
              <Text style={[s.th, {flex:1.6}]}>N° Control</Text>
            </View>
            {group.map((ins, i)=>(
              <View key={`r-${gi}-${i}`} style={s.tr}>
                <Text style={[s.td, s.tdSmall, {flex:1.0}]}>{fmtFecha(ins.fecha_inspeccion)}</Text>
                <Text style={[s.td, s.tdSmall, {flex:0.9}]}>{ins.estado || '—'}</Text>
                <Text style={[s.td, s.tdCode, {flex:1.9}]}>{breakable(ins.codigo_inspeccion) || '—'}</Text>
                <Text style={[s.td, s.tdCode, {flex:1.6}]}>{breakable(ins.n_control) || '—'}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Detalle de la Inspección Seleccionada */}
        {seleccion && (
          <>
            <Text style={s.h2}>Detalle de la Inspección Seleccionada</Text>
            <Text style={s.p}>
              Código: <Text style={s.bold}>{seleccion.codigo_inspeccion || '—'}</Text> ·{' '}
              N° Control: <Text style={s.bold}>{seleccion.n_control || '—'}</Text> ·{' '}
              Fecha: <Text style={s.bold}>{fmtFecha(seleccion.fecha_inspeccion)}</Text> ·{' '}
              Estado: <Text style={s.bold}>{seleccion.estado || '—'}</Text>
            </Text>

            {Array.isArray(inspectores) && inspectores.length > 0 && (
              <>
                <Text style={s.h2}>Inspectores</Text>
                <View style={s.chipWrap}>
                  {inspectores.map((t, i)=>(
                    <Text key={i} style={s.chip}>
                      {(t.nombre || '—') + ' ' + (t.apellido || '')} · C.I: {t.cedula || '—'}
                    </Text>
                  ))}
                </View>
              </>
            )}

            {Array.isArray(programas) && programas.length > 0 && (
              <>
                <Text style={s.h2}>Programas Asignados</Text>
                <View style={s.chipWrap}>
                  {programas.map((p, i)=>(
                    <Text key={i} style={s.chip}>
                      {p.programa_nombre || `Programa #${p.programa_fito_id || ''}`}
                      {p.tipo_programa ? ` · ${p.tipo_programa}` : ''}
                    </Text>
                  ))}
                </View>
              </>
            )}

            {Array.isArray(plagas) && plagas.length > 0 && (
              <>
                <Text style={s.h2}>Plagas / Enfermedades</Text>
                <View style={s.chipWrap}>
                  {plagas.map((x, i)=>(
                    <Text key={i} style={s.chip}>
                      {x.nombre || x} {x.nombre_cientifico ? `(${x.nombre_cientifico})` : ''}
                    </Text>
                  ))}
                </View>
              </>
            )}

            {!!medidas && (
              <>
                <Text style={s.h2}>Medidas / Recomendaciones</Text>
                <Text style={s.p}>{medidas}</Text>
              </>
            )}
            {!!observaciones && (
              <>
                <Text style={s.h2}>Observaciones</Text>
                <Text style={s.p}>{observaciones}</Text>
              </>
            )}
          </>
        )}

        {/* Nota técnica exclusiva, por encima de la firma */}
        <View style={s.noteBox}>
          <Text style={s.noteTitle}>Informe técnico de trazabilidad</Text>

          <View style={s.noteKVWrap}>
            <View style={s.noteKVItem}>
              <Text style={s.noteKVLabel}>Propiedad</Text>
              <Text style={s.noteKVValue}>{propiedad?.propiedad_nombre || '—'}</Text>
            </View>
            <View style={s.noteKVItem}>
              <Text style={s.noteKVLabel}>RIF</Text>
              <Text style={s.noteKVValue}>{propiedad?.propiedad_rif || '—'}</Text>
            </View>
            <View style={s.noteKVItem}>
              <Text style={s.noteKVLabel}>Periodo</Text>
              <Text style={s.noteKVValue}>{periodoTxt}</Text>
            </View>
            <View style={s.noteKVItem}>
              <Text style={s.noteKVLabel}>Inspecciones</Text>
              <Text style={s.noteKVValue}>{totalIns}</Text>
            </View>
            <View style={s.noteKVItem}>
              <Text style={s.noteKVLabel}>Programas asociados</Text>
              <Text style={s.noteKVValue}>{totalProg}</Text>
            </View>
            <View style={s.noteKVItem}>
              <Text style={s.noteKVLabel}>Registros de plagas</Text>
              <Text style={s.noteKVValue}>{totalPlagas}</Text>
            </View>
          </View>

          <Text style={s.noteText}>{notaFinal}</Text>
          {progLine ? <Text style={s.noteText}>{progLine}</Text> : null}
          {plagaLine ? <Text style={s.noteText}>{plagaLine}</Text> : null}
          <Text style={[s.noteText, { fontStyle: 'italic', color: '#333', marginTop: 4 }]}>
            Uso previsto: soporte a la toma de decisiones y seguimiento técnico‑administrativo. Cualquier interpretación debe considerar el contexto operativo de cada inspección y los límites de la evidencia disponible.
          </Text>
        </View>

        {/* Firma fija: SIEMPRE al final y solo en la última página */}
        <View style={s.signatureFixed} fixed>
          <Text
            style={s.signatureText}
            render={({ pageNumber, totalPages }) =>
              pageNumber !== totalPages
                ? ''
                : `______________________________
            ${coordinador}
            Coordinador INSAI - Yaracuy
            C.I: ${coordinadorCedula}
            Emitido: ${fmtFecha(fechaEmision)} · Documento generado por SICIC-INSAI`
                        }
          />
        </View>

        {/* Footer centrado */}
        <View style={s.footerRow} fixed>
          {LOGO_SICIC ? <Image src={LOGO_SICIC} style={s.footerLogo} /> : null}
          <Text style={s.footerText}>SICIC-INSAI • {fmtFechaHora(new Date().toISOString())} • </Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

export async function buildActaTrazabilidadBlob(props) {
  const instance = pdf(<ActaTrazabilidadDoc {...props} />);
  return await instance.toBlob();
}

export default ActaTrazabilidadDoc;