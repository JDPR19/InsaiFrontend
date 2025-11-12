import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import img from '../image/image';

const safe = (v) => (v == null ? '—' : String(v));
const upper = (v) => safe(v).toUpperCase();
const ddmmyyyy = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return safe(iso);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const fmt = (v) => {
  const n = num(v);
  return n == null ? '—' : new Intl.NumberFormat('es-VE', { maximumFractionDigits: 2 }).format(n);
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingLeft: 18,
    paddingRight: 18,
    paddingBottom: 54,      // reserva espacio para el footer
    fontSize: 9,
    color: '#000',
    flexDirection: 'column'
  },
  content: {                // contenedor del cuerpo que crece
    flexGrow: 1,
    flexDirection: 'column',
    display: 'flex'
  },
  push: { flexGrow: 1 },    // empuja las firmas al final
  table: { border: '1 solid #000', width: '100%' },
  row: { flexDirection: 'row' },
  cell: { borderRight: '1 solid #000', borderBottom: '1 solid #000', padding: 4, justifyContent: 'center' },
  cellNoRight: { borderBottom: '1 solid #000', padding: 4, justifyContent: 'center' },
  bold: { fontWeight: 700 },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
  headerLogos: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 6, justifyContent: 'center', width: '100%' },
  logoInsai: { width: 60, height: 30, objectFit: 'contain', alignSelf: 'center' },
  footerRow: { position: 'absolute', bottom: 10, left: 18, right: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerLogo: { width: 14, height: 14, objectFit: 'contain', marginRight: 6 }
});

function Header({ titulo = 'ACTA DE INSPECCIÓN · SILOS Y ALMACENES', unidad = 'DIRECCIÓN GENERAL', codigoInspeccion = '', nControl = '', pagina = 1, total = 1 }) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, { borderBottomWidth: 0 }]}>
        <View style={[styles.cell, { width: '38%', borderBottomWidth: 1 }]}>
          <View style={styles.headerLogos}>
            <Image style={styles.logoInsai} src={img.logoInsai} />
          </View>
        </View>
        <View style={[styles.cell, { width: '22%', borderBottomWidth: 1 }]}>
          <Text>UNIDAD:</Text>
          <Text style={{ marginTop: 2 }}>{upper(unidad)}</Text>
        </View>
        <View style={[styles.cellNoRight, { width: '40%', borderBottomWidth: 1 }]}>
          <Text>CÓDIGO INSPECCIÓN:</Text>
          <Text style={{ marginTop: 2 }}>{codigoInspeccion || '—'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.cellNoRight, { width: '100%' }]}>
          <Text style={[styles.center, styles.bold]}>{titulo}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.cell, { width: '60%' }]}>
          <Text>N° DE CONTROL:</Text>
          <Text style={{ marginTop: 2 }}>{nControl || '—'}</Text>
        </View>
        <View style={[styles.cellNoRight, { width: '40%' }]}>
          <Text>PÁGINA:</Text>
          <Text style={{ marginTop: 2 }}>{pagina} de {total}</Text>
        </View>
      </View>
    </View>
  );
}

