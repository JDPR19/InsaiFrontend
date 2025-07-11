import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './utils/instanceSession';
import { useNotification } from './utils/useNotification';
import Notification from './components/notification/Notification';
import { setGlobalNotification } from './utils/globalNotification';
import AutoLogout from './components/autoLogout/AutoLogout';
import MainLayout from './components/Layouts/MainLayout';
import Error from './pages/Error/Error';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Empleados from './pages/Empleados/Empleados';
import Usuarios from './pages/Usuario/Usuario';
import Productor from './pages/Productor/Productor';
import TipoProductor from './pages/Productor/Tipo_productor';
import Bitacora from './pages/Bitacora/Bitacora';
import Cultivo from './pages/Cultivo/Cultivo';
import TipoCultivo from './pages/Cultivo/TipoCultivo';
import Propiedad from './pages/Propiedad/Propiedad';
import Solicitud from './pages/Solicitud/Solicitud';
import Inspecciones from './pages/Inspecciones/Inspecciones';
import Inspecciones_silos from './pages/Inspecciones/Inspecciones_silo';
import Plagas from './pages/Plagas/Plagas';
import TipoPlaga from './pages/Plagas/TipoPlaga';
import Programas from './pages/Programas/Programas';
import TipoPrograma from './pages/Programas/TipoPrograma';
import TipoPermiso from './pages/Permiso/TipoPermiso';
import Permisos from './pages/Permiso/Permisos';
import TipoEvento from  './pages/Inspecciones/TipoEvento';
import TipoInspeccion from './pages/Inspecciones/TipoInspeccion';
import Laboratorio from './pages/Labotario/Laboratorio';
import TipoLaboratorio from './pages/Labotario/TipoLaboratorio';
import TipoPropiedad from './pages/Propiedad/TipoPropiedad'; 
import Estados from './pages/Ubicacion/Estados';
import Municipios from './pages/Ubicacion/Municipio';
import Parroquias from './pages/Ubicacion/Parroquia';
import Sector from './pages/Ubicacion/Sector';
import Cargo from './pages/Cargo/Cargo';
import TipoUsuario from './pages/Usuario/TipoUsuario';
import Planificacion from './pages/Planificacion/Planificacion';
import MuestraPlaga from './pages/MuestraPlaga/MuestraPlaga';
import TipoSolicitud from './pages/Solicitud/TipoSolicitud';
import MiUsuario from './pages/Miusuario/MiUsuario';
import ProtectedRoute from './ProtectedRoute';
import MaestroProductorPropiedad from './pages/MaestroProductorPropiedad/MaestroProductorPropiedad';

function App() {

    const { addNotification, notifications, removeNotification } = useNotification();

  React.useEffect(() => {
    setGlobalNotification(addNotification);
  }, [addNotification]);

  return (
      <>
      {/* Notificaciones siempre visibles */}
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
    <BrowserRouter>
        <AutoLogout />
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas con permisos */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute pantalla="home">
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
        path="/Maestro" 
        element={
          <MainLayout> 
            <MaestroProductorPropiedad />
          </MainLayout>
        } />
        <Route
          path="/MiUsuario"
          element={
            <ProtectedRoute pantalla="miusuario">
              <MainLayout>
                <MiUsuario />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Empleados"
          element={
            <ProtectedRoute pantalla="empleados">
              <MainLayout>
                <Empleados />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Usuario"
          element={
            <ProtectedRoute pantalla="usuarios">
              <MainLayout>
                <Usuarios />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Bitacora"
          element={
            <ProtectedRoute pantalla="bitacora">
              <MainLayout>
                <Bitacora />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Productor"
          element={
            <ProtectedRoute pantalla="productor">
              <MainLayout>
                <Productor />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Propiedad"
          element={
            <ProtectedRoute pantalla="propiedad">
              <MainLayout>
                <Propiedad />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Cultivo"
          element={
            <ProtectedRoute pantalla="cultivo">
              <MainLayout>
                <Cultivo />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Solicitud"
          element={
            <ProtectedRoute pantalla="solicitud">
              <MainLayout>
                <Solicitud />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Planificacion"
          element={
            <ProtectedRoute pantalla="planificacion">
              <MainLayout>
                <Planificacion />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/MuestraPlaga"
          element={
            <ProtectedRoute pantalla="muestras">
              <MainLayout>
                <MuestraPlaga />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Inspecciones"
          element={
            <ProtectedRoute pantalla="inspeccion_est">
              <MainLayout>
                <Inspecciones />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/InspeccionesSilo"
          element={
            <ProtectedRoute pantalla="inspeccion_silo">
              <MainLayout>
                <Inspecciones_silos />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Programas"
          element={
            <ProtectedRoute pantalla="programa">
              <MainLayout>
                <Programas />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Permiso"
          element={
            <ProtectedRoute pantalla="permiso">
              <MainLayout>
                <Permisos />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Laboratorio"
          element={
            <ProtectedRoute pantalla="laboratorio">
              <MainLayout>
                <Laboratorio />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Plagas"
          element={
            <ProtectedRoute pantalla="plaga">
              <MainLayout>
                <Plagas />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoPropiedad"
          element={
            <ProtectedRoute pantalla="tipo_propiedad">
              <MainLayout>
                <TipoPropiedad />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
        path="/TipoSolicitud"
        element={
          <ProtectedRoute pantalla="tipo_solicitud"> 
          <MainLayout>
            <TipoSolicitud/>
          </MainLayout>
          </ProtectedRoute> 
        }/>

        <Route
          path="/TipoProductor"
          element={
            <ProtectedRoute pantalla="tipo_productor">
              <MainLayout>
                <TipoProductor />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoCultivo"
          element={
            <ProtectedRoute pantalla="tipo_cultivo">
              <MainLayout>
                <TipoCultivo />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoEvento"
          element={
            <ProtectedRoute pantalla="tipo_evento">
              <MainLayout>
                <TipoEvento />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoPermiso"
          element={
            <ProtectedRoute pantalla="tipo_permiso">
              <MainLayout>
                <TipoPermiso />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoPrograma"
          element={
            <ProtectedRoute pantalla="tipo_programa">
              <MainLayout>
                <TipoPrograma />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoLaboratorio"
          element={
            <ProtectedRoute pantalla="tipo_laboratorio">
              <MainLayout>
                <TipoLaboratorio />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoInspeccion"
          element={
            <ProtectedRoute pantalla="tipo_inspeccion">
              <MainLayout>
                <TipoInspeccion />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoPlaga"
          element={
            <ProtectedRoute pantalla="tipo_plaga">
              <MainLayout>
                <TipoPlaga />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Estados"
          element={
            <ProtectedRoute pantalla="estado">
              <MainLayout>
                <Estados />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Parroquia"
          element={
            <ProtectedRoute pantalla="parroquia">
              <MainLayout>
                <Parroquias />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Sector"
          element={
            <ProtectedRoute pantalla="sector">
              <MainLayout>
                <Sector />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Municipio"
          element={
            <ProtectedRoute pantalla="municipio">
              <MainLayout>
                <Municipios />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Cargo"
          element={
            <ProtectedRoute pantalla="cargos">
              <MainLayout>
                <Cargo />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/TipoUsuario"
          element={
            <ProtectedRoute pantalla="tipo_usuario">
              <MainLayout>
                <TipoUsuario />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Ruta para manejar errores */}
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>

    </>
  );
}

export default App;