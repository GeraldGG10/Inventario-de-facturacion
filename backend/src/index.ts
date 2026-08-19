import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { usuariosRouter } from './routes/usuarios';
import { rolesRouter } from './routes/roles';
import { auditoriaRouter } from './routes/auditoria';
import { dashboardRouter } from './routes/dashboard';
import { categoriasRouter } from './routes/categorias';
import { ubicacionesRouter } from './routes/ubicaciones';
import { proveedoresRouter } from './routes/proveedores';
import { productosRouter } from './routes/productos';
import { movimientosRouter } from './routes/movimientos';
import { alertasRouter } from './routes/alertas';
import { entradasRouter } from './routes/entradas';
import { clientesRouter } from './routes/clientes';
import { facturasRouter } from './routes/facturas';
import { reportesRouter } from './routes/reportes';
import { configuracionRouter } from './routes/configuracion';
import { iniciarRespaldoAutomatico } from './services/backup';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRouter);
app.use('/usuarios', usuariosRouter);
app.use('/roles', rolesRouter);
app.use('/auditoria', auditoriaRouter);
app.use('/dashboard', dashboardRouter);
app.use('/categorias', categoriasRouter);
app.use('/ubicaciones', ubicacionesRouter);
app.use('/proveedores', proveedoresRouter);
app.use('/productos', productosRouter);
app.use('/movimientos', movimientosRouter);
app.use('/alertas', alertasRouter);
app.use('/entradas', entradasRouter);
app.use('/clientes', clientesRouter);
app.use('/facturas', facturasRouter);
app.use('/reportes', reportesRouter);
app.use('/configuracion', configuracionRouter);

app.listen(env.port, () => {
  console.log(`Backend escuchando en http://localhost:${env.port}`);
  iniciarRespaldoAutomatico().catch((error) => console.error('No se pudo iniciar el respaldo automático:', error));
});
