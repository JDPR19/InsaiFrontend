import React from 'react';
import img from '../image/image';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';

// Helpers
const safe = (v) => (v == null ? '' : String(v));
const upper = (v) => safe(v).toUpperCase();
const ddmmyyyy = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return safe(iso);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
const hhmm = (t) => {
  if (!t) return '';
  // t puede venir "HH:mm:ss" o "HH:mm"
  const m = String(t).match(/^(\d{2}:\d{2})/);
  return m ? m[1] : safe(t);
};


const yes = 'X';

const styles = StyleSheet.create({
  page: { padding: 18, fontSize: 9, color: '#000' },
  table: { border: '1 solid #000', width: '100%' },
  row: { flexDirection: 'row' },
  cell: { borderRight: '1 solid #000', borderBottom: '1 solid #000', padding: 4, justifyContent: 'center' },
  cellNoRight: { borderBottom: '1 solid #000', padding: 4, justifyContent: 'center' },
  bold: { fontWeight: 700 },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
  headerLogos: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 6 ,justifyContent: 'center', width: '100%', },
  logoInsai: { width: 60, height: 30, objectFit: 'contain', alignSelf: 'center'},
  topSmall: { fontSize: 8 },
  sectionTitle: { fontSize: 9, fontWeight: 700 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkbox: { width: 9, height: 9, border: '1 solid #000', marginRight: 3, textAlign: 'center', fontSize: 7 },
  linedBox: { borderTop: '1 solid #000' },
  line: { height: 16, borderBottom: '1 solid #000', paddingHorizontal: 4, justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 10, left: 18, right: 18, fontSize: 8, textAlign: 'center' },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 4 },
  imageThumb: { width: 80, height: 60, objectFit: 'cover', border: '1 solid #000' },
  footerRow: { position: 'absolute', bottom: 10, left: 18, right: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerLogo: { width: 14, height: 14, objectFit: 'contain', marginRight: 6 },
});

// Mini “celda” con label fijo arriba
const Label = ({ text }) => <Text style={{ fontSize: 8, color: '#000' }}>{text}</Text>;

// Caja con líneas (para texto largo)
const LinedBox = ({ rows = 8, text = '' }) => {
  const lines = Array.from({ length: rows });
  // dividir texto en líneas simples (sin medir ancho exacto)
  const parts = (text || '').split(/\n/g);
  return (
    <View style={styles.linedBox}>
      {lines.map((_, i) => (
        <View key={i} style={styles.line}>
          <Text style={{ fontSize: 9 }}>{parts[i] || ''}</Text>
        </View>
      ))}
    </View>
  );
};

// Bloque superior compartido (logos + metadatos)
function HeaderGrid({ pagina, total, n_control = '', unidad = 'DIRECCIÓN GENERAL', codigoInspeccion = '' }) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, { borderBottomWidth: 0 }]}>
        <View style={[styles.cell, { width: '38%', borderBottomWidth: 1 }]}>
          <View style={styles.headerLogos}>
            <Image style={styles.logoInsai} src={img.logoInsai} />
          </View>
        </View>
        <View style={[styles.cell, { width: '22%', borderBottomWidth: 1 }]}>
          <Label text="UNIDAD:" />
          <Text style={{ marginTop: 2 }}>{upper(unidad)}</Text>
        </View>
        {/* Antes decía "CÓDIGO:" y mostraba codigoFormulario */}
        <View style={[styles.cellNoRight, { width: '40%', borderBottomWidth: 1 }]}>
          <Label text="CÓDIGO INSPECCIÓN:" />
          <Text style={{ marginTop: 2 }}>{codigoInspeccion || '—'}</Text>
        </View>
      </View>

      <View style={[styles.row]}>
        <View style={[styles.cellNoRight, { width: '100%' }]}>
          <Text style={[styles.center, styles.bold]}>ACTA DE INSPECCIÓN CON FINES DE VIGILANCIA</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.cell, { width: '60%' }]}>
          <Label text="N° DE CONTROL:" />
          <Text style={{ marginTop: 2 }}>{n_control || '—'}</Text>
        </View>
        <View style={[styles.cellNoRight, { width: '40%' }]}>
          <Label text="PÁGINA:" />
          <Text style={{ marginTop: 2 }}>{pagina} de {total}</Text>
        </View>
      </View>
    </View>
  );
}

