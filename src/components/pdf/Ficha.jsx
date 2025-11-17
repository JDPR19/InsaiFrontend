import React from 'react';
import img from '../image/image';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10.5, color: '#222', fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1 solid #7fb67f', paddingBottom: 8, marginBottom: 12 },
  logo: { width: 64, height: 64, objectFit: 'contain' },
  titleWrap: { textAlign: 'right' },
  title: { fontSize: 17, fontWeight: 700, color: '#234' },
  sub: { fontSize: 9, color: '#666' },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 12.5, fontWeight: 700, color: '#2f6d38', marginBottom: 6, textTransform: 'uppercase' },

  propertyList: { marginTop: 4 },
  propertyCard: { border: '1 solid #d9e2d9', borderRadius: 4, padding: 9, marginBottom: 9, backgroundColor: '#fcfdfc' },
  propHeader: { marginBottom: 6 },
  propTitle: { fontSize: 11.5, fontWeight: 700, color: '#1f2d33' },
  propMeta: { fontSize: 8.7, color: '#4a5a60', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#e3e9e3', marginVertical: 6 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%', paddingRight: 8, marginBottom: 4 },
  gridItemFull: { width: '100%', marginBottom: 4 },
  gridLabel: { fontSize: 8.2, color: '#5d6d73', fontWeight: 700 },
  gridValue: { fontSize: 9.8, color: '#222' },

  cultivosWrapper: { marginTop: 4 },
  cultivosTitle: { fontSize: 9.5, fontWeight: 700, color: '#2f6d38', marginBottom: 3 },
  cultivosTable: { border: '1 solid #b9c9b9', borderRadius: 3, overflow: 'hidden' },
  cRow: { flexDirection: 'row' },
  cCellHead: { flexGrow: 1, paddingVertical: 4, paddingHorizontal: 4, backgroundColor: '#e9f3ea', borderRight: '1 solid #d0ddd0' },
  cCellHeadText: { fontSize: 8, fontWeight: 700, color: '#2d3d2d' },
  cCell: { flexGrow: 1, paddingVertical: 3, paddingHorizontal: 4, borderRight: '1 solid #e2e9e2', borderTop: '1 solid #e2e9e2' },
  cCellLast: { borderRight: '0 solid #fff' },
  cCellText: { fontSize: 8, color: '#222' },
  cMuted: { fontSize: 8, color: '#777', fontStyle: 'italic', padding: 6, textAlign: 'center' },
  totalesBar: { flexDirection: 'row', marginTop: 4, borderTop: '1 solid #d0ddd0', paddingTop: 3 },
  totLabel: { fontSize: 8, fontWeight: 700, color: '#2d3d2d', width: '50%' },
  totValue: { fontSize: 8, fontWeight: 700, color: '#2d3d2d', width: '25%' },

  globalResumen: { marginTop: 10, padding: 8, border: '1 solid #d9e2d9', borderRadius: 4, backgroundColor: '#f4f9f4' },
  globalTitle: { fontSize: 11, fontWeight: 700, color: '#234', marginBottom: 4 },
  globalLine: { fontSize: 9, color: '#333', marginBottom: 2 },

  footer: { position: 'absolute', bottom: 24, left: 28, right: 28 },
  footerLogo: { width: 14, height: 14, marginRight: 6 },
  footerText: { fontSize: 8.5, color: '#666', textAlign: 'center' }
});

const safe = (v) => (v == null ? '' : String(v));
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString('es-VE', { maximumFractionDigits: 2 })
    : safe(v);
};

const toAbsolute = (u) => {
  if (!u) return '';
  try {
    const origin = (globalThis?.location?.origin) || '';
    return new URL(u, origin).toString();
  } catch { return u; }
};
const withBuster = (u) => !u ? '' : `${u}${u.includes('?') ? '&' : '?'}cb=${Date.now()}`;

