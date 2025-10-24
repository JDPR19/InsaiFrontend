import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import img from '../image/image';

const BANNER_DEFAULT = img.cintillo || '/assets/cintillo.png';

const styles = StyleSheet.create({
  page: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 72,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  band: { position: 'absolute', top: 20, left: 5, right: 5, height: 50 },
  bandImg: { width: '100%', height: '100%', objectFit: 'contain' },
  header: { textAlign: 'center', marginBottom: 25 },
  title: { fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.1 },
  subtitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  numCert: { fontSize: 12, fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  p: { textAlign: 'justify', lineHeight: 1.2, marginBottom: 10 },
  bold: { fontWeight: 'bold' },
 firmaBox: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  firmaLine: { width: '60%', borderTop: '1pt solid #000', marginTop: 20, marginBottom: 6, alignSelf: 'center' },
  firmaText: { textAlign: 'center', fontSize: 11 },
  firmaTextMuted: { textAlign: 'center', fontSize: 10, color: '#555' },
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

const fechaLargaEs = (f) => {
  try {
    const d = new Date(f);
    const dia = d.getDate();
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear();
    return `a los ${dia} días del mes de ${mes} de ${anio}.`;
  } catch {
    return `a ${f || '—'}.`;
  }
};

const CertificadoFitosanitarioDoc = ({
  empresaNombre = 'VITALIM, C.A.',
  empresaReg = '2044REG320419',
  empresaRif = 'J-07542384-4',
  parroquia = 'CHIVACAO',
  municipio = 'BRUZUAL',
  estado = 'YARACUY',
  representante = 'YILMER GALLARDO',
  representanteCedula = 'V-11274486',
  silos = '1',
  galpones = '1',
  capacidadInstalada = '2250 TM',
  capacidadProcesamiento = '75 TM/DIA',
  capacidadAlmacenamiento = '900 TM',
  rubros = 'MAIZ AMARILLO, ARROZ DE TERCERA, HARINA DE SOYA, ABA',
  destino = 'ANIMAL',
  inspector = 'ING. YUDISKA FIGUEROA',
  inspectorCedula = 'V-16.594.056',
  fechaInspeccion = '',
  numCertificado = '152502',
  numInspeccion = 'YAR-16594056-22052025-01',
  fechaEmision = '',
  coordinador = 'ING. GUSTAVO MUJICA',
  coordinadorCedula = 'V-9.601.781',
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cintillo superior */}
      <View style={styles.band} fixed>
        <Image src={BANNER_DEFAULT} style={styles.bandImg} />
      </View>

      {/* Título y número */}
      <View style={styles.header}>
        <Text style={styles.title}>CERTIFICADO FITOSANITARIO A EMPRESAS</Text>
        <Text style={styles.subtitle}>(SILOS, TORREFACTORA Y ALMACENES)</Text>
      </View>
      <Text style={styles.numCert}>Nº <Text style={styles.bold}>{numCertificado}</Text></Text>

      {/* Cuerpo principal */}
      <Text style={styles.p}>
        El suscrito ciudadano: <Text style={styles.bold}>ING. AGR. GUSTAVO MUJICA</Text> C.I: <Text style={styles.bold}>V-9.601.781</Text> Coordinador Regional del Instituto Nacional de Salud Agrícola Integral (INSAI) del estado Yaracuy, hace constar que la Empresa: <Text style={styles.bold}>{empresaNombre}</Text> Nº Reg. INSAI: <Text style={styles.bold}>{empresaReg}</Text> RIF:<Text style={styles.bold}>{empresaRif}</Text>, ubicada en la parroquia <Text style={styles.bold}>{parroquia}</Text> municipio <Text style={styles.bold}>{municipio}</Text> estado <Text style={styles.bold}>{estado}</Text>, cuyo representante legal es: <Text style={styles.bold}>{representante}</Text> C.I: <Text style={styles.bold}>{representanteCedula}</Text> con un N° de Silos <Text style={styles.bold}>{silos}</Text>, Galpones de almacenamiento <Text style={styles.bold}>{galpones}</Text>, Capacidad Instalada: <Text style={styles.bold}>{capacidadInstalada}</Text>, Capacidad Operativa de procesamiento: <Text style={styles.bold}>{capacidadProcesamiento}</Text> Capacidad Operativa de Almacenamiento: <Text style={styles.bold}>{capacidadAlmacenamiento}</Text>, la cual almacena los rubros: <Text style={styles.bold}>{rubros}</Text> destinados al consumo: <Text style={styles.bold}>{destino}</Text>; Cumple con las condiciones fitosanitarias contempladas en la Ley de Salud Agrícola Integral para el almacenamiento y/o procesamiento de los rubros inspeccionados, según inspección realizada por el(la) inspector(a) designado(a): <Text style={styles.bold}>{inspector}</Text>, C.I <Text style={styles.bold}>{inspectorCedula}</Text> el día <Text style={styles.bold}>{fmtFecha(fechaInspeccion)}</Text>, registrada en Acta de inspección N°: <Text style={styles.bold}>{numInspeccion}</Text>. Por tanto, <Text style={styles.bold}>SE CERTIFICA FITOSANITARIAMENTE</Text> a la Empresa para realizar la(s) actividad(es) mencionada(s) anteriormente.
      </Text>

      {/* Fecha de emisión */}
      <Text style={styles.p}>
        Se expide el presente certificado {fechaLargaEs(fechaEmision || fechaInspeccion)}
      </Text>

      {/* Firma */}
      <View style={styles.firmaBox}>
        <View style={styles.firmaLine} />
        <Text style={styles.firmaText}>{coordinador}</Text>
        <Text style={styles.firmaTextMuted}>Coordinador INSAI - Yaracuy</Text>
        <Text style={styles.firmaTextMuted}>C.I: {coordinadorCedula}</Text>
        <Text style={styles.firmaTextMuted}>Designado según Gaceta Oficial Nº 41.834, de fecha 06 de Marzo de 2020</Text>
      </View>
    </Page>
  </Document>
);

// Función para generar el blob del PDF
export async function buildCertificadoFitosanitarioBlob(props) {
  const instance = pdf(<CertificadoFitosanitarioDoc {...props} />);
  const blob = await instance.toBlob();
  return blob;
}

export default CertificadoFitosanitarioDoc;