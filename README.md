# Sistema POS Completo

Sistema de punto de venta completo con gestión de inventarios, ventas, compras, proveedores, informes, CRM, multiempresa, SaaS/Monetizable, gestión de personal, conexión con WooCommerce, multi idioma, multi moneda y facturación electrónica.

## Características

- ✅ **Inventarios y Stock**: Gestión completa de productos con control de stock
- ✅ **POS (Punto de Venta)**: Sistema de ventas rápido y eficiente
- ✅ **Ventas**: Historial completo de ventas con detalles
- ✅ **Compras**: Gestión de compras a proveedores
- ✅ **Proveedores**: Administración de proveedores
- ✅ **Clientes**: Gestión de clientes con programa de lealtad
- ✅ **Informes**: Reportes y gráficos de ventas y productos
- ✅ **CRM**: Gestión de relaciones con clientes
- ✅ **SaaS/Monetizable**: Sistema preparado para monetización
- ✅ **Gestión de Personal**: Administración de empleados y roles
- ✅ **WooCommerce**: Conexión con tiendas WooCommerce
- ✅ **Multi Idioma**: Soporte para español e inglés
- ✅ **Multi Moneda**: Soporte para USD, MXN, EUR, GBP
- ✅ **Facturación Electrónica**: Preparado para facturación electrónica

## Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Supabase**: Base de datos PostgreSQL y autenticación
- **React Hook Form**: Manejo de formularios
- **Recharts**: Gráficos y visualizaciones
- **i18next**: Internacionalización

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd pos-system
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

4. **Configurar Supabase**

- Crea un proyecto en [Supabase](https://supabase.com)
- Ejecuta el script SQL en `supabase/schema.sql` en el SQL Editor de Supabase
- Obtén las credenciales de tu proyecto y configúralas en `.env`

5. **Ejecutar el proyecto**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
├── app/                    # Páginas y rutas (App Router)
│   ├── auth/              # Autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── pos/               # Punto de venta
│   ├── products/          # Gestión de productos
│   ├── inventory/         # Inventario y stock
│   ├── sales/             # Ventas
│   ├── purchases/         # Compras
│   ├── suppliers/         # Proveedores
│   ├── customers/         # Clientes
│   ├── reports/           # Informes
│   ├── crm/               # CRM
│   ├── staff/             # Personal
│   ├── woocommerce/       # Conexión WooCommerce
│   └── settings/          # Configuración
├── components/            # Componentes React
│   ├── ui/                # Componentes UI base
│   └── layout/             # Componentes de layout
├── lib/                   # Utilidades y configuraciones
│   ├── supabase/          # Cliente Supabase
│   ├── i18n.ts            # Configuración i18n
│   └── utils.ts           # Utilidades
├── locales/               # Traducciones
│   ├── es.json            # Español
│   └── en.json            # Inglés
└── supabase/              # Scripts SQL
    └── schema.sql         # Esquema de base de datos
```

## Uso

### Primera Configuración

1. **Crear una cuenta**: Ve a `/auth/login` y crea una cuenta
2. **Configurar empresa**: Ve a `/settings` y completa la información de tu empresa
3. **Agregar productos**: Ve a `/products` y agrega tus productos
4. **Iniciar ventas**: Ve a `/pos` y comienza a vender

### Módulos Principales

- **Dashboard**: Vista general del negocio
- **POS**: Sistema de punto de venta para realizar ventas rápidas
- **Productos**: Gestión de catálogo de productos
- **Inventario**: Control de stock y alertas de bajo inventario
- **Ventas**: Historial y detalles de todas las ventas
- **Compras**: Registro de compras a proveedores
- **Proveedores**: Administración de proveedores
- **Clientes**: Base de datos de clientes
- **Informes**: Reportes y gráficos de ventas
- **CRM**: Gestión de relaciones con clientes
- **Personal**: Administración de empleados
- **WooCommerce**: Sincronización con tiendas WooCommerce
- **Configuración**: Ajustes de la empresa

## Base de Datos

El sistema utiliza Supabase (PostgreSQL) con las siguientes tablas principales:

- `company_settings`: Configuración de la empresa (una sola empresa)
- `users`: Usuarios del sistema
- `products`: Productos
- `categories`: Categorías de productos
- `sales`: Ventas
- `sale_items`: Items de venta
- `purchases`: Compras
- `purchase_items`: Items de compra
- `suppliers`: Proveedores
- `customers`: Clientes
- `stock_movements`: Movimientos de stock
- `invoices`: Facturas electrónicas
- `woocommerce_connections`: Conexiones WooCommerce

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Los usuarios autenticados pueden acceder a todos los datos (una sola empresa)
- Autenticación segura con Supabase Auth
- Políticas de seguridad configuradas en la base de datos

## Facturación Electrónica

El sistema está preparado para integrar facturación electrónica. La tabla `invoices` almacena la información necesaria para generar facturas electrónicas. Puedes integrar con servicios como:

- Facturama (México)
- Facturación Electrónica SAT (México)
- Otros servicios según tu país

## WooCommerce

Para conectar con WooCommerce:

1. Ve a `/woocommerce`
2. Ingresa la URL de tu tienda
3. Genera las credenciales API en WooCommerce (Consumer Key y Consumer Secret)
4. Guarda la conexión
5. Usa el botón "Sincronizar" para sincronizar productos y pedidos

## Multi Idioma

El sistema soporta múltiples idiomas. Actualmente incluye:
- Español (es)
- Inglés (en)

Puedes agregar más idiomas agregando archivos en `locales/` y configurándolos en `lib/i18n.ts`.

## Multi Moneda

El sistema soporta múltiples monedas:
- USD (Dólar)
- MXN (Peso Mexicano)
- COP (Peso Colombiano)
- EUR (Euro)
- GBP (Libra)

Configura la moneda de tu empresa en `/settings`.

## Desarrollo

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linter
npm run lint
```

## Licencia

Este proyecto está bajo la Licencia MIT.

## Soporte

Para soporte, por favor abre un issue en el repositorio.

