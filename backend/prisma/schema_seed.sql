--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alertas_inventario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alertas_inventario (
    id text NOT NULL,
    producto_id text NOT NULL,
    stock_actual integer NOT NULL,
    stock_minimo integer NOT NULL,
    cantidad_sugerida integer NOT NULL,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    fecha_generada timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_atendida timestamp(3) without time zone
);


--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    id text NOT NULL,
    usuario_id text,
    accion text NOT NULL,
    entidad text NOT NULL,
    entidad_id text,
    datos_antes text,
    datos_despues text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    activa boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id text NOT NULL,
    nombre text NOT NULL,
    documento text,
    telefono text,
    correo text,
    direccion text,
    limite_credito double precision,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: configuracion_empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_empresa (
    id text DEFAULT 'default'::text NOT NULL,
    nombre text DEFAULT 'Mi Empresa'::text NOT NULL,
    rnc text,
    telefono text,
    correo text,
    direccion text,
    logo_path text,
    notas_factura text
);


--
-- Name: configuracion_facturacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_facturacion (
    id text DEFAULT 'default'::text NOT NULL,
    serie_factura text DEFAULT 'FAC-'::text NOT NULL,
    impuesto_porcentaje double precision DEFAULT 18 NOT NULL,
    moneda text DEFAULT 'DOP'::text NOT NULL,
    metodos_pago_habilitados text DEFAULT 'efectivo,tarjeta,transferencia,mixto'::text NOT NULL,
    descuento_maximo_sin_aprobar double precision DEFAULT 10 NOT NULL,
    permite_credito boolean DEFAULT false NOT NULL,
    mostrar_desglose_impuesto boolean DEFAULT true NOT NULL
);


--
-- Name: configuracion_inventario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_inventario (
    id text DEFAULT 'default'::text NOT NULL,
    stock_minimo_default integer DEFAULT 5 NOT NULL,
    umbral_stock_bajo_porcentaje integer DEFAULT 30 NOT NULL,
    umbral_stock_critico_porcentaje integer DEFAULT 10 NOT NULL,
    notificar_app boolean DEFAULT true NOT NULL,
    notificar_email boolean DEFAULT false NOT NULL,
    notificar_sms boolean DEFAULT false NOT NULL
);


--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_sistema (
    id text DEFAULT 'default'::text NOT NULL,
    backup_frecuencia_horas integer DEFAULT 24 NOT NULL,
    backup_carpeta text DEFAULT 'backups'::text NOT NULL,
    backup_max_archivos integer DEFAULT 14 NOT NULL
);


--
-- Name: detalle_factura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_factura (
    id text NOT NULL,
    factura_id integer NOT NULL,
    producto_id text NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario double precision NOT NULL,
    costo_unitario double precision NOT NULL,
    descuento_porcentaje double precision DEFAULT 0 NOT NULL,
    subtotal double precision NOT NULL
);


--
-- Name: devoluciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.devoluciones (
    id text NOT NULL,
    factura_id integer NOT NULL,
    usuario_id text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    motivo text NOT NULL
);


--
-- Name: devoluciones_detalle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.devoluciones_detalle (
    id text NOT NULL,
    devolucion_id text NOT NULL,
    producto_id text NOT NULL,
    cantidad_devuelta integer NOT NULL
);


--
-- Name: entradas_mercancia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entradas_mercancia (
    id text NOT NULL,
    proveedor_id text NOT NULL,
    usuario_id text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    observaciones text
);


--
-- Name: entradas_mercancia_detalle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entradas_mercancia_detalle (
    id text NOT NULL,
    entrada_id text NOT NULL,
    producto_id text NOT NULL,
    cantidad integer NOT NULL,
    costo_unitario double precision NOT NULL,
    subtotal double precision NOT NULL
);


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facturas (
    id integer NOT NULL,
    cliente_id text NOT NULL,
    usuario_id text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subtotal double precision NOT NULL,
    descuento_porcentaje double precision DEFAULT 0 NOT NULL,
    descuento_monto double precision DEFAULT 0 NOT NULL,
    impuesto_porcentaje double precision DEFAULT 18 NOT NULL,
    impuesto_monto double precision NOT NULL,
    total double precision NOT NULL,
    metodo_pago text NOT NULL,
    referencia_transferencia text,
    monto_efectivo double precision,
    monto_transferencia double precision,
    estado text DEFAULT 'emitida'::text NOT NULL,
    motivo_anulacion text,
    anulada_en timestamp(3) without time zone,
    anulada_por_id text
);