// Página 1
function ActaPage1({
  inspeccion = {},
  propiedad = {},
  representantes = {}, 
  personaAtiende = {}, 
  finalidadesNombres = [],
  unidad = 'DIRECCIÓN GENERAL',
}) {
  const area = upper(inspeccion.area || 'VEGETAL');
  const isVegetal = area.includes('VEGETAL');

  // Checks de área
  const areaChecks = [
    { label: 'Salud Vegetal Integral', key: 'VEGETAL', match: area.includes('VEGETAL') },
    { label: 'Salud Animal Integral', key: 'ANIMAL', match: area.includes('ANIMAL') },
    { label: 'Agroecología y Participación Popular', key: 'AGROECO', match: area.includes('AGRO') || area.includes('ECO') },
    { label: 'Movilización', key: 'MOV', match: area.includes('MOV') },
    { label: 'Fiscalización Post - Registro', key: 'FISCAL', match: area.includes('FISC') },
  ];

  // Finalidades (marcar según texto)
  const finOpciones = [
    'Verificar el estado fitosanitario',
    'Verificar el estado zoosanitario',
    'Verificar el estado de los procesos agroecológicos',
    'Verificar el origen o destino para la movilización del rubro',
    'Verificar Buenas Prácticas de Manufactura en',
    'Otro',
  ];
  const finSeleccionadas = new Set((finalidadesNombres || []).map(upper));

  const marcar = (texto) => {
    const t = upper(texto);
    if (isVegetal && t.includes('FITOSANITARIO')) return true;
    for (const s of finSeleccionadas) {
      if (s.includes(t) || t.includes(s)) return true;
    }
    return false;
  };

  return (
    <Page size="A4" style={styles.page}>
      <HeaderGrid
        pagina={1}
        total={2}
        n_control={inspeccion.n_control}
        codigoInspeccion={inspeccion.codigo_inspeccion}
        unidad={unidad}
      />

      {/* Estado actual de la inspección */}
      <View style={[styles.table, { marginTop: 4 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.topSmall}>ESTADO DE LA INSPECCIÓN: {upper(inspeccion.estado || '—')}</Text>
          </View>
        </View>
      </View>

      {/* 1. Área */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>1. ÁREA A LA CUAL PERTENECE LA INSPECCIÓN (seleccione las opciones pertinentes)</Text>
            <View style={styles.chips}>
              {areaChecks.map((a, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.checkbox}>{a.match ? yes : ' '}</Text>
                  <Text>{a.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 2. Justificación legal */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>2. JUSTIFICACIÓN LEGAL</Text>
            <Text style={{ marginTop: 4 }}>
              Se realiza la presente inspección en virtud de las competencias conferidas en el artículo 72 y 73 de la Ley de Salud Agrícola Integral y en cumplimiento de las disposiciones previstas en los artículos 1, 2, 4, 13, 34, 35, 36, 50, 57 y 74 y además, para el resguardo y defensa de la Salud Agrícola Integral, la Soberanía y Seguridad Agroalimentaria y el Desarrollo Sustentable de la Nación.
            </Text>
          </View>
        </View>
      </View>

      {/* 3 y 4. Fecha y Hora */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cell, { width: '50%' }]}>
            <Text style={styles.sectionTitle}>3. DÍA Y FECHA DE LA INSPECCIÓN</Text>
            <Text style={{ marginTop: 2 }}>{ddmmyyyy(inspeccion.fecha_inspeccion)}</Text>
          </View>
          <View style={[styles.cellNoRight, { width: '50%' }]}>
            <Text style={styles.sectionTitle}>4. HORA DE LA INSPECCIÓN</Text>
            <Text style={{ marginTop: 2 }}>{hhmm(inspeccion.hora_inspeccion)}</Text>
          </View>
        </View>
      </View>

      {/* 5. Servidores actuantes (inspectores) */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>5. DATOS DEL (LOS) SERVIDOR(ES) PÚBLICO(S) ACTUANTE(S)</Text>
            <LinedBox rows={2} text={
              (inspeccion.inspectores || [])
                .map((p, idx) => `${idx + 1}) ${safe(p.nombre)} ${safe(p.apellido)} — CI: ${safe(p.cedula)}`)
                .join('\n')
            } />
          </View>
        </View>
      </View>

      {/* 6. Propietario / Representante Legal */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>6. DATOS DEL PROPIETARIO O REPRESENTANTE LEGAL</Text>
            <Text>Nombre y Apellido: {safe(representantes.propietarioNombre)}</Text>
            <Text>Cédula de identidad: {safe(representantes.propietarioCedula)}</Text>
            <Text>Códigos RUNSAI: {safe(representantes.runsai)}</Text>
          </View>
        </View>
      </View>

      {/* 7. Persona que atiende */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>7. DATOS DE LA PERSONA QUE ATIENDE</Text>
            <Text>Nombre y Apellido: {safe(personaAtiende.nombre || inspeccion.responsable_e)}</Text>
            <Text>Cédula de identidad: {safe(personaAtiende.cedula || inspeccion.cedula_res)}</Text>
            <Text>Correo: {safe(personaAtiende.correo || inspeccion.correo)}        Teléfono: {safe(personaAtiende.telefono || inspeccion.tlf)}</Text>
          </View>
        </View>
      </View>

      {/* 8. Datos del lugar de inspección */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>8. DATOS DEL LUGAR DE INSPECCIÓN</Text>
            <Text>Nombre: {safe(propiedad.nombre)}       RIF: {safe(propiedad.rif)}</Text>
            <Text>Calle/Avenida: {safe(propiedad.direccion || propiedad.ubicacion)}</Text>
            <Text>Sector: {safe(propiedad.sector_nombre || propiedad.sector)}</Text>
            <Text>Municipio: {safe(propiedad.municipio_nombre || propiedad.municipio)}     Parroquia: {safe(propiedad.parroquia_nombre || propiedad.parroquia)}     Estado: {safe(propiedad.estado_nombre || propiedad.estado)}</Text>
            <Text>Coordenadas UTM  Norte: {safe(inspeccion.norte)} ; Este: {safe(inspeccion.este)} ; Zona: {safe(inspeccion.zona)}</Text>
          </View>
        </View>
      </View>

      {/* 9. Finalidad de la inspección */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>9. FINALIDAD DE LA INSPECCIÓN (seleccione lo a las opciones pertinentes)</Text>
            {finOpciones.map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={styles.checkbox}>{marcar(f) ? yes : ' '}</Text>
                <Text>{f}</Text>
              </View>
            ))}
            {/* Lista con objetivos libremente */}
            {Array.isArray(inspeccion.finalidades) && inspeccion.finalidades.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Label text="Detalle de finalidades:" />
                <LinedBox rows={Math.min(4, inspeccion.finalidades.length + 1)} text={
                  inspeccion.finalidades.map((f, idx) => `${idx + 1}) ${safe(f.finalidad || f.finalidad_nombre || '')}: ${safe(f.objetivo)}`).join('\n')
                }/>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footerRow} fixed>
        <Image src={img.sicic5} style={styles.footerLogo} />
        <Text render={({ pageNumber, totalPages }) => `SICIC • INSAI • ${new Date().toLocaleDateString()}  •  Página ${pageNumber} de ${totalPages}`} />
      </View>

    </Page>
  );
}

// Página 2
function ActaPage2({ inspeccion = {}, propiedad = {}, unidad = 'DIRECCIÓN GENERAL', uploadsBaseUrl = '' }) {

  const makeSrc = (img) => {
    const name = typeof img === 'string' ? img : img?.imagen;
    if (!name) return null;
    if (/^https?:\/\//i.test(name)) return name;
    const base = (uploadsBaseUrl || '').replace(/\/$/, '');
    return base ? `${base}/${name}` : name;
  };

  // Derivados de fecha y localidad
  const d = inspeccion.fecha_inspeccion ? new Date(inspeccion.fecha_inspeccion) : null;
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const diaMes = d && !Number.isNaN(d) ? d.getDate() : '';
  const mesNombre = d && !Number.isNaN(d) ? MES[d.getMonth()] : '';
  const anio = d && !Number.isNaN(d) ? d.getFullYear() : '';

  const localidad =
    safe(inspeccion.localidad) ||
    [propiedad.sector_nombre, propiedad.parroquia_nombre, propiedad.municipio_nombre].filter(Boolean).join(', ');

  const estadoNombre = propiedad?.estado_nombre || '';

  return (
    <Page size="A4" style={styles.page}>
      <HeaderGrid
        pagina={2}
        total={2}
        n_control={inspeccion.n_control}
        codigoInspeccion={inspeccion.codigo_inspeccion}
        unidad={unidad}
      />

      {/* 10. Aspectos constatados */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>10. ASPECTOS CONSTATADOS EN LA VISITA</Text>
            <LinedBox rows={11} text={safe(inspeccion.aspectos)} />
          </View>
        </View>
      </View>

      {/* 11. Ordenamiento de medidas */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>11. ORDENAMIENTO DE MEDIDAS</Text>
            <LinedBox rows={7} text={safe(inspeccion.ordenamientos)} />
          </View>
        </View>
      </View>

      {/* 12. Anexos */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>12. ANEXOS (EVIDENCIAS DE LA INSPECCIÓN)</Text>

            {Array.isArray(inspeccion.imagenes) && inspeccion.imagenes.length > 0 && (
              <View style={[styles.imagesGrid, { marginTop: 4 }]}>
                {inspeccion.imagenes.map((ii, idx) => {
                  const src = makeSrc(ii);
                  return src ? (
                    <Image key={idx} src={src} style={styles.imageThumb} />
                  ) : null;
                })}
              </View>
            )} 
            {safe(inspeccion.anexos) ? (
              <LinedBox rows={2} text={safe(inspeccion.anexos)} />
            ) : null}
            
          </View>
        </View>
      </View>

      {/* 13. Cierre del acta */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>13. CIERRE DEL ACTA</Text>
            <Text style={{ marginTop: 4 }}>
              Se levanta la presente Acta de Inspección, por duplicado, a las {hhmm(inspeccion.hora_inspeccion)} (m) a los {safe(diaMes)} días del mes de {safe(mesNombre)} del año {safe(anio)} en {safe(localidad)}, Estado {safe(estadoNombre)}.
            </Text>
          </View>
        </View>
      </View>

      {/* 14. Firmas y sellos */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cell, { width: '50%', height: 90, alignItems: 'center', justifyContent: 'flex-end' }]}>
            <Text style={{ fontSize: 8, marginBottom: 4 }}>Servidor(es) Público(s) INSAI</Text>
          </View>
          <View style={[styles.cellNoRight, { width: '50%', height: 90, alignItems: 'center', justifyContent: 'flex-end' }]}>
            <Text style={{ fontSize: 8, marginBottom: 4 }}>En representación del lugar de inspección</Text>
          </View>
        </View>
      </View>

      {/* 15. Vigencia del acta */}
      <View style={[styles.table, { marginTop: 6 }]}>
        <View style={styles.row}>
          <View style={[styles.cellNoRight, { width: '100%' }]}>
            <Text style={styles.sectionTitle}>15. VIGENCIA DEL ACTA</Text>
            <Text style={{ marginTop: 4 }}>
              En función de los riesgos a la salud agrícola integral, la vigencia de esta Acta de Inspección será de: {safe(inspeccion.vigencia || (inspeccion.fecha_proxima_inspeccion ? `hasta ${ddmmyyyy(inspeccion.fecha_proxima_inspeccion)}` : ''))}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow} fixed>
        <Image src={img.sicic5} style={styles.footerLogo} />
        <Text render={({ pageNumber, totalPages }) => `SICIC • INSAI • ${new Date().toLocaleDateString()}  •  Página ${pageNumber} de ${totalPages}`} />
      </View>

    </Page>
  );
}

// Documento completo
export function InspeccionActaPDF({
  inspeccion = {},
  propiedad = {},
  representantes = {},
  personaAtiende = {},
  finalidadCatalogo = [], 
  unidad = 'DIRECCIÓN GENERAL',
  uploadsBaseUrl = ''
}) {
  // Resolver nombres de finalidades desde ids
  const finalidadesNombres =
    (inspeccion.finalidades || []).map((f) => {
      if (f.finalidad) return f.finalidad;
      if (f.finalidad_nombre) return f.finalidad_nombre;
      const found = (finalidadCatalogo || []).find((x) => String(x.id) === String(f.finalidad_id));
      return found?.nombre || '';
    });

  return (
    <Document
      title={`Acta de Inspección ${safe(inspeccion.codigo_inspeccion || inspeccion.n_control || inspeccion.id)}`}
      author="SICIC • INSAI"
      subject="Acta de Inspección con Fines de Vigilancia"
      keywords="SICIC, INSAI, Inspección, Acta"
    >
      <ActaPage1
        inspeccion={inspeccion}
        propiedad={propiedad}
        representantes={representantes}
        personaAtiende={personaAtiende}
        finalidadesNombres={finalidadesNombres}
        unidad={unidad}
      />
      <ActaPage2 
      inspeccion={inspeccion}
      propiedad={propiedad} 
      unidad={unidad}
      uploadsBaseUrl={uploadsBaseUrl}
      />
    </Document>
  );
}

// Builder para usar en el Front (preview/descarga)
export async function buildInspeccionActaBlob(payload) {
  const doc = <InspeccionActaPDF {...payload} />;
  return await pdf(doc).toBlob();
}