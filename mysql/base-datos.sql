CREATE DATABASE IF NOT EXISTS recetas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recetas_db;

-- Tabla de Usuarios con roles (Admin y Cliente)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  clave VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100) NOT NULL,
  correo VARCHAR(120) DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  rol ENUM('admin', 'cliente') DEFAULT 'cliente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Recetas (Incluye imagen, video, unidad e ingredientes)
CREATE TABLE IF NOT EXISTS recetas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  ingredientes TEXT,
  categoria VARCHAR(50) NOT NULL,
  unidad VARCHAR(40) DEFAULT 'porciones',
  porciones INT DEFAULT 1,
  disponible TINYINT(1) DEFAULT 1,
  imagen_url VARCHAR(255) DEFAULT NULL,
  video_url VARCHAR(255) DEFAULT NULL,
  creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para persistir las sesiones de Express
CREATE TABLE IF NOT EXISTS sesiones (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuarios iniciales de prueba
INSERT INTO usuarios (usuario, clave, nombre_completo, correo, telefono, rol) VALUES
('admin', 'admin123', 'Alessia Pérez', 'alessia.perez@epn.edu.ec', '0999111222', 'admin'),
('cliente', 'cliente123', 'Nayely Ayol', 'nayely.ayol@epn.edu.ec', '0999333444', 'cliente')
ON DUPLICATE KEY UPDATE id=id;

-- Recetas iniciales con URLs de imágenes, videos, unidad e ingredientes
INSERT INTO recetas (codigo, nombre, descripcion, ingredientes, categoria, unidad, porciones, disponible, imagen_url, video_url) VALUES
(
  'REC-001',
  'Encebollado de Pescado',
  'Tradicional sopa ecuatoriana preparada con albacora, yuca y cebolla curtida.',
  'Albacora, yuca, cebolla paiteña, tomate, cilantro, limón, comino, achiote',
  'Plato Fuerte',
  'porciones',
  4,
  1,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'REC-002',
  'Locro de Papa',
  'Sopa cremosa tradicional a base de papa, servida con queso fresco y aguacate.',
  'Papa chola, leche, queso fresco, cebolla, achiote, aguacate, cilantro',
  'Entrada',
  'porciones',
  6,
  1,
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'REC-003',
  'Empanadas de Viento',
  'Empanadas fritas crujientes rellenas de queso derretido y espolvoreadas con azúcar.',
  'Harina, queso fresco, manteca, azúcar, sal, aceite para freír',
  'Postre',
  'unidades',
  12,
  1,
  'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
)
ON DUPLICATE KEY UPDATE id=id;