function GridRow({ cols = [] }) {
  // cols: [{ label, value, width }]
  const totalWidth = cols.reduce((a, c) => a + (c.width || 1), 0);
  return (
    <View style={styles.row}>
      {cols.map((c, i) => {
        const wPct = `${((c.width || 1) / totalWidth) * 100}%`;
        const Comp = i === cols.length - 1 ? styles.cellNoRight : styles.cell;
        return (
          <View key={i} style={[Comp, { width: wPct }]}>
            <Text style={{ fontSize: 8 }}>{c.label}</Text>
            <Text style={{ marginTop: 2 }}>{safe(c.value)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ActaSilosPDF({
  acta = {},
  inspeccion = {},
  propiedad = {},
  propietario = {},
  tipoEventoNombre = '',
  registroNotificacion = '',
  programas = '',
  plagasEnfermedades = '',
  certificadoFitosanitario = '',   // 'Sí' | 'No' | ''
  tecnicos = [],                    // [{nombre, apellido, cedula, telefono}]
  cultivos_detalle = [],
  unidad = 'DIRECCIÓN GENERAL'
}) {
  const nNac = num(acta.cant_nacional) ?? 0;
  const nImp = num(acta.cant_importado) ?? 0;
  const total = (nNac ?? 0) + (nImp ?? 0);
  const afect = num(acta.cant_afectado);
  const pct = total > 0 && afect != null ? Math.max(0, Math.min(100, (afect * 100) / total)) : null;

  const empresa = propiedad?.propiedad_nombre || propiedad?.nombre || '';
  const rif = propiedad?.propiedad_rif || propiedad?.rif || '';
  const estado = propiedad?.estado_nombre || inspeccion?.estado_nombre || inspeccion?.estado || '';
  const municipio = propiedad?.municipio_nombre || inspeccion?.municipio_nombre || inspeccion?.municipio || '';
  const parroquia = propiedad?.parroquia_nombre || inspeccion?.parroquia_nombre || inspeccion?.parroquia || '';
  const sector = propiedad?.sector_nombre || inspeccion?.sector_nombre || inspeccion?.sector || '';
  const tipoPropiedad = propiedad?.tipo_propiedad_nombre || propiedad?.tipo || '';
  const respEmpresa = [propietario?.nombre, propietario?.apellido].filter(Boolean).join(' ') || inspeccion?.responsable_e || '';
  const respCI  = propietario?.cedula || inspeccion?.cedula_res || '';
  const respTel = propietario?.telefono || inspeccion?.tlf || '';
  const tecnicoNom = tecnicos.map(t => [t?.nombre, t?.apellido].filter(Boolean).join(' ')).filter(Boolean).join(' | ');
  const tecnicoTel = tecnicos.map(t => t?.telefono).filter(Boolean).join(' | ');
  const tecnicoCI  = tecnicos.map(t => t?.cedula).filter(Boolean).join(' | ');
  const cultivosArr = Array.isArray(cultivos_detalle) ? cultivos_detalle : [];
  const totalSupCultivos = cultivosArr.reduce((a,c)=>a + (num(c.superficie) ?? 0), 0);
  const totalCantCultivos = cultivosArr.reduce((a,c)=>a + (num(c.cantidad) ?? 0), 0);
  const titulo = 'ACTA DE INSPECCIÓN · SILOS Y ALMACENES';
  const codigoInspeccion = inspeccion?.codigo_inspeccion || '';
  const nControl = inspeccion?.n_control || '';

  return (
    <Document
      title={`Acta Silos ${safe(codigoInspeccion || nControl || inspeccion?.id)}`}
      author="SICIC • INSAI"
      subject="Acta de Inspección de Silos y Almacenes"
      keywords="SICIC, INSAI, Acta, Silos, Almacenes"
    >
      <Page size="A4" style={styles.page}>
        <Header
          titulo={titulo}
          unidad={unidad}
          codigoInspeccion={codigoInspeccion}
          nControl={nControl}
          pagina={1}
          total={1}
        />

        {/* CUERPO QUE CRECE */}
        <View style={styles.content}>
          <View style={[styles.table, { marginTop: 6 }]}>
            <GridRow cols={[
              { label: 'TIPO DE EVENTO', value: tipoEventoNombre, width: 1.2 },
              { label: 'REGISTRO DE NOTIFICACIÓN', value: registroNotificacion, width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'FECHA DE NOTIFICACIÓN', value: ddmmyyyy(acta.fecha_notificacion), width: 1 },
              { label: 'FECHA DE LA INSPECCIÓN', value: ddmmyyyy(inspeccion.fecha_inspeccion), width: 1 },
              { label: 'SEMANA EPID.', value: safe(acta.semana_epid), width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'ESTADO', value: estado, width: 1 },
              { label: 'MUNICIPIO', value: municipio, width: 1 },
              { label: 'PARROQUIA', value: parroquia, width: 1 },
              { label: 'SECTOR', value: sector, width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'LUGAR O SITIO DONDE SE REALIZA LA INSPECCIÓN (Silos, Almacenes y Depósitos)', value: acta.lugar_ubicacion, width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'NOMBRE DE LA EMPRESA INSPECCIONADA', value: empresa, width: 1.2 },
              { label: 'RIF', value: rif, width: 0.8 }
            ]}/>
            <GridRow cols={[
              { label: 'TIPO DE PROPIEDAD', value: tipoPropiedad || '—', width: 1 }
            ]}/>

            {cultivosArr.length > 0 && (
              <View style={[styles.table, { marginTop: 4 }]}>
                <View style={styles.row}>
                  <View style={[styles.cell, { width: '50%' }]}><Text style={{ fontSize: 8 }}>NOMBRE RUBRO:</Text></View>
                  <View style={[styles.cell, { width: '25%' }]}><Text style={{ fontSize: 8 }}>SUPERFICIE:</Text></View>
                  <View style={[styles.cellNoRight, { width: '25%' }]}><Text style={{ fontSize: 8 }}>CANTIDAD:</Text></View>
                </View>
                {cultivosArr.map((c, i) => (
                  <View key={i} style={styles.row}>
                    <View style={[styles.cell, { width: '50%' }]}><Text>{safe(c.nombre)}</Text></View>
                    <View style={[styles.cell, { width: '25%' }]}><Text>{c.superficie != null ? fmt(c.superficie) : '—'}</Text></View>
                    <View style={[styles.cellNoRight, { width: '25%' }]}><Text>{c.cantidad != null ? fmt(c.cantidad) : '—'}</Text></View>
                  </View>
                ))}
                <View style={styles.row}>
                  <View style={[styles.cell, { width: '50%' }]}><Text style={styles.bold}>TOTALES</Text></View>
                  <View style={[styles.cell, { width: '25%' }]}><Text style={styles.bold}>{fmt(totalSupCultivos)}</Text></View>
                  <View style={[styles.cellNoRight, { width: '25%' }]}><Text style={styles.bold}>{fmt(totalCantCultivos)}</Text></View>
                </View>
              </View>
            )}

            <GridRow cols={[
              { label: 'PROGRAMAS ANEXADOS EN EL SEGUIMIENTO', value: programas, width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'CANTIDAD TOTAL DE PRODUCTO', value: fmt(total), width: 1 },
              { label: 'UNIDAD DE MEDIDA (t/kg/plantas)', value: safe(acta.unidad_medida), width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'CANT. PRODUCTO NACIONAL O IMPORTADO', value: `Nacional: ${fmt(nNac)} · Importado: ${fmt(nImp)}`, width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'CANTIDAD PRODUCTO AFECTADO (t/kg/plantas)', value: afect != null ? `${fmt(afect)}${acta.unidad_medida ? ' ' + acta.unidad_medida : ''}${pct != null ? ` (${pct.toFixed(2)}%)` : ''}` : '—', width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'PLAGAS O ENFERMEDADES', value: plagasEnfermedades, width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'RESPONSABLE DE LA EMPRESA', value: respEmpresa, width: 1 },
              { label: 'C.I', value: respCI, width: 0.5 },
              { label: 'TELÉFONO', value: respTel, width: 0.5 }
            ]}/>
            <GridRow cols={[
              { label: 'NÚMERO DE SILOS', value: safe(acta.numero_silos), width: 1 },
              { label: 'NÚMERO DE GALPONES', value: safe(acta.numero_galpones), width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'CAPACIDAD INSTALADA', value: safe(acta.capacidad_instalada), width: 1 },
              { label: 'CAPACIDAD OPERATIVA', value: safe(acta.capacidad_operativa), width: 1 },
              { label: 'CAPACIDAD DE ALMACENAMIENTO', value: safe(acta.capacidad_almacenamiento), width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'DESTINO OBJETIVO', value: safe(acta.destino_objetivo), width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'MEDIDAS RECOMENDADAS', value: safe(acta.medidas_recomendadas), width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'POSEE CERTIFICADO FITOSANITARIO', value: certificadoFitosanitario ? upper(certificadoFitosanitario) : '—', width: 0.8 }
            ]}/>
            <GridRow cols={[
              { label: 'OBSERVACIONES', value: safe(acta.observaciones), width: 1 }
            ]}/>
            <GridRow cols={[
              { label: 'TÉCNICO(S) RESPONSABLE(S) DE LA INSPECCIÓN', value: tecnicoNom || '—', width: 1 },
              { label: 'C.I. DEL TÉCNICO', value: tecnicoCI || '—', width: 0.6 },
              { label: 'TELÉFONO DEL TÉCNICO', value: tecnicoTel || '—', width: 0.6 }
            ]}/>
          </View>

          {/* empuja las firmas al fondo de la última página */}
          <View style={styles.push} />

          {/* FIRMAS: bloque indivisible al final; si no cabe, pasa completo a la próxima página */}
          <View style={[styles.table, { marginTop: 10 }]} wrap={false}>
            <View style={styles.row}>
              <View style={[styles.cell, { width: '50%', height: 90, alignItems: 'center', justifyContent: 'flex-end' }]}>
                <Text style={{ fontSize: 8, marginBottom: 4 }}>Servidor(es) Público(s) INSAI</Text>
              </View>
              <View style={[styles.cellNoRight, { width: '50%', height: 90, alignItems: 'center', justifyContent: 'flex-end' }]}>
                <Text style={{ fontSize: 8, marginBottom: 4 }}>Propietario/Representante del lugar de inspección</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer fijo */}
        <View style={styles.footerRow} fixed>
          <Image src={img.sicic5} style={styles.footerLogo} />
          <Text>SICIC • INSAI • {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
}

// Builder para blob (preview/descarga en frontend)
export async function buildActaSilosBlob(payload) {
  const doc = <ActaSilosPDF {...payload} />;
  return await pdf(doc).toBlob();
}