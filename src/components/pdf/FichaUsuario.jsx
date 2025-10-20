import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../image/image'; // Asegúrate que logo.logoInsai y logo.sicic5 estén aquí

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: '#222' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1 solid #98c79a', paddingBottom: 8, marginBottom: 12 },
  logo: { width: 64, height: 64, objectFit: 'contain' },
  titleWrap: { textAlign: 'right' },
  title: { fontSize: 16, fontWeight: 700 },
  sub: { fontSize: 10, color: '#666' },
  section: { marginTop: 8, paddingTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#4b5', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%', paddingRight: 8, marginBottom: 4 },
  gridLabel: { fontSize: 9, color: '#666' },
  gridValue: { fontSize: 10, color: '#222' },
  footer: { position: 'absolute', bottom: 24, left: 28, right: 28 },
  footerLogo: { width: 18, height: 18, marginRight: 6 },
  footerText: { fontSize: 9, color: '#666', textAlign: 'center' }
});

const safe = (v) => (v == null ? '' : String(v));

export function FichaUsuarioPDF({ usuario }) {
  const headerLogo = logo.logoInsai;
  const footerLogo = logo.sicic5;

  return (
    <Document
      title={`Ficha del Usuario ${safe(usuario?.username || usuario?.cedula || usuario?.id)}`}
      author="SISIC • INSAI"
      subject="Ficha del Usuario"
      keywords="SISIC, INSAI, Usuario"
    >
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image style={styles.logo} src={headerLogo} cache={false} key={headerLogo} />
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Ficha de Usuario</Text>
            <Text style={styles.sub}>Generada: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Datos personales y laborales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Personales y Laborales</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Nombre</Text>
              <Text style={styles.gridValue}>{safe(usuario?.nombre)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Apellido</Text>
              <Text style={styles.gridValue}>{safe(usuario?.apellido)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Cédula</Text>
              <Text style={styles.gridValue}>{safe(usuario?.cedula)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Cargo</Text>
              <Text style={styles.gridValue}>{safe(usuario?.cargo)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Contacto</Text>
              <Text style={styles.gridValue}>{safe(usuario?.contacto)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Fecha de ingreso</Text>
              <Text style={styles.gridValue}>
                {usuario?.fecha_ingreso
                  ? new Date(usuario.fecha_ingreso).toLocaleDateString('es-ES')
                  : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Datos de usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de Usuario</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Usuario</Text>
              <Text style={styles.gridValue}>{safe(usuario?.username)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Correo</Text>
              <Text style={styles.gridValue}>{safe(usuario?.email)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Rol</Text>
              <Text style={styles.gridValue}>{safe(usuario?.rol)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Estado</Text>
              <Text style={styles.gridValue}>{usuario?.usuario_estado ? 'Activo' : 'Inactivo'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Fecha de creación</Text>
              <Text style={styles.gridValue}>
                {usuario?.usuario_creado
                  ? new Date(usuario.usuario_creado).toLocaleDateString('es-ES')
                  : '—'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Último acceso</Text>
              <Text style={styles.gridValue}>
                {usuario?.ultimo_acceso
                  ? new Date(usuario.ultimo_acceso).toLocaleString('es-ES')
                  : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Historial de actividad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Actividad Reciente</Text>
          {usuario?.historial && usuario.historial.length > 0 ? (
            usuario.historial.slice(0, 10).map((h, idx) => (
              <View key={idx} style={{ marginBottom: 2 }}>
                <Text>
                  {h.accion} en {h.tabla}: {h.descripcion} (
                  {h.fecha
                    ? new Date(h.fecha).toLocaleString('es-ES')
                    : '—'}
                  )
                </Text>
              </View>
            ))
          ) : (
            <Text>No hay actividad reciente.</Text>
          )}
        </View>

        {/* Últimas sesiones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos Accesos</Text>
          {usuario?.sesiones && usuario.sesiones.length > 0 ? (
            usuario.sesiones.slice(0, 5).map((s, idx) => (
              <View key={idx} style={{ marginBottom: 2 }}>
                <Text>
                  Inicio: {s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleString('es-ES') : '—'}
                  {s.fecha_fin && ` | Fin: ${new Date(s.fecha_fin).toLocaleString('es-ES')}`}
                  {s.ip && ` | IP: ${s.ip}`}
                </Text>
              </View>
            ))
          ) : (
            <Text>No hay registros de sesiones.</Text>
          )}
        </View>

        {/* Footer con logo y fecha */}
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

// Utilidad para blob
import { pdf } from '@react-pdf/renderer';
export async function buildUsuarioFichaBlob({ usuario }) {
  const doc = <FichaUsuarioPDF usuario={usuario} />;
  return await pdf(doc).toBlob();
}

export default FichaUsuarioPDF;