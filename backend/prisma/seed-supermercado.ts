import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Vaciando base de datos...');

  // Orden importa por las FK
  await prisma.devolucionDetalle.deleteMany();
  await prisma.devolucion.deleteMany();
  await prisma.detalleFactura.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.alertaInventario.deleteMany();
  await prisma.movimientoInventario.deleteMany();
  await prisma.entradaMercanciaDetalle.deleteMany();
  await prisma.entradaMercancia.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.ubicacion.deleteMany();
  await prisma.categoria.deleteMany();
  // Mantener roles y usuarios base
  await prisma.auditoria.deleteMany();
  await prisma.refreshToken.deleteMany();
  // Borrar usuarios no admin
  await prisma.usuario.deleteMany({ where: { email: { not: 'admin@facturacion.local' } } });

  console.log('✅ Base de datos vaciada.');

  // ============================================================
  // CONFIGURACIÓN EMPRESA
  // ============================================================
  await prisma.configuracionEmpresa.upsert({
    where: { id: 'default' },
    update: {
      nombre: 'Stocly',
      rnc: '101-23456-7',
      telefono: '809-555-0100',
      correo: 'info@stocly.do',
      direccion: 'Av. 27 de Febrero #45, Santo Domingo, RD',
      notasFactura: 'Gracias por su compra. Conserve su factura. Cambios y devoluciones dentro de 7 días con recibo.',
    },
    create: {
      id: 'default',
      nombre: 'Stocly',
      rnc: '101-23456-7',
      telefono: '809-555-0100',
      correo: 'info@stocly.do',
      direccion: 'Av. 27 de Febrero #45, Santo Domingo, RD',
      notasFactura: 'Gracias por su compra. Conserve su factura. Cambios y devoluciones dentro de 7 días con recibo.',
    },
  });

  // ============================================================
  // CATEGORÍAS (10 categorías de supermercado)
  // ============================================================
  console.log('📦 Creando categorías...');
  const categoriasData = [
    { nombre: 'Lácteos y Huevos', descripcion: 'Leche, queso, yogur, mantequilla y huevos' },
    { nombre: 'Carnes y Embutidos', descripcion: 'Res, cerdo, pollo, salchichas y jamón' },
    { nombre: 'Frutas y Vegetales', descripcion: 'Frutas frescas, verduras y legumbres' },
    { nombre: 'Panadería y Repostería', descripcion: 'Pan, bizcochos, galletas y pasteles' },
    { nombre: 'Bebidas', descripcion: 'Refrescos, jugos, agua y bebidas alcohólicas' },
    { nombre: 'Granos y Cereales', descripcion: 'Arroz, habichuelas, maíz y avena' },
    { nombre: 'Enlatados y Conservas', descripcion: 'Atún, sardinas, tomates y salsas' },
    { nombre: 'Limpieza e Higiene', descripcion: 'Detergentes, jabones, desinfectantes y papel' },
    { nombre: 'Snacks y Dulces', descripcion: 'Papas fritas, chocolates, caramelos y galletas' },
    { nombre: 'Congelados', descripcion: 'Pizzas, nuggets, mariscos y postres congelados' },
  ];

  const categorias = await Promise.all(
    categoriasData.map(c => prisma.categoria.create({ data: c }))
  );

  // ============================================================
  // UBICACIONES
  // ============================================================
  const ubicacionesData = ['Pasillo A', 'Pasillo B', 'Pasillo C', 'Refrigeración', 'Congelados', 'Bodega'];
  const ubicaciones = await Promise.all(
    ubicacionesData.map(nombre => prisma.ubicacion.create({ data: { nombre } }))
  );

  // ============================================================
  // PROVEEDORES (30)
  // ============================================================
  console.log('🏭 Creando proveedores...');
  const proveedoresData = [
    { nombre: 'Lácteos Don Santiago, SRL', rnc: '101-11111-1', telefono: '809-221-1001', correo: 'ventas@lacsantiago.do', ciudad: 'La Vega', categoria: 'Lácteos' },
    { nombre: 'Distribuidora Pollo Rey', rnc: '101-22222-2', telefono: '809-221-1002', correo: 'pedidos@pollorey.do', ciudad: 'Santo Domingo', categoria: 'Carnes' },
    { nombre: 'Agropecuaria Los Pinos', rnc: '101-33333-3', telefono: '809-221-1003', correo: 'info@lospinos.do', ciudad: 'Constanza', categoria: 'Frutas y Vegetales' },
    { nombre: 'Panadería Industrial El Trigo', rnc: '101-44444-4', telefono: '809-221-1004', correo: 'ventas@eltrigo.do', ciudad: 'Santiago', categoria: 'Panadería' },
    { nombre: 'Industrias Agua Fuente Clara', rnc: '101-55555-5', telefono: '809-221-1005', correo: 'info@fuenteclara.do', ciudad: 'Santo Domingo', categoria: 'Bebidas' },
    { nombre: 'Arrocera Nacional Dominicana', rnc: '101-66666-6', telefono: '809-221-1006', correo: 'pedidos@arroceranacional.do', ciudad: 'Barahona', categoria: 'Granos' },
    { nombre: 'Conservas del Caribe, SA', rnc: '101-77777-7', telefono: '809-221-1007', correo: 'ventas@ccaribecons.do', ciudad: 'San Pedro de Macorís', categoria: 'Enlatados' },
    { nombre: 'Procter & Gamble Dominicana', rnc: '101-88888-8', telefono: '809-221-1008', correo: 'info@pgdo.com', ciudad: 'Santo Domingo', categoria: 'Limpieza' },
    { nombre: 'Snacks & Fun Corp', rnc: '101-99999-9', telefono: '809-221-1009', correo: 'pedidos@snacksfun.do', ciudad: 'Santo Domingo', categoria: 'Snacks' },
    { nombre: 'Frío Express Dominicano', rnc: '101-10101-0', telefono: '809-221-1010', correo: 'ventas@frioexpress.do', ciudad: 'Santo Domingo', categoria: 'Congelados' },
    { nombre: 'Cervecería Nacional Dominicana', rnc: '101-12121-2', telefono: '809-221-1011', correo: 'info@cerveceria.do', ciudad: 'Santo Domingo', categoria: 'Bebidas' },
    { nombre: 'Industrias San Miguel, SRL', rnc: '101-13131-3', telefono: '809-221-1012', correo: 'ventas@sanmiguelrd.do', ciudad: 'Santiago', categoria: 'Granos' },
    { nombre: 'Empacadora Caribeña de Carnes', rnc: '101-14141-4', telefono: '809-221-1013', correo: 'pedidos@empacaribe.do', ciudad: 'La Romana', categoria: 'Carnes' },
    { nombre: 'Distribuidora Néstle Dominicana', rnc: '101-15151-5', telefono: '809-221-1014', correo: 'info@nestle.do', ciudad: 'Santo Domingo', categoria: 'Lácteos' },
    { nombre: 'Coca-Cola FEMSA Dominicana', rnc: '101-16161-6', telefono: '809-221-1015', correo: 'pedidos@cocacolado.com', ciudad: 'Santo Domingo', categoria: 'Bebidas' },
    { nombre: 'Colgate-Palmolive Dominicana', rnc: '101-17171-7', telefono: '809-221-1016', correo: 'info@colgate.do', ciudad: 'Santo Domingo', categoria: 'Higiene' },
    { nombre: 'Importadora Goya Foods', rnc: '101-18181-8', telefono: '809-221-1017', correo: 'ventas@goyardo.com', ciudad: 'Santo Domingo', categoria: 'Enlatados' },
    { nombre: 'Fermentados del Norte, SRL', rnc: '101-19191-9', telefono: '809-221-1018', correo: 'info@fermenorte.do', ciudad: 'Moca', categoria: 'Bebidas' },
    { nombre: 'Frigorífico El Rancho', rnc: '101-20202-0', telefono: '809-221-1019', correo: 'pedidos@elrancho.do', ciudad: 'Azua', categoria: 'Carnes' },
    { nombre: 'Harinera Dominicana, SA', rnc: '101-21212-1', telefono: '809-221-1020', correo: 'ventas@haridom.do', ciudad: 'Santo Domingo', categoria: 'Granos' },
    { nombre: 'Azucarera Central Romana', rnc: '101-22232-2', telefono: '809-221-1021', correo: 'info@centralromana.do', ciudad: 'La Romana', categoria: 'Granos' },
    { nombre: 'Productos Mars Dominicana', rnc: '101-23232-3', telefono: '809-221-1022', correo: 'pedidos@mars.do', ciudad: 'Santo Domingo', categoria: 'Snacks' },
    { nombre: 'Hershey\'s Caribe Ltd.', rnc: '101-24242-4', telefono: '809-221-1023', correo: 'info@hersheys.do', ciudad: 'Santo Domingo', categoria: 'Snacks' },
    { nombre: 'Distribuidora Kellogg\'s RD', rnc: '101-25252-5', telefono: '809-221-1024', correo: 'ventas@kelloggs.do', ciudad: 'Santo Domingo', categoria: 'Cereales' },
    { nombre: 'Granja Avícola El Paraíso', rnc: '101-26262-6', telefono: '809-221-1025', correo: 'pedidos@elparaiso.do', ciudad: 'Bonao', categoria: 'Lácteos y Huevos' },
    { nombre: 'Importadora de Atún Prestige', rnc: '101-27272-7', telefono: '809-221-1026', correo: 'ventas@atunprestige.do', ciudad: 'Santo Domingo', categoria: 'Enlatados' },
    { nombre: 'Empresa de Papel Dominicana', rnc: '101-28282-8', telefono: '809-221-1027', correo: 'info@papeldo.do', ciudad: 'Santiago', categoria: 'Higiene' },
    { nombre: 'Helados & Postres Bon', rnc: '101-29292-9', telefono: '809-221-1028', correo: 'pedidos@helados bon.do', ciudad: 'Santo Domingo', categoria: 'Congelados' },
    { nombre: 'Aceitera Dominicana Rica', rnc: '101-30303-0', telefono: '809-221-1029', correo: 'ventas@aceitericado.do', ciudad: 'Santo Domingo', categoria: 'Granos' },
    { nombre: 'Farmacéutica Don René', rnc: '101-31313-1', telefono: '809-221-1030', correo: 'info@donrene.do', ciudad: 'Santiago', categoria: 'Higiene' },
  ];

  const proveedores = await Promise.all(
    proveedoresData.map(p => prisma.proveedor.create({ data: { ...p, condicionesPago: 'credito_30' } }))
  );

  // ============================================================
  // PRODUCTOS (30 productos reales de supermercado)
  // ============================================================
  console.log('🛒 Creando productos...');
  const productosData = [
    // Lácteos
    { codigo: 'LAC-001', nombre: 'Leche Entera Pasteurizada 1L', categoriaIdx: 0, proveedorIdx: 0, ubicacionIdx: 3, precioCosto: 55, precioVenta: 75, stock: 120, stockMin: 30 },
    { codigo: 'LAC-002', nombre: 'Queso Amarillo Laminado 200g', categoriaIdx: 0, proveedorIdx: 13, ubicacionIdx: 3, precioCosto: 95, precioVenta: 135, stock: 80, stockMin: 20 },
    { codigo: 'LAC-003', nombre: 'Yogur Natural Fresa 200ml', categoriaIdx: 0, proveedorIdx: 0, ubicacionIdx: 3, precioCosto: 42, precioVenta: 65, stock: 60, stockMin: 15 },
    // Carnes
    { codigo: 'CAR-001', nombre: 'Pechuga de Pollo al Peso (lb)', categoriaIdx: 1, proveedorIdx: 1, ubicacionIdx: 3, precioCosto: 95, precioVenta: 135, stock: 150, stockMin: 40 },
    { codigo: 'CAR-002', nombre: 'Salchichón Champions 200g', categoriaIdx: 1, proveedorIdx: 12, ubicacionIdx: 0, precioCosto: 115, precioVenta: 160, stock: 45, stockMin: 10 },
    { codigo: 'CAR-003', nombre: 'Jamón de Pavo Rebanado 250g', categoriaIdx: 1, proveedorIdx: 12, ubicacionIdx: 3, precioCosto: 145, precioVenta: 195, stock: 35, stockMin: 10 },
    // Frutas y Vegetales
    { codigo: 'FRU-001', nombre: 'Plátano Maduro (lb)', categoriaIdx: 2, proveedorIdx: 2, ubicacionIdx: 1, precioCosto: 18, precioVenta: 28, stock: 200, stockMin: 50 },
    { codigo: 'FRU-002', nombre: 'Aguacate Grande', categoriaIdx: 2, proveedorIdx: 2, ubicacionIdx: 1, precioCosto: 35, precioVenta: 55, stock: 80, stockMin: 20 },
    { codigo: 'FRU-003', nombre: 'Tomate Rojo (lb)', categoriaIdx: 2, proveedorIdx: 2, ubicacionIdx: 1, precioCosto: 22, precioVenta: 38, stock: 120, stockMin: 30 },
    // Panadería
    { codigo: 'PAN-001', nombre: 'Pan Bimbo Blanco 680g', categoriaIdx: 3, proveedorIdx: 3, ubicacionIdx: 0, precioCosto: 75, precioVenta: 110, stock: 50, stockMin: 15 },
    { codigo: 'PAN-002', nombre: 'Galletas María 400g', categoriaIdx: 3, proveedorIdx: 3, ubicacionIdx: 0, precioCosto: 55, precioVenta: 80, stock: 70, stockMin: 15 },
    // Bebidas
    { codigo: 'BEB-001', nombre: 'Coca-Cola 2L', categoriaIdx: 4, proveedorIdx: 14, ubicacionIdx: 1, precioCosto: 75, precioVenta: 110, stock: 180, stockMin: 50 },
    { codigo: 'BEB-002', nombre: 'Agua Fuente Clara 1.5L', categoriaIdx: 4, proveedorIdx: 4, ubicacionIdx: 2, precioCosto: 22, precioVenta: 38, stock: 240, stockMin: 60 },
    { codigo: 'BEB-003', nombre: 'Jugo Tampico Tropical 1L', categoriaIdx: 4, proveedorIdx: 4, ubicacionIdx: 1, precioCosto: 55, precioVenta: 80, stock: 90, stockMin: 20 },
    { codigo: 'BEB-004', nombre: 'Presidente Lata 355ml', categoriaIdx: 4, proveedorIdx: 10, ubicacionIdx: 1, precioCosto: 65, precioVenta: 95, stock: 200, stockMin: 50 },
    // Granos
    { codigo: 'GRA-001', nombre: 'Arroz Selecto 5lb', categoriaIdx: 5, proveedorIdx: 5, ubicacionIdx: 2, precioCosto: 155, precioVenta: 215, stock: 350, stockMin: 80 },
    { codigo: 'GRA-002', nombre: 'Habichuelas Negras 1lb', categoriaIdx: 5, proveedorIdx: 11, ubicacionIdx: 2, precioCosto: 42, precioVenta: 65, stock: 180, stockMin: 40 },
    { codigo: 'GRA-003', nombre: 'Aceite Vegetal Rica 1L', categoriaIdx: 5, proveedorIdx: 28, ubicacionIdx: 2, precioCosto: 185, precioVenta: 250, stock: 120, stockMin: 30 },
    { codigo: 'GRA-004', nombre: 'Azúcar Blanca Central 2lb', categoriaIdx: 5, proveedorIdx: 20, ubicacionIdx: 2, precioCosto: 65, precioVenta: 95, stock: 200, stockMin: 50 },
    // Enlatados
    { codigo: 'ENL-001', nombre: 'Atún en Aceite Prestige 160g', categoriaIdx: 6, proveedorIdx: 6, ubicacionIdx: 0, precioCosto: 85, precioVenta: 125, stock: 100, stockMin: 25 },
    { codigo: 'ENL-002', nombre: 'Sardinas en Salsa Tomate 425g', categoriaIdx: 6, proveedorIdx: 25, ubicacionIdx: 0, precioCosto: 72, precioVenta: 105, stock: 75, stockMin: 15 },
    { codigo: 'ENL-003', nombre: 'Pasta de Tomate Goya 240g', categoriaIdx: 6, proveedorIdx: 16, ubicacionIdx: 0, precioCosto: 38, precioVenta: 58, stock: 90, stockMin: 20 },
    // Limpieza e Higiene
    { codigo: 'LIM-001', nombre: 'Detergente Ariel 1kg', categoriaIdx: 7, proveedorIdx: 7, ubicacionIdx: 2, precioCosto: 220, precioVenta: 295, stock: 60, stockMin: 15 },
    { codigo: 'LIM-002', nombre: 'Papel Higiénico Triple Hoja x4', categoriaIdx: 7, proveedorIdx: 26, ubicacionIdx: 2, precioCosto: 85, precioVenta: 125, stock: 80, stockMin: 20 },
    { codigo: 'LIM-003', nombre: 'Jabón de Baño Palmolive 125g', categoriaIdx: 7, proveedorIdx: 15, ubicacionIdx: 2, precioCosto: 32, precioVenta: 50, stock: 120, stockMin: 30 },
    // Snacks
    { codigo: 'SNK-001', nombre: 'Papas Fritas Doritos 150g', categoriaIdx: 8, proveedorIdx: 8, ubicacionIdx: 0, precioCosto: 55, precioVenta: 80, stock: 90, stockMin: 20 },
    { codigo: 'SNK-002', nombre: 'Chocolate M&M\'s 45g', categoriaIdx: 8, proveedorIdx: 21, ubicacionIdx: 0, precioCosto: 48, precioVenta: 70, stock: 80, stockMin: 20 },
    { codigo: 'SNK-003', nombre: 'Hershey\'s Kisses 250g', categoriaIdx: 8, proveedorIdx: 22, ubicacionIdx: 0, precioCosto: 195, precioVenta: 265, stock: 40, stockMin: 10 },
    // Congelados
    { codigo: 'CON-001', nombre: 'Pollo Nuggets McCain 500g', categoriaIdx: 9, proveedorIdx: 9, ubicacionIdx: 4, precioCosto: 285, precioVenta: 385, stock: 45, stockMin: 10 },
    { codigo: 'CON-002', nombre: 'Helado Bon Vainilla 0.5L', categoriaIdx: 9, proveedorIdx: 27, ubicacionIdx: 4, precioCosto: 155, precioVenta: 215, stock: 35, stockMin: 8 },
  ];

  const productos = await Promise.all(
    productosData.map(p =>
      prisma.producto.create({
        data: {
          codigo: p.codigo,
          nombre: p.nombre,
          categoriaId: categorias[p.categoriaIdx].id,
          proveedorId: proveedores[p.proveedorIdx].id,
          ubicacionId: ubicaciones[p.ubicacionIdx].id,
          precioCosto: p.precioCosto,
          precioVenta: p.precioVenta,
          stockActual: p.stock,
          stockMinimo: p.stockMin,
          unidadMedida: 'unidad',
        },
      })
    )
  );

  console.log(`✅ ${productos.length} productos creados.`);

  // ============================================================
  // CLIENTES (30)
  // ============================================================
  console.log('👥 Creando clientes...');
  const clientesData = [
    { nombre: 'María García Reyes', documento: '001-1234567-8', telefono: '809-555-0201', correo: 'maria.garcia@gmail.com', direccion: 'Calle Duarte #12, Santo Domingo' },
    { nombre: 'José Martínez Pérez', documento: '001-2345678-9', telefono: '809-555-0202', correo: 'jose.martinez@hotmail.com', direccion: 'Av. Lincoln #34, Santo Domingo' },
    { nombre: 'Ana Rodríguez Torres', documento: '001-3456789-0', telefono: '809-555-0203', correo: 'ana.rodriguez@yahoo.com', direccion: 'Calle El Conde #56, Santo Domingo' },
    { nombre: 'Carlos López Díaz', documento: '001-4567890-1', telefono: '809-555-0204', correo: 'carlos.lopez@gmail.com', direccion: 'Av. Independencia #78, Santo Domingo' },
    { nombre: 'Laura Hernández Cruz', documento: '001-5678901-2', telefono: '809-555-0205', correo: 'laura.hernandez@gmail.com', direccion: 'Calle Las Mercedes #90, Santo Domingo' },
    { nombre: 'Pedro González Vargas', documento: '001-6789012-3', telefono: '809-555-0206', correo: 'pedro.gonzalez@outlook.com', direccion: 'Bulevar 30 de Mayo #10, Santiago' },
    { nombre: 'Rosa Jiménez Almonte', documento: '001-7890123-4', telefono: '809-555-0207', correo: 'rosa.jimenez@gmail.com', direccion: 'Calle del Sol #22, Santiago' },
    { nombre: 'Miguel Castillo Mejía', documento: '001-8901234-5', telefono: '809-555-0208', correo: 'miguel.castillo@hotmail.com', direccion: 'Av. Estrella Sadhalá #44, Santiago' },
    { nombre: 'Carmen Flores Bautista', documento: '001-9012345-6', telefono: '809-555-0209', correo: 'carmen.flores@gmail.com', direccion: 'Calle Real #66, La Vega' },
    { nombre: 'Ramón Morales Sánchez', documento: '001-0123456-7', telefono: '809-555-0210', correo: 'ramon.morales@yahoo.com', direccion: 'Calle Primera #88, La Romana' },
    { nombre: 'Isabel Ramos Feliz', documento: '002-1234567-8', telefono: '809-555-0211', correo: 'isabel.ramos@gmail.com', direccion: 'Av. Central #100, San Pedro de Macorís' },
    { nombre: 'Antonio Medina Ureña', documento: '002-2345678-9', telefono: '809-555-0212', correo: 'antonio.medina@outlook.com', direccion: 'Calle Nueva #12, Bonao' },
    { nombre: 'Gloria Taveras Contreras', documento: '002-3456789-0', telefono: '809-555-0213', correo: 'gloria.taveras@gmail.com', direccion: 'Calle Hostos #34, Moca' },
    { nombre: 'Francisco Espinal Arias', documento: '002-4567890-1', telefono: '809-555-0214', correo: 'francisco.espinal@gmail.com', direccion: 'Calle Padre Billini #56, Puerto Plata' },
    { nombre: 'Mercedes Núñez De la Rosa', documento: '002-5678901-2', telefono: '809-555-0215', correo: 'mercedes.nunez@hotmail.com', direccion: 'Av. Hermanas Mirabal #78, Puerto Plata' },
    { nombre: 'Supermercado Bella Vista SRL', documento: '131-12345-6', telefono: '809-555-0216', correo: 'compras@bellavistasrl.do', direccion: 'Av. Churchill #90, Santo Domingo', limiteCredito: 50000 },
    { nombre: 'Colmado El Buen Gusto', documento: '131-23456-7', telefono: '809-555-0217', correo: 'colmadoelbgusto@gmail.com', direccion: 'Calle Meriño #10, Santo Domingo', limiteCredito: 15000 },
    { nombre: 'Restaurante El Fogón Criollo', documento: '131-34567-8', telefono: '809-555-0218', correo: 'pedidos@fogoncriollo.do', direccion: 'Av. Máximo Gómez #32, Santo Domingo', limiteCredito: 25000 },
    { nombre: 'Cafetería Universidad INTEC', documento: '131-45678-9', telefono: '809-555-0219', correo: 'cafeteria@intec.edu.do', direccion: 'Av. Los Próceres, Santo Domingo', limiteCredito: 20000 },
    { nombre: 'Hotel Hamaca Boca Chica', documento: '131-56789-0', telefono: '809-555-0220', correo: 'alimentos@hotelhamaca.do', direccion: 'Boca Chica, Santo Domingo', limiteCredito: 100000 },
    { nombre: 'Luis Alberto Peña Marte', documento: '003-1234567-8', telefono: '849-555-0221', correo: 'luispenamarte@gmail.com', direccion: 'Los Prados, Santo Domingo' },
    { nombre: 'Yolanda de los Santos', documento: '003-2345678-9', telefono: '849-555-0222', correo: 'yolanda.delossantos@gmail.com', direccion: 'Ensanche Ozama, Santo Domingo' },
    { nombre: 'Héctor Balbuena Minyety', documento: '003-3456789-0', telefono: '849-555-0223', correo: 'hector.balbuena@hotmail.com', direccion: 'Villa Juana, Santo Domingo' },
    { nombre: 'Nathaly Martínez Guzmán', documento: '003-4567890-1', telefono: '849-555-0224', correo: 'nathaly.martinez@gmail.com', direccion: 'Evaristo Morales, Santo Domingo' },
    { nombre: 'Rafael Encarnación Lugo', documento: '003-5678901-2', telefono: '849-555-0225', correo: 'rafael.encarnacion@outlook.com', direccion: 'Naco, Santo Domingo' },
    { nombre: 'Distribuidora El Cibao, SRL', documento: '131-67890-1', telefono: '809-555-0226', correo: 'ventas@distcibao.do', direccion: 'Zona Industrial, Santiago', limiteCredito: 75000 },
    { nombre: 'Tienda Don Quijote', documento: '131-78901-2', telefono: '809-555-0227', correo: 'info@donquijoterd.do', direccion: 'Calle Principal #45, La Vega', limiteCredito: 30000 },
    { nombre: 'Paola Rosario Sepúlveda', documento: '003-6789012-3', telefono: '849-555-0228', correo: 'paola.rosario@gmail.com', direccion: 'Gazcue, Santo Domingo' },
    { nombre: 'Diego Almánzar Pereyra', documento: '003-7890123-4', telefono: '849-555-0229', correo: 'diego.almanazar@gmail.com', direccion: 'Piantini, Santo Domingo' },
    { nombre: 'Valentina Cruz Ogando', documento: '003-8901234-5', telefono: '849-555-0230', correo: 'valentina.cruz@hotmail.com', direccion: 'Bella Vista, Santo Domingo' },
  ];

  const clientes = await Promise.all(
    clientesData.map(c => prisma.cliente.create({ data: c }))
  );

  console.log(`✅ ${clientes.length} clientes creados.`);


  // FACTURAS (30 distribuidas en últimos 30 días con horas distintas)
  // ============================================================
  console.log('🧾 Creando facturas...');
  const adminUser = await prisma.usuario.findFirst({ where: { email: 'admin@facturacion.local' } });
  const configFac = await prisma.configuracionFacturacion.findUnique({ where: { id: 'default' } });
  const impPct = configFac?.impuestoPorcentaje ?? 18;

  const metodosPago = ['efectivo', 'tarjeta', 'transferencia', 'mixto'] as const;

  // Función helper para crear factura
  async function crearFactura(
    clienteIdx: number,
    productosIdxConCantidad: { idx: number; cant: number }[],
    diasAtras: number,
    hora: number,
    metodoPago: typeof metodosPago[number],
    ref?: string,
  ) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAtras);
    fecha.setHours(hora, Math.floor(Math.random() * 60), 0, 0);

    let subtotal = 0;
    const detallesData: any[] = [];

    for (const { idx, cant } of productosIdxConCantidad) {
      const prod = productos[idx];
      const subtotalLinea = prod.precioVenta * cant;
      subtotal += subtotalLinea;
      detallesData.push({
        productoId: prod.id,
        cantidad: cant,
        precioUnitario: prod.precioVenta,
        costoUnitario: prod.precioCosto,
        descuentoPorcentaje: 0,
        subtotal: subtotalLinea,
      });
    }

    const impuestoMonto = subtotal * (impPct / 100);
    const total = subtotal + impuestoMonto;

    let montoEf: number | undefined;
    let montoTr: number | undefined;
    if (metodoPago === 'mixto') {
      montoEf = Math.round(total * 0.4 * 100) / 100;
      montoTr = Math.round((total - montoEf) * 100) / 100;
    }

    return prisma.factura.create({
      data: {
        clienteId: clientes[clienteIdx].id,
        usuarioId: adminUser?.id,
        fecha,
        subtotal,
        descuentoPorcentaje: 0,
        descuentoMonto: 0,
        impuestoPorcentaje: impPct,
        impuestoMonto,
        total,
        metodoPago,
        referenciaTransferencia: (metodoPago === 'transferencia' || metodoPago === 'mixto') ? (ref ?? `${Math.floor(Math.random()*9000000000 + 1000000000)}`) : null,
        montoEfectivo: montoEf ?? null,
        montoTransferencia: montoTr ?? null,
        estado: 'emitida',
        detalles: { create: detallesData },
      },
    });
  }

  // 30 facturas: diversas fechas, horarios, métodos de pago y productos
  const facturasACrear = [
    // Hoy — varias horas
    { cli: 0, prods: [{idx:15,cant:2},{idx:11,cant:3},{idx:1,cant:1}], dias: 0, hora: 8, mp: 'efectivo' },
    { cli: 1, prods: [{idx:3,cant:1},{idx:6,cant:2},{idx:12,cant:4}], dias: 0, hora: 10, mp: 'tarjeta' },
    { cli: 2, prods: [{idx:19,cant:2},{idx:20,cant:1},{idx:22,cant:1}], dias: 0, hora: 11, mp: 'transferencia', ref: '8832541002' },
    { cli: 3, prods: [{idx:0,cant:3},{idx:16,cant:1},{idx:23,cant:2}], dias: 0, hora: 12, mp: 'efectivo' },
    { cli: 4, prods: [{idx:9,cant:1},{idx:25,cant:3},{idx:14,cant:2}], dias: 0, hora: 14, mp: 'mixto', ref: '7741852963' },
    { cli: 5, prods: [{idx:17,cant:2},{idx:18,cant:1},{idx:26,cant:4}], dias: 0, hora: 15, mp: 'tarjeta' },
    // Ayer
    { cli: 6, prods: [{idx:28,cant:1},{idx:29,cant:2},{idx:4,cant:3}], dias: 1, hora: 9, mp: 'efectivo' },
    { cli: 7, prods: [{idx:11,cant:4},{idx:12,cant:2},{idx:13,cant:1}], dias: 1, hora: 13, mp: 'transferencia', ref: '9923654100' },
    { cli: 8, prods: [{idx:0,cant:2},{idx:7,cant:3},{idx:15,cant:1}], dias: 1, hora: 16, mp: 'tarjeta' },
    { cli: 9, prods: [{idx:22,cant:2},{idx:24,cant:1},{idx:27,cant:3}], dias: 1, hora: 17, mp: 'efectivo' },
    // Hace 2 días
    { cli: 10, prods: [{idx:5,cant:2},{idx:8,cant:4},{idx:18,cant:1}], dias: 2, hora: 8, mp: 'tarjeta' },
    { cli: 11, prods: [{idx:15,cant:3},{idx:16,cant:2},{idx:19,cant:1}], dias: 2, hora: 11, mp: 'transferencia', ref: '6612893401' },
    { cli: 12, prods: [{idx:1,cant:1},{idx:2,cant:2},{idx:3,cant:3}], dias: 2, hora: 14, mp: 'mixto', ref: '5501236987' },
    // Esta semana
    { cli: 13, prods: [{idx:11,cant:5},{idx:12,cant:3},{idx:14,cant:2}], dias: 3, hora: 9, mp: 'efectivo' },
    { cli: 14, prods: [{idx:20,cant:2},{idx:21,cant:3},{idx:25,cant:1}], dias: 4, hora: 10, mp: 'tarjeta' },
    { cli: 15, prods: [{idx:28,cant:3},{idx:29,cant:2},{idx:22,cant:4}], dias: 4, hora: 15, mp: 'transferencia', ref: '4489761230' },
    { cli: 16, prods: [{idx:6,cant:6},{idx:7,cant:4},{idx:8,cant:2}], dias: 5, hora: 11, mp: 'tarjeta' },
    { cli: 17, prods: [{idx:15,cant:2},{idx:17,cant:3},{idx:23,cant:1}], dias: 6, hora: 9, mp: 'efectivo' },
    { cli: 18, prods: [{idx:0,cant:4},{idx:1,cant:2},{idx:9,cant:3}], dias: 6, hora: 14, mp: 'mixto', ref: '3378954120' },
    // 2da semana
    { cli: 19, prods: [{idx:19,cant:3},{idx:24,cant:2},{idx:26,cant:1}], dias: 8, hora: 10, mp: 'tarjeta' },
    { cli: 20, prods: [{idx:11,cant:6},{idx:12,cant:4},{idx:16,cant:2}], dias: 9, hora: 9, mp: 'efectivo' },
    { cli: 21, prods: [{idx:3,cant:2},{idx:4,cant:1},{idx:5,cant:3}], dias: 10, hora: 11, mp: 'transferencia', ref: '2267843000' },
    { cli: 22, prods: [{idx:27,cant:4},{idx:28,cant:2},{idx:29,cant:3}], dias: 11, hora: 15, mp: 'tarjeta' },
    { cli: 23, prods: [{idx:0,cant:5},{idx:2,cant:3},{idx:15,cant:2}], dias: 12, hora: 16, mp: 'efectivo' },
    // 3ra semana
    { cli: 24, prods: [{idx:22,cant:3},{idx:23,cant:2},{idx:25,cant:1}], dias: 15, hora: 9, mp: 'tarjeta' },
    { cli: 25, prods: [{idx:11,cant:8},{idx:17,cant:3},{idx:18,cant:2}], dias: 17, hora: 10, mp: 'transferencia', ref: '1156732894' },
    { cli: 26, prods: [{idx:6,cant:5},{idx:8,cant:3},{idx:14,cant:4}], dias: 18, hora: 13, mp: 'efectivo' },
    // 4ta semana
    { cli: 27, prods: [{idx:20,cant:4},{idx:21,cant:3},{idx:1,cant:2}], dias: 20, hora: 9, mp: 'mixto', ref: '0045621874' },
    { cli: 28, prods: [{idx:15,cant:5},{idx:16,cant:3},{idx:19,cant:2}], dias: 25, hora: 10, mp: 'tarjeta' },
    { cli: 29, prods: [{idx:3,cant:3},{idx:7,cant:4},{idx:12,cant:5}], dias: 28, hora: 8, mp: 'efectivo' },
  ] as const;

  for (const f of facturasACrear) {
    await crearFactura(f.cli, [...f.prods], f.dias, f.hora, f.mp as any, (f as any).ref);
  }

  console.log(`✅ 30 facturas creadas.`);

  // ============================================================
  // ALERTAS de stock bajo/crítico para 5 productos
  // ============================================================
  const productosAlerta = [
    { prod: productos[4], stock: 4 },   // Salchichón
    { prod: productos[10], stock: 3 },  // Galletas María
    { prod: productos[29], stock: 2 },  // Helado Bon
    { prod: productos[22], stock: 0 },  // Detergente (agotado)
    { prod: productos[27], stock: 1 },  // Chocolate Hershey
  ];

  for (const { prod, stock } of productosAlerta) {
    await prisma.producto.update({ where: { id: prod.id }, data: { stockActual: stock } });
    await prisma.alertaInventario.create({
      data: {
        productoId: prod.id,
        stockActual: stock,
        stockMinimo: prod.stockMinimo,
        cantidadSugerida: prod.stockMinimo * 3,
        estado: stock === 0 ? 'pendiente' : 'pendiente',
      },
    });
  }

  console.log('✅ Alertas de inventario creadas.');

  // ============================================================
  // MOVIMIENTOS DE INVENTARIO (entradas de mercancía)
  // ============================================================
  const entrada = await prisma.entradaMercancia.create({
    data: {
      proveedorId: proveedores[0].id,
      usuarioId: adminUser?.id,
      fecha: new Date(Date.now() - 5 * 86400000),
      observaciones: 'Entrada de mercancía inicial — apertura de inventario',
      detalles: {
        create: productos.slice(0, 10).map(p => ({
          productoId: p.id,
          cantidad: 100,
          costoUnitario: p.precioCosto,
          subtotal: p.precioCosto * 100,
        })),
      },
    },
  });

  console.log('✅ Entrada de mercancía registrada.');
  console.log('\n🎉 ¡Seed de supermercado completado exitosamente!');
  console.log(`   📦 10 categorías | 30 proveedores | 30 productos`);
  console.log(`   👥 30 clientes | 🧾 30 facturas | ⚠️ 5 alertas`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
