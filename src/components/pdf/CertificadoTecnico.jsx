import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import img from '../image/image'; // componente de imágenes centralizado

// Rutas por defecto (usa public/assets si alguna falta)
const BANNER_DEFAULT = img.cintillo || '/assets/cintillo.png';
const LOGO_SICIC_DEFAULT = img.sicic5 || '/assets/logo-sicic-insai.png';

const styles = StyleSheet.create({
  page: {
    paddingTop: 100,        // espacio para el cintillo
    paddingBottom: 60,      // espacio para el footer
    paddingHorizontal: 72,  
    fontFamily: 'Helvetica',
    fontSize: 12,
  },

  // Cintillo superior
  band: { position: 'absolute', top: 20, left: 5, right: 5, height: 50 },
  bandImg: { width: '100%', height: '100%', objectFit: 'contain' },

  // Encabezado
  header: { textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.1 },

  // Cuerpo
  section: { marginTop: 10 },
  p: { textAlign: 'left', lineHeight: 1.2, marginBottom: 10 },

  // Firmas
  firmasWrap: { marginTop: 30, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
  firmaBox: { width: '47%', alignItems: 'center', justifyContent: 'center' },
  firmaLine: { width: '100%', borderTop: '1pt solid #000', marginTop: 20, marginBottom: 6 },
  firmaText: { textAlign: 'center', fontSize: 11 },
  firmaTextMuted: { textAlign: 'center', fontSize: 10, color: '#555' },

  // Footer
  footer: {
    position: 'absolute',
    left: 72,
    right: 72,
    bottom: 20,
    borderTop: '1pt solid #ddd',
    paddingTop: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: { fontSize: 10, color: '#444', maxWidth: '60%' },
  footerRight: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  footerLogo: { width: 70, height: 18, objectFit: 'contain', marginRight: -22 },
  footerSys: { fontSize: 10, color: '#222' },
  footerPage: { fontSize: 9, color: '#777', marginLeft: 8 },
});

const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

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

// Devuelve "Ciudad, a los 18 días del mes de octubre de 2025."
const fechaLargaEs = (f, ciudad, opts = {}) => {
  const { prefijo = '' } = opts; // deja '' para no anteponer "En "
  try {
    const d = new Date(f);
    const dia = d.getDate();
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear();
    const lugar = (ciudad || '—').replace(/^en\s+/i, '').trim();
    return `${prefijo}${lugar}, a los ${dia} días del mes de ${mes} de ${anio}.`;
  } catch {
    const lugar = (ciudad || '—').replace(/^en\s+/i, '').trim();
    return `${prefijo}${lugar}, a ${f || '—'}.`;
  }
};

// Une lista en una sola línea, acortando si hay muchos ítems
function joinLimit(items, max = 6) {
  const arr = (items || []).map(String).filter(Boolean);
  if (!arr.length) return '—';
  if (arr.length <= max) return arr.join(', ');
  const rest = arr.length - max;
  return `${arr.slice(0, max).join(', ')} y ${rest} más`;
}

const CertificadoTecnicoDoc = ({
  // Datos “memo”
  memoEmpresaNombre = 'INSAI',
  memoClienteNombre = '',
  memoDireccion = '',
  memoPeriodoInicio = '',
  memoPeriodoFin = '',
  memoSistemas = '',
  memoNormas = 'Normativa sanitaria vigente del INSAI y disposiciones aplicables.',
  memoConclusion = 'Conforme.',
  memoCiudad = '',

  // Responsables
  responsablePrincipal = null,
  tecnicos = [],

  // Contexto
  inspeccion,
  propiedad,
  productores = [],
  programas = [],
  observaciones,

  // Metadatos y activos
  fechaEmision,
  autoridad = 'INSAI',
  bannerSrc = BANNER_DEFAULT,
  footerLogoSrc = LOGO_SICIC_DEFAULT,
}) => {
  const productoresStr = joinLimit(productores.map(p => [p?.nombre, p?.apellido].filter(Boolean).join(' ')));
  const programasStr = joinLimit(programas.map(pg => pg?.tipo ? `${pg.nombre} (Tipo: ${pg.tipo})` : pg.nombre));
  const obsStr = observaciones ? String(observaciones) : '';

  // Párrafo “Resumen técnico” (programas de contingencia + observaciones)
  const periodoTexto =
    (memoPeriodoInicio || memoPeriodoFin)
      ? `durante el período comprendido entre ${fmtFecha(memoPeriodoInicio)} y ${fmtFecha(memoPeriodoFin || memoPeriodoInicio)}`
      : 'durante el período referido';

  const resumenParrafo = (() => {
    const tieneProgs = Array.isArray(programas) && programas.length > 0;
    const tieneObs = !!obsStr;
    const progsTxt = tieneProgs
      ? `se establecieron programas de contingencia para el control de plagas y enfermedades: ${programasStr}.`
      : `no se registraron programas de contingencia específicos.`;
    const obsTxt = tieneObs
      ? `Asimismo, el resumen de la inspección señala: ${obsStr}.`
      : `Asimismo, no se reportaron observaciones relevantes.`;
    return `En el marco de las actuaciones técnicas ${periodoTexto}, ${progsTxt} ${obsTxt}`;
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cintillo superior */}
        {bannerSrc ? (
          <View style={styles.band} fixed>
            <Image src={bannerSrc} style={styles.bandImg} />
          </View>
        ) : null}

        {/* Título */}
        <View style={styles.header}>
          <Text style={styles.title}>CERTIFICADO TÉCNICO DE INSPECCIONES DE CAMPO</Text>
        </View>

        {/* Contenido (una sola página) */}
        <View style={styles.section} wrap={false}>
          {/* Párrafo con identificación integrada */}
          <Text style={styles.p}>
            Por medio del presente, se certifica que el equipo técnico de el Instituto Nacional de Salud Agrícola Integral ({memoEmpresaNombre}) ha realizado diagnósticos de campo,
            con relación a la inspección identificada con Código UBIGEO: {inspeccion?.codigo_inspeccion || '—'}
            {inspeccion?.n_control ? ` · N° Control: ${inspeccion.n_control}` : ''}
            {inspeccion?.fecha_inspeccion ? ` · Fecha: ${fmtFecha(inspeccion.fecha_inspeccion)}` : ''}.
            Dichas actuaciones se efectuaron en las instalaciones de la Propiedad: {memoClienteNombre} ubicada en {memoDireccion || propiedad?.propiedad_ubicacion || '—'},
            {` ${periodoTexto}.`} Las inspecciones incluyeron la evaluación de {memoSistemas || 'sistemas fitosanitarios y condiciones de control de plagas'},
            conforme a los estándares técnicos vigentes y bajo los lineamientos establecidos por {memoNormas}
            {memoNormas?.trim().endsWith('.') ? '' : '.'}
          </Text>

         {/* Resumen técnico (programas + observaciones) */}
          {(Array.isArray(programas) && programas.length) || obsStr ? (
            <Text style={styles.p}>{resumenParrafo}</Text>
          ) : null}

          {/* Conclusión */}
          <Text style={styles.p}>
            Como resultado de las actividades, se concluye que {memoConclusion}
            {memoConclusion?.trim().endsWith('.') ? '' : '.'}
          </Text>


          {/* Solicitud del cliente (opcional) */}
          {memoClienteNombre ? (
            <Text style={styles.p}>
              Este certificado se emite a solicitud de la Propiedad: {memoClienteNombre} teniendo como Propietario a {productoresStr} para los fines que estime convenientes.
            </Text>
          ) : null}

          {/* Cierre con ciudad y fecha larga (sin prefijo "En") */}
          <Text style={[styles.p, { marginTop: 6 }]}>
            {fechaLargaEs(fechaEmision || new Date().toISOString(), memoCiudad, { prefijo: '' })}
          </Text>
        </View>

        {/* Firmas */}
        <View style={styles.firmasWrap}>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine} />
            <Text style={styles.firmaText}>
              {responsablePrincipal
                ? `${[responsablePrincipal?.nombre, responsablePrincipal?.apellido].filter(Boolean).join(' ') || '—'}`
                : 'Servidor público certificante'}
            </Text>
            {responsablePrincipal?.cargo && <Text style={styles.firmaTextMuted}>{responsablePrincipal.cargo}</Text>}
          </View>

          {(() => {
            const t = Array.isArray(tecnicos) && tecnicos.length ? tecnicos[0] : null;
            return (
              <View style={styles.firmaBox}>
                <View style={styles.firmaLine} />
                <Text style={styles.firmaText}>
                  {'Responsable de la inspección'}
                </Text>
                {t?.cargo && <Text style={styles.firmaTextMuted}>{t.cargo}</Text>}
              </View>
            );
          })()}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            Emitido por: {autoridad} · Fecha de emisión: {fmtFecha(fechaEmision)}
          </Text>
          <View style={styles.footerRight}>
            {footerLogoSrc ? <Image src={footerLogoSrc} style={styles.footerLogo} /> : null}
            <Text style={styles.footerSys}>SICIC-INSAI</Text>
            <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Pág. ${pageNumber} de ${totalPages}`} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function buildCertificadoTecnicoBlob(props) {
  const instance = pdf(<CertificadoTecnicoDoc {...props} />);
  const blob = await instance.toBlob();
  return blob;
}

export default CertificadoTecnicoDoc;