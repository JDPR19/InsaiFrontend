import React from 'react';
import img from '../image/image';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';


const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: '#222' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1 solid #98c79a', paddingBottom: 8, marginBottom: 12 },
  logo: { width: 64, height: 64, objectFit: 'contain' },
  titleWrap: { textAlign: 'right' },
  title: { fontSize: 16, fontWeight: 700 },
  sub: { fontSize: 10, color: '#666' },
  section: { marginTop: 8, paddingTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#4b5', marginBottom: 6 },

  // Tarjetas de propiedades
  propertyList: { marginTop: 6 },
  propertyCard: { border: '1 solid #e6e6e6', borderRadius: 4, padding: 8, marginBottom: 8, backgroundColor: '#fff' },
  propHeader: { marginBottom: 6 },
  propTitle: { fontSize: 11, fontWeight: 700, color: '#222' },
  propMeta: { fontSize: 9, color: '#555', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 6 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%', paddingRight: 8, marginBottom: 4 },
  gridItemFull: { width: '100%', marginBottom: 4 },
  gridLabel: { fontSize: 9, color: '#666' },
  gridValue: { fontSize: 10, color: '#222' },

  footer: { position: 'absolute', bottom: 24, left: 28, right: 28 },
  footerLogo: { width: 14, height: 14, marginRight: 6 },
  footerText: { fontSize: 9, color: '#666', textAlign: 'center' }
});

const safe = (v) => (v == null ? '' : String(v));
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : safe(v);
};


const toAbsolute = (u) => {
  if (!u) return '';
  try {
    const origin = (globalThis?.location?.origin) || '';
    return new URL(u, origin).toString();
  } catch {
    return u;
  }
};


const withBuster = (u) => {
  if (!u) return '';
  const sep = u.includes('?') ? '&' : '?';
  return `${u}${sep}cb=${Date.now()}`;
};

export function ProductorFichaPDF({ productor, propiedades = [], logoUrl = img.logoInsai}) {
  const headerLogo = toAbsolute(withBuster(logoUrl));
  const footerLogo = toAbsolute(withBuster(img.sicic5));

  return (
    <Document
      title={`Ficha del Productor ${safe(productor?.codigo || productor?.cedula || productor?.id)}`}
      author="SISIC • INSAI"
      subject="Ficha del Productor"
      keywords="SISIC, INSAI, Productor, Propiedad"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={headerLogo} cache={false} key={headerLogo} />
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Ficha de Productor</Text>
            <Text style={styles.sub}>Generada: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Productor</Text>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.gridLabel}>Código Runsai</Text>
              <Text style={styles.gridValue}>{safe(productor?.codigo)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gridLabel}>Cédula</Text>
              <Text style={styles.gridValue}>{safe(productor?.cedula)}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.gridLabel}>Nombre</Text>
              <Text style={styles.gridValue}>{`${safe(productor?.nombre)} ${safe(productor?.apellido)}`.trim()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gridLabel}>Contacto</Text>
              <Text style={styles.gridValue}>{safe(productor?.contacto)}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.gridLabel}>Correo</Text>
              <Text style={styles.gridValue}>{safe(productor?.email)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gridLabel}>Propiedades asociadas</Text>
              <Text style={styles.gridValue}>{safe(productor?.total_propiedades)}</Text>
            </View>
          </View>
        </View>

        {Array.isArray(propiedades) && propiedades.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propiedades</Text>

            <View style={styles.propertyList}>
              {propiedades.map((p) => (
                <View key={p.id} style={styles.propertyCard}>
                  <View style={styles.propHeader}>
                    <Text style={styles.propTitle}>
                      {`Propiedad ${safe(p.codigo)} — ${safe(p.nombre)}`}
                    </Text>
                    <Text style={styles.propMeta}>
                      {[
                        p.rif ? `RIF: ${safe(p.rif)}` : '',
                        p.tipo ? `Tipo: ${safe(p.tipo)}` : ''
                      ].filter(Boolean).join('  •  ')}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.grid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>Hectáreas</Text>
                      <Text style={styles.gridValue}>{num(p.hectareas)}</Text>
                    </View>
                    {p.sitios_asociados ? (
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Sitios asociados</Text>
                        <Text style={styles.gridValue}>{safe(p.sitios_asociados)}</Text>
                      </View>
                    ) : null}
                    {p.posee_certificado ? (
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Certificado</Text>
                        <Text style={styles.gridValue}>{safe(p.posee_certificado)}</Text>
                      </View>
                    ) : null}
                    {p.estado_propiedad ? (
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Estado (estatus)</Text>
                        <Text style={styles.gridValue}>{safe(p.estado_propiedad)}</Text>
                      </View>
                    ) : null}

                    {p.cultivo ? (
                      <View style={styles.gridItemFull}>
                        <Text style={styles.gridLabel}>Cultivos</Text>
                        <Text style={styles.gridValue}>{safe(p.cultivo)}</Text>
                      </View>
                    ) : null}
                    {p.cultivos_cientificos ? (
                      <View style={styles.gridItemFull}>
                        <Text style={styles.gridLabel}>Nombres científicos</Text>
                        <Text style={styles.gridValue}>{safe(p.cultivos_cientificos)}</Text>
                      </View>
                    ) : null}
                    {p.tipos_cultivo ? (
                      <View style={styles.gridItemFull}>
                        <Text style={styles.gridLabel}>Tipo(s) de cultivo</Text>
                        <Text style={styles.gridValue}>{safe(p.tipos_cultivo)}</Text>
                      </View>
                    ) : null}

                    {p.ubicacion ? (
                      <View style={styles.gridItemFull}>
                        <Text style={styles.gridLabel}>Ubicación</Text>
                        <Text style={styles.gridValue}>{safe(p.ubicacion)}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propiedades</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>Sin propiedades registradas</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image style={styles.footerLogo} src={footerLogo} cache={false} key={footerLogo} />
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) =>
                `SICIC • INSAI • ${new Date().toLocaleDateString()}  •  Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function buildProductorFichaBlob({ productor, propiedades = [], logoUrl }) {
  const doc = <ProductorFichaPDF productor={productor} propiedades={propiedades} logoUrl={logoUrl} />;
  return await pdf(doc).toBlob();
}