export function ProductorFichaPDF({ productor, propiedades = [], logoUrl = img.logoInsai }) {
  const headerLogo = toAbsolute(withBuster(logoUrl));
  const footerLogo = toAbsolute(withBuster(img.sicic5));

  // Totales globales de cultivos (sumando todas las propiedades)
  const globalCultivos = {};
  propiedades.forEach(p => {
    (p.cultivos || []).forEach(c => {
      const key = c.nombre || c.id;
      if (!globalCultivos[key]) globalCultivos[key] = { superficie: 0, cantidad: 0, nombre: c.nombre || key };
      globalCultivos[key].superficie += Number(c.superficie || 0);
      globalCultivos[key].cantidad += Number(c.cantidad || 0);
    });
  });
  const cultivosGlobalArr = Object.values(globalCultivos).sort((a,b)=>a.nombre.localeCompare(b.nombre));
  const totalGlobalSup = cultivosGlobalArr.reduce((a,x)=>a+x.superficie,0);
  const totalGlobalCant = cultivosGlobalArr.reduce((a,x)=>a+x.cantidad,0);

  return (
    <Document
      title={`Ficha del Productor ${safe(productor?.codigo || productor?.cedula || productor?.id)}`}
      author="SISIC • INSAI"
      subject="Ficha del Productor"
      keywords="SISIC, INSAI, Productor, Propiedad, Cultivos"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src={headerLogo} cache={false} key={headerLogo} />
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Ficha de Productor</Text>
            <Text style={styles.sub}>Generada: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Datos Productor */}
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
              <Text style={styles.gridValue}>{num(productor?.total_propiedades)}</Text>
            </View>
          </View>
        </View>

        {/* Propiedades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propiedades</Text>
          {Array.isArray(propiedades) && propiedades.length > 0 ? (
            <View style={styles.propertyList}>
              {propiedades.map((p) => {
                const cultivos = Array.isArray(p.cultivos) ? p.cultivos : [];
                const totalSup = cultivos.reduce((a,x)=>a+Number(x.superficie||0),0);
                const totalCant = cultivos.reduce((a,x)=>a+Number(x.cantidad||0),0);
                return (
                  <View key={p.id} style={styles.propertyCard}>
                    <View style={styles.propHeader}>
                      <Text style={styles.propTitle}>{`Propiedad ${safe(p.codigo)} — ${safe(p.nombre)}`}</Text>
                      <Text style={styles.propMeta}>
                        {[ p.rif ? `RIF: ${safe(p.rif)}` : '', p.tipo ? `Tipo: ${safe(p.tipo)}` : '' ]
                          .filter(Boolean).join('  •  ')}
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
                          <Text style={styles.gridLabel}>Referencia</Text>
                          <Text style={styles.gridValue}>{safe(p.sitios_asociados)}</Text>
                        </View>
                      ) : null}
                      {p.estado_propiedad ? (
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Estatus</Text>
                          <Text style={styles.gridValue}>{safe(p.estado_propiedad)}</Text>
                        </View>
                      ) : null}
                      {p.ubicacion ? (
                        <View style={styles.gridItemFull}>
                          <Text style={styles.gridLabel}>Ubicación</Text>
                          <Text style={styles.gridValue}>{safe(p.ubicacion)}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Tabla Cultivos por Propiedad */}
                    <View style={styles.cultivosWrapper}>
                      <Text style={styles.cultivosTitle}>Cultivos con superficie y cantidad</Text>
                      <View style={styles.cultivosTable}>
                        <View style={styles.cRow}>
                          <View style={styles.cCellHead}><Text style={styles.cCellHeadText}>Cultivo</Text></View>
                          <View style={styles.cCellHead}><Text style={styles.cCellHeadText}>Superficie</Text></View>
                          <View style={[styles.cCellHead, styles.cCellLast]}><Text style={styles.cCellHeadText}>Cantidad</Text></View>
                        </View>
                        {cultivos.length === 0 ? (
                          <Text style={styles.cMuted}>Sin cultivos registrados</Text>
                        ) : (
                          cultivos.map(c => (
                          <View key={c.id} style={styles.cRow}>
                            <View style={styles.cCell}><Text style={styles.cCellText}>{safe(c.nombre)}</Text></View>
                            <View style={styles.cCell}>
                              <Text style={styles.cCellText}>
                                {num(c.superficie)} {c.superficie_unidad || ''}
                              </Text>
                            </View>
                            <View style={[styles.cCell, styles.cCellLast]}>
                              <Text style={styles.cCellText}>
                                {num(c.cantidad)} {c.cantidad_unidad || ''}
                              </Text>
                            </View>
                          </View>
                        ))
                        )}
                      </View>
                      {/* Totales */}
                      <View style={styles.totalesBar}>
                        <Text style={styles.totLabel}>Totales de la propiedad</Text>
                        <Text style={styles.totValue}>{`Sup: ${num(totalSup)}`}</Text>
                        <Text style={styles.totValue}>{`Cant: ${num(totalCant)}`}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ fontSize: 9, color: '#666' }}>Sin propiedades registradas</Text>
          )}
        </View>

        {/* Resumen Global Cultivos (si hay más de una propiedad) */}
        {cultivosGlobalArr.length > 0 && (
          <View style={styles.globalResumen}>
            <Text style={styles.globalTitle}>Resumen Global de Cultivos</Text>
            {cultivosGlobalArr.map(c => (
              <Text key={c.nombre} style={styles.globalLine}>
                {`${c.nombre}: Sup ${num(c.superficie)} • Cant ${num(c.cantidad)}`}
              </Text>
            ))}
            <Text style={[styles.globalLine, { fontWeight: 700, marginTop: 2 }]}>
              {`Totales Generales → Superficie: ${num(totalGlobalSup)}  •  Cantidad: ${num(totalGlobalCant)}`}
            </Text>
          </View>
        )}

        {/* Footer */}
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