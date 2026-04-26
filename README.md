# Looserfit - E-commerce de Indumentaria 👕🚀

Este proyecto es una plataforma completa de comercio electrónico para la marca **Looserfit**. Cuenta con un sistema robusto de gestión de productos, autenticación de usuarios, panel de administración y una integración fluida con pasarelas de pago.

## 🏗️ Estructura del Proyecto

El repositorio está dividido en dos partes principales:

- **Frontend (`/tienda-frontend`)**: Desarrollado con React + Vite. Proporciona una interfaz de usuario moderna, rápida y responsive.
- **Backend (`/tienda-backend`)**: Desarrollado con Node.js y Express. Maneja la lógica de negocio, la base de datos MongoDB y las integraciones con servicios externos.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React**: Biblioteca principal para la UI.
- **Vite**: Herramienta de construcción para un desarrollo ultra rápido.
- **GSAP**: Animaciones fluidas y de alto rendimiento.
- **Lucide React**: Set de iconos modernos.
- **Axios**: Comunicación con la API del backend.
- **CSS Vanilla**: Estilos personalizados y optimizados.

### Backend
- **Node.js & Express**: Entorno de ejecución y framework de servidor.
- **MongoDB & Mongoose**: Base de datos NoSQL y modelado de datos.
- **JWT (JSON Web Tokens)**: Autenticación segura y manejo de sesiones.
- **Cloudinary**: Gestión y almacenamiento optimizado de imágenes de productos.
- **Mercado Pago**: Integración de la pasarela de pagos.
- **Nodemailer**: Envío automatizado de tickets de compra y newsletters.
- **Bcrypt.js**: Seguridad para el almacenamiento de contraseñas.

---

## ✨ Funcionalidades Clave

- 🛒 **Carrito de Compras**: Gestión de productos, talles y stock en tiempo real.
- 🔐 **Autenticación**: Registro e inicio de sesión seguro con roles diferenciados (User/Admin).
- 🛠️ **Panel de Admin**: Control total de productos (CRUD), categorías, pedidos y envío de noticias.
- 💳 **Pagos Integrados**: Checkout fluido con Mercado Pago.
- 📧 **Notificaciones**: Envío automático de confirmaciones de pedido por email.
- 📱 **Diseño Responsive**: Optimizado para dispositivos móviles y escritorio.

---

## 🚀 Instalación y Configuración

Para ejecutar este proyecto localmente, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd "looserfit web"
```

### 2. Configurar el Backend
```bash
cd tienda-backend
npm install
# Copia el archivo de ejemplo y completa tus credenciales
cp .env.example .env 
npm run dev
```

### 3. Configurar el Frontend
```bash
cd ../tienda-frontend
npm install
# Copia el archivo de ejemplo y ajusta la URL de la API si es necesario
cp .env.example .env
npm run dev
```