--
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.facturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimientos_inventario (
    id text NOT NULL,
    producto_id text NOT NULL,
    tipo text NOT NULL,
    cantidad integer NOT NULL,
    stock_anterior integer NOT NULL,
    stock_nuevo integer NOT NULL,
    motivo text,
    referencia text,
    usuario_id text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: permisos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permisos (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text
);


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
    id text NOT NULL,
    codigo text NOT NULL,
    codigo_barras text,
    nombre text NOT NULL,
    descripcion text,
    categoria_id text,
    proveedor_id text,
    ubicacion_id text,
    unidad_medida text DEFAULT 'unidad'::text NOT NULL,
    precio_costo double precision NOT NULL,
    precio_venta double precision NOT NULL,
    stock_actual integer DEFAULT 0 NOT NULL,
    stock_minimo integer DEFAULT 5 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proveedores (
    id text NOT NULL,
    nombre text NOT NULL,
    rnc text,
    tipo text DEFAULT 'empresa'::text NOT NULL,
    contacto_nombre text,
    telefono text,
    correo text,
    direccion text,
    ciudad text,
    categoria text,
    condiciones_pago text DEFAULT 'contado'::text NOT NULL,
    observaciones text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token text NOT NULL,
    usuario_id text NOT NULL,
    revocado boolean DEFAULT false NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: rol_permisos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rol_permisos (
    rol_id text NOT NULL,
    permiso_id text NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id text NOT NULL,
    nombre text NOT NULL
);


--
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ubicaciones (
    id text NOT NULL,
    nombre text NOT NULL,
    activa boolean DEFAULT true NOT NULL
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id text NOT NULL,
    nombre text NOT NULL,
    nombre_usuario text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    rol_id text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    ultimo_acceso timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- Data for Name: alertas_inventario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alertas_inventario (id, producto_id, stock_actual, stock_minimo, cantidad_sugerida, estado, fecha_generada, fecha_atendida) FROM stdin;
\.


--
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auditoria (id, usuario_id, accion, entidad, entidad_id, datos_antes, datos_despues, "timestamp") FROM stdin;
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categorias (id, nombre, descripcion, activa, created_at) FROM stdin;
c25fedc1-04fa-41b5-84fe-d62ce76514c3	Electrónica	\N	t	2026-08-20 15:05:22.299
011a1ff6-b80a-4447-a793-0d3b6e885c23	Suministros	\N	t	2026-08-20 15:05:22.299
a0194ded-4f46-46e0-99ab-ddb787ffae6f	Materiales de Construcción	\N	t	2026-08-20 15:05:22.299
005b2d22-f9e0-48f3-9f7e-c424f39178d9	Mobiliario	\N	t	2026-08-20 15:05:22.299
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes (id, nombre, documento, telefono, correo, direccion, limite_credito, activo, created_at) FROM stdin;
296d0678-85b0-44d7-a579-8cc03ca508e5	Construmart Dominicana S.A.	1-01-85934-2	809-555-0192	\N	\N	500000	t	2026-08-20 15:05:22.421
\.


--
-- Data for Name: configuracion_empresa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuracion_empresa (id, nombre, rnc, telefono, correo, direccion, logo_path, notas_factura) FROM stdin;
default	Mi Empresa	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: configuracion_facturacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuracion_facturacion (id, serie_factura, impuesto_porcentaje, moneda, metodos_pago_habilitados, descuento_maximo_sin_aprobar, permite_credito, mostrar_desglose_impuesto) FROM stdin;
default	FAC-	18	DOP	efectivo,tarjeta,transferencia,mixto	10	f	t
\.


--
-- Data for Name: configuracion_inventario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuracion_inventario (id, stock_minimo_default, umbral_stock_bajo_porcentaje, umbral_stock_critico_porcentaje, notificar_app, notificar_email, notificar_sms) FROM stdin;
default	5	30	10	t	f	f
\.


--
-- Data for Name: configuracion_sistema; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuracion_sistema (id, backup_frecuencia_horas, backup_carpeta, backup_max_archivos) FROM stdin;
default	24	backups	14
\.


--
-- Data for Name: detalle_factura; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.detalle_factura (id, factura_id, producto_id, cantidad, precio_unitario, costo_unitario, descuento_porcentaje, subtotal) FROM stdin;
\.


--
-- Data for Name: devoluciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.devoluciones (id, factura_id, usuario_id, fecha, motivo) FROM stdin;
\.


--
-- Data for Name: devoluciones_detalle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.devoluciones_detalle (id, devolucion_id, producto_id, cantidad_devuelta) FROM stdin;
\.


--
-- Data for Name: entradas_mercancia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entradas_mercancia (id, proveedor_id, usuario_id, fecha, observaciones) FROM stdin;
\.


--
-- Data for Name: entradas_mercancia_detalle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entradas_mercancia_detalle (id, entrada_id, producto_id, cantidad, costo_unitario, subtotal) FROM stdin;
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facturas (id, cliente_id, usuario_id, fecha, subtotal, descuento_porcentaje, descuento_monto, impuesto_porcentaje, impuesto_monto, total, metodo_pago, referencia_transferencia, monto_efectivo, monto_transferencia, estado, motivo_anulacion, anulada_en, anulada_por_id) FROM stdin;
\.


--
-- Data for Name: movimientos_inventario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimientos_inventario (id, producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia, usuario_id, fecha) FROM stdin;
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permisos (id, nombre, descripcion) FROM stdin;
dc601bd8-f152-45ae-ae2c-53761c932eb5	usuarios.administrar	Crear, editar y desactivar usuarios y roles
559c093a-3d7d-41ba-8908-62d75aba84dc	auditoria.ver	Consultar el historial de auditoría
a819a3ac-c4b5-4f7e-8cf3-4578e41e19b5	dashboard.ver	Ver el panel de control y sus métricas
a2b5c604-e7cc-4843-9225-ace679719042	reportes.ver	Consultar reportes de ventas, inventario y finanzas
e1fd1469-9e6d-4dbb-b52f-4e00d40da98d	inventario.ver	Consultar productos e inventario
72483385-ceab-4047-89aa-54e4da2a7a83	inventario.editar	Crear, editar y ajustar productos e inventario
c926f80f-7e4a-4594-a7a7-b65aa2374143	proveedores.administrar	Gestionar proveedores y entradas de mercancía
abac9d3d-b170-43b3-bf83-a870512793ba	factura.crear	Registrar nuevas ventas/facturas
5bb99b1b-aa4e-4c52-8da7-8ad880d0c815	factura.anular	Anular facturas existentes
f3a4263a-9e10-4a04-b8ff-ac4c304653d5	clientes.administrar	Crear y editar clientes
c579d425-de9f-4c3d-8393-f7007280b7c4	configuracion.administrar	Editar configuración de empresa, facturación e inventario
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (id, codigo, codigo_barras, nombre, descripcion, categoria_id, proveedor_id, ubicacion_id, unidad_medida, precio_costo, precio_venta, stock_actual, stock_minimo, activo, created_at, updated_at) FROM stdin;
1aebe68e-ef6e-4aa7-8bfa-dc6a641d6ab7	PRD-001	\N	Laptop Pro X15	\N	c25fedc1-04fa-41b5-84fe-d62ce76514c3	e9e7f2d8-8982-4d0c-8f4b-f35fcab35587	9cd1444c-463f-4182-a88c-5119aa5dbf97	unidad	1100	1499	0	5	t	2026-08-20 15:05:22.412	2026-08-20 15:05:22.412
1411a9e5-63a4-42db-8c2c-705c9546ab73	PRD-002	\N	Cemento Titán Gris 42.5kg	\N	a0194ded-4f46-46e0-99ab-ddb787ffae6f	e9e7f2d8-8982-4d0c-8f4b-f35fcab35587	9cd1444c-463f-4182-a88c-5119aa5dbf97	saco	280	340	120	30	t	2026-08-20 15:05:22.412	2026-08-20 15:05:22.412
701f3b3d-cd24-446a-9f80-e25118cc2576	PRD-003	\N	Varilla Corrugada 3/8"x20'	\N	a0194ded-4f46-46e0-99ab-ddb787ffae6f	e9e7f2d8-8982-4d0c-8f4b-f35fcab35587	9cd1444c-463f-4182-a88c-5119aa5dbf97	unidad	210	265	8	15	t	2026-08-20 15:05:22.412	2026-08-20 15:05:22.412
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proveedores (id, nombre, rnc, tipo, contacto_nombre, telefono, correo, direccion, ciudad, categoria, condiciones_pago, observaciones, activo, created_at) FROM stdin;
e9e7f2d8-8982-4d0c-8f4b-f35fcab35587	Distribuidora Los Andes S.A.	1-01-85934-2	empresa	Jane Doe	809-555-0192	contacto@losandes.example	\N	\N	Suministros de Oficina	contado	\N	t	2026-08-20 15:05:22.408
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, token, usuario_id, revocado, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: rol_permisos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rol_permisos (rol_id, permiso_id) FROM stdin;
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	dc601bd8-f152-45ae-ae2c-53761c932eb5
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	559c093a-3d7d-41ba-8908-62d75aba84dc
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	a819a3ac-c4b5-4f7e-8cf3-4578e41e19b5
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	a2b5c604-e7cc-4843-9225-ace679719042
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	e1fd1469-9e6d-4dbb-b52f-4e00d40da98d
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	72483385-ceab-4047-89aa-54e4da2a7a83
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	c926f80f-7e4a-4594-a7a7-b65aa2374143
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	abac9d3d-b170-43b3-bf83-a870512793ba
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	5bb99b1b-aa4e-4c52-8da7-8ad880d0c815
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	f3a4263a-9e10-4a04-b8ff-ac4c304653d5
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	c579d425-de9f-4c3d-8393-f7007280b7c4
f6ae5d8b-a312-4175-b2da-e17c772a0869	abac9d3d-b170-43b3-bf83-a870512793ba
f6ae5d8b-a312-4175-b2da-e17c772a0869	e1fd1469-9e6d-4dbb-b52f-4e00d40da98d
f6ae5d8b-a312-4175-b2da-e17c772a0869	f3a4263a-9e10-4a04-b8ff-ac4c304653d5
f6ae5d8b-a312-4175-b2da-e17c772a0869	a819a3ac-c4b5-4f7e-8cf3-4578e41e19b5
f6ae5d8b-a312-4175-b2da-e17c772a0869	a2b5c604-e7cc-4843-9225-ace679719042
951370cd-b93b-4cc1-b1a1-075787cffab3	e1fd1469-9e6d-4dbb-b52f-4e00d40da98d
951370cd-b93b-4cc1-b1a1-075787cffab3	72483385-ceab-4047-89aa-54e4da2a7a83
951370cd-b93b-4cc1-b1a1-075787cffab3	c926f80f-7e4a-4594-a7a7-b65aa2374143
951370cd-b93b-4cc1-b1a1-075787cffab3	a819a3ac-c4b5-4f7e-8cf3-4578e41e19b5
951370cd-b93b-4cc1-b1a1-075787cffab3	a2b5c604-e7cc-4843-9225-ace679719042
406a0619-20db-4e9e-b7e9-4fe6e54f3c51	a819a3ac-c4b5-4f7e-8cf3-4578e41e19b5
406a0619-20db-4e9e-b7e9-4fe6e54f3c51	a2b5c604-e7cc-4843-9225-ace679719042
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, nombre) FROM stdin;
13ef79af-cabb-45f1-bc72-f3dfbde4be6e	administrador
f6ae5d8b-a312-4175-b2da-e17c772a0869	cajero
951370cd-b93b-4cc1-b1a1-075787cffab3	almacenista
406a0619-20db-4e9e-b7e9-4fe6e54f3c51	reportes
\.


--
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ubicaciones (id, nombre, activa) FROM stdin;
9cd1444c-463f-4182-a88c-5119aa5dbf97	Almacén Principal	t
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, nombre, nombre_usuario, email, password_hash, rol_id, activo, ultimo_acceso, created_at) FROM stdin;
4e1bc3c1-dcfd-4d22-bf13-18fa6ee638d7	Administrador	admin	admin@facturacion.local	$2b$10$t6ro7l7Dho5HSz43DdN1JOLB.1/szSHuIttTDzomy4CedwIq.Kavi	13ef79af-cabb-45f1-bc72-f3dfbde4be6e	t	\N	2026-08-20 15:05:22.275
\.


--
-- Name: facturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.facturas_id_seq', 1, false);


--
-- Name: alertas_inventario alertas_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas_inventario
    ADD CONSTRAINT alertas_inventario_pkey PRIMARY KEY (id);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: configuracion_empresa configuracion_empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_empresa
    ADD CONSTRAINT configuracion_empresa_pkey PRIMARY KEY (id);


--
-- Name: configuracion_facturacion configuracion_facturacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_facturacion
    ADD CONSTRAINT configuracion_facturacion_pkey PRIMARY KEY (id);


--
-- Name: configuracion_inventario configuracion_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_inventario
    ADD CONSTRAINT configuracion_inventario_pkey PRIMARY KEY (id);


--
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id);


