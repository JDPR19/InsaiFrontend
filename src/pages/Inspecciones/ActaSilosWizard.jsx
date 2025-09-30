import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../utils/constans';
import { useNotification } from '../../utils/NotificationContext';
import styles from './inspecciones.module.css';

const FIELDS = [
  { key: 'tipo_evento', label: 'Tipo de evento', type: 'select', options: [
    { value: '0', label: 'Plagas comunes' },
    { value: '1', label: 'Presuntivo' },
    { value: '2', label: 'Plaga cuarentenaria' },
    { value: '3', label: 'Sin Novedad' },
  ]},
  { key: 'clasificacion_anterior', label: 'Clasificación anterior', type: 'text' },
  { key: 'registro_notificacion', label: 'Registro de notificación', type: 'text' },
  { key: 'fecha_notificacion', label: 'Fecha de notificación', type: 'date' },
  { key: 'fecha_inspeccion', label: 'Fecha de la inspección', type: 'date' },
  { key: 'semana_epid', label: 'Semana epid.', type: 'text', placeholder: 'IYYY-IW' },
  { key: 'estado', label: 'Estado', type: 'text' },
  { key: 'municipio', label: 'Municipio', type: 'text' },
  { key: 'parroquia', label: 'Parroquia', type: 'text' },
  { key: 'sector', label: 'Sector', type: 'text' },
  { key: 'lugar_inspeccion', label: 'Lugar de inspección (Silos/Almacenes/Depósitos)', type: 'text' },
  { key: 'empresa_nombre', label: 'Nombre de la empresa inspeccionada', type: 'text' },
  { key: 'rif', label: 'RIF', type: 'text' },
  { key: 'rubro_producto', label: 'Rubro o producto', type: 'text' },
  { key: 'cantidad_total', label: 'Cantidad total de producto', type: 'number' },
  { key: 'unidad_medida', label: 'Unidad de medida', type: 'select', options: [
    { value: 't', label: 't' }, { value: 'kg', label: 'kg' }, { value: 'plantas', label: 'plantas' }
  ]},
  { key: 'cant_nac_import', label: 'Cant. producto nacional o importado', type: 'text' },
  { key: 'cant_afectado', label: 'Cantidad producto afectado', type: 'number' },
  { key: 'plagas_enfermedades', label: 'Plagas o enfermedades', type: 'textarea' },
  { key: 'responsable_empresa', label: 'Responsable de la empresa', type: 'text' },
  { key: 'responsable_ci', label: 'C.I.', type: 'text' },
  { key: 'responsable_telefono', label: 'Teléfono', type: 'text' },
  { key: 'medidas_recomendadas', label: 'Medidas recomendadas', type: 'textarea' },
  { key: 'certificado_fitosanitario', label: 'Posee certificado fitosanitario', type: 'select', options: [
    { value: 'Si', label: 'Sí' }, { value: 'No', label: 'No' }
  ]},
  { key: 'fecha_proxima_visita', label: 'Fecha próxima visita', type: 'date' },
  { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  { key: 'tecnico_responsable', label: 'Técnico responsable de la inspección', type: 'text' },
  { key: 'tecnico_telefono', label: 'Número de teléfono del técnico', type: 'text' },
  // metadatos visibles en PDF
  { key: 'codigo_inspeccion', label: 'Código de inspección', type: 'text' },
  { key: 'n_control', label: 'N° Control', type: 'text' },
  { key: 'ubicacion', label: 'Ubicación (texto)', type: 'text' },
  { key: 'finalidades', label: 'Finalidades', type: 'textarea' },
];

export default function ActaSilosWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [checked, setChecked] = useState({});

  const allKeys = useMemo(() => FIELDS.map(f => f.key), []);
  const seleccion = useMemo(() => allKeys.filter(k => checked[k]), [allKeys, checked]);

  const fetchPrefill = async () => {
    setLoading(true);
    try {
      // 1) intenta cargar acta guardada
      const saved = await axios
        .get(`${BaseUrl}/reportes/acta/silos/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(r => r.data)
        .catch(() => null);

      if (saved?.acta) {
        setData(saved.acta.data || {});
        const prechecked = {};
        (saved.acta.seleccion || []).forEach(k => prechecked[k] = true);
        setChecked(prechecked);
      } else {
        // 2) si no hay guardado, usa prefill
        const res = await axios.get(`${BaseUrl}/reportes/acta/silos/prefill/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const prefill = res.data?.prefill || {};
        setData(prefill);
        const prechecked = {};
        allKeys.forEach(k => { prechecked[k] = true; });
        setChecked(prechecked);
      }
    } catch (e) {
      console.error(e);
      addNotification('No se pudo cargar el acta/prefill', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrefill(); /* eslint-disable-next-line */ }, [id]);

  const toggleAll = (value) => {
    const next = {};
    allKeys.forEach(k => { next[k] = value; });
    setChecked(next);
  };

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const guardar = async () => {
    try {
      setLoading(true);
      const propiedad_id = data.propiedad_id || null; // viene del prefill si el backend lo envía
      const body = { inspeccion_id: Number(id), propiedad_id, seleccion, data };
      const res = await axios.post(`${BaseUrl}/reportes/acta/silos`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      addNotification('Acta guardada', 'success');
      if (!data.propiedad_id && res.data?.acta?.propiedad_id) {
        setData(prev => ({ ...prev, propiedad_id: res.data.acta.propiedad_id }));
      }
    } catch (e) {
      console.error(e);
      addNotification('No se pudo guardar el acta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = async () => {
    if (seleccion.length === 0) {
      addNotification('Selecciona al menos un campo', 'warning');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${BaseUrl}/reportes/acta/silos/pdf`, {
        inspeccion_id: Number(id),
        seleccion,
        data
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error(e);
      addNotification('No se pudo generar el PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <button className={styles.btn} onClick={() => navigate(-1)}>← Volver</button>
        <div className={styles.title}>Acta de Inspección · Silos y Almacenes</div>
        <div className={styles.meta}>
          {data.codigo_inspeccion ? `Código: ${data.codigo_inspeccion}` : ''} {data.n_control ? `· N° Control: ${data.n_control}` : ''}
        </div>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.btn} onClick={() => toggleAll(true)} disabled={loading}>Seleccionar todo</button>
        <button className={styles.btn} onClick={() => toggleAll(false)} disabled={loading}>Desmarcar todo</button>
        <button className={styles.btn} onClick={guardar} disabled={loading}>Guardar</button>
        <button className={styles.btnPrimary} disabled={loading} onClick={generarPDF}>
          {loading ? 'Generando...' : 'Generar PDF'}
        </button>
      </div>

      <div className={styles.grid}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Campos del reporte</div>
          <ul className={styles.checklist}>
            {FIELDS.map(f => (
              <li key={f.key}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={!!checked[f.key]}
                    onChange={(e) => setChecked(prev => ({ ...prev, [f.key]: e.target.checked }))}
                  />
                  {f.label}
                </label>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.form}>
          <div className={styles.formGrid}>
            {FIELDS.map(field => (
              <div key={field.key} className={`${styles.formGroup} ${!checked[field.key] ? styles.disabled : ''}`}>
                <label className={styles.label}>{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className={styles.input}
                    value={data[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    disabled={!checked[field.key] || loading}
                  >
                    <option value="">— Selecciona —</option>
                    {(field.options || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className={styles.textarea}
                    value={data[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder || ''}
                    disabled={!checked[field.key] || loading}
                  />
                ) : (
                  <input
                    className={styles.input}
                    type={field.type || 'text'}
                    value={data[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder || ''}
                    disabled={!checked[field.key] || loading}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}