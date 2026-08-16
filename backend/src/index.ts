import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { usuariosRouter } from './routes/usuarios';
import { rolesRouter } from './routes/roles';
import { auditoriaRouter } from './routes/auditoria';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRouter);
app.use('/usuarios', usuariosRouter);
app.use('/roles', rolesRouter);
app.use('/auditoria', auditoriaRouter);

app.listen(env.port, () => {
  console.log(`Backend escuchando en http://localhost:${env.port}`);
});