--
-- Name: detalle_factura detalle_factura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_factura
    ADD CONSTRAINT detalle_factura_pkey PRIMARY KEY (id);


--
-- Name: devoluciones_detalle devoluciones_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devoluciones_detalle
    ADD CONSTRAINT devoluciones_detalle_pkey PRIMARY KEY (id);


--
-- Name: devoluciones devoluciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devoluciones
    ADD CONSTRAINT devoluciones_pkey PRIMARY KEY (id);


--
-- Name: entradas_mercancia_detalle entradas_mercancia_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas_mercancia_detalle
    ADD CONSTRAINT entradas_mercancia_detalle_pkey PRIMARY KEY (id);


--
-- Name: entradas_mercancia entradas_mercancia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas_mercancia
    ADD CONSTRAINT entradas_mercancia_pkey PRIMARY KEY (id);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: rol_permisos rol_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_pkey PRIMARY KEY (rol_id, permiso_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: ubicaciones ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT ubicaciones_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: alertas_inventario_producto_id_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alertas_inventario_producto_id_estado_idx ON public.alertas_inventario USING btree (producto_id, estado);


--
-- Name: auditoria_entidad_entidad_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auditoria_entidad_entidad_id_idx ON public.auditoria USING btree (entidad, entidad_id);


--
-- Name: auditoria_usuario_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auditoria_usuario_id_idx ON public.auditoria USING btree (usuario_id);


--
-- Name: categorias_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categorias_nombre_key ON public.categorias USING btree (nombre);


--
-- Name: clientes_documento_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX clientes_documento_key ON public.clientes USING btree (documento);


--
-- Name: detalle_factura_factura_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX detalle_factura_factura_id_idx ON public.detalle_factura USING btree (factura_id);


--
-- Name: detalle_factura_producto_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX detalle_factura_producto_id_idx ON public.detalle_factura USING btree (producto_id);


--
-- Name: facturas_cliente_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facturas_cliente_id_idx ON public.facturas USING btree (cliente_id);


--
-- Name: facturas_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facturas_estado_idx ON public.facturas USING btree (estado);


--
-- Name: facturas_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facturas_fecha_idx ON public.facturas USING btree (fecha);


--
-- Name: movimientos_inventario_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX movimientos_inventario_fecha_idx ON public.movimientos_inventario USING btree (fecha);


--
-- Name: movimientos_inventario_producto_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX movimientos_inventario_producto_id_idx ON public.movimientos_inventario USING btree (producto_id);


--
-- Name: permisos_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permisos_nombre_key ON public.permisos USING btree (nombre);


--
-- Name: productos_categoria_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX productos_categoria_id_idx ON public.productos USING btree (categoria_id);


--
-- Name: productos_codigo_barras_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX productos_codigo_barras_key ON public.productos USING btree (codigo_barras);


--
-- Name: productos_codigo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX productos_codigo_key ON public.productos USING btree (codigo);


--
-- Name: productos_proveedor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX productos_proveedor_id_idx ON public.productos USING btree (proveedor_id);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: roles_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_nombre_key ON public.roles USING btree (nombre);


--
-- Name: ubicaciones_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ubicaciones_nombre_key ON public.ubicaciones USING btree (nombre);


--
-- Name: usuarios_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);


--
-- Name: usuarios_nombre_usuario_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_nombre_usuario_key ON public.usuarios USING btree (nombre_usuario);


--
-- Name: alertas_inventario alertas_inventario_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas_inventario
    ADD CONSTRAINT alertas_inventario_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: auditoria auditoria_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detalle_factura detalle_factura_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_factura
    ADD CONSTRAINT detalle_factura_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: detalle_factura detalle_factura_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_factura
    ADD CONSTRAINT detalle_factura_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: devoluciones_detalle devoluciones_detalle_devolucion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devoluciones_detalle
    ADD CONSTRAINT devoluciones_detalle_devolucion_id_fkey FOREIGN KEY (devolucion_id) REFERENCES public.devoluciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: devoluciones_detalle devoluciones_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devoluciones_detalle
    ADD CONSTRAINT devoluciones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: devoluciones devoluciones_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devoluciones
    ADD CONSTRAINT devoluciones_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: devoluciones devoluciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devoluciones
    ADD CONSTRAINT devoluciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: entradas_mercancia_detalle entradas_mercancia_detalle_entrada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas_mercancia_detalle
    ADD CONSTRAINT entradas_mercancia_detalle_entrada_id_fkey FOREIGN KEY (entrada_id) REFERENCES public.entradas_mercancia(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: entradas_mercancia_detalle entradas_mercancia_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas_mercancia_detalle
    ADD CONSTRAINT entradas_mercancia_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: entradas_mercancia entradas_mercancia_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas_mercancia
    ADD CONSTRAINT entradas_mercancia_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: entradas_mercancia entradas_mercancia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entradas_mercancia
    ADD CONSTRAINT entradas_mercancia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: facturas facturas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: facturas facturas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: movimientos_inventario movimientos_inventario_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: movimientos_inventario movimientos_inventario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: productos productos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: productos productos_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: productos productos_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rol_permisos rol_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rol_permisos rol_permisos_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

