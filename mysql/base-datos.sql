CREATE DATABASE IF NOT EXISTS inventario_gastronomico_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE inventario_gastronomico_db;

-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    clave VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(120) NOT NULL,
    correo VARCHAR(120) DEFAULT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    rol ENUM('admin', 'cliente')
        NOT NULL
        DEFAULT 'cliente',
    creado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
    actualizado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- TABLA DE PRODUCTOS GASTRONÓMICOS

CREATE TABLE IF NOT EXISTS productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    codigo VARCHAR(30) NOT NULL UNIQUE,

    nombre VARCHAR(120) NOT NULL,

    descripcion TEXT DEFAULT NULL,

    categoria VARCHAR(60) NOT NULL,

    unidad VARCHAR(40) NOT NULL,

    stock INT UNSIGNED NOT NULL DEFAULT 0,

    precio DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,

    disponible TINYINT(1)
        GENERATED ALWAYS AS (
            CASE
                WHEN stock > 0 THEN 1
                ELSE 0
            END
        ) STORED,

    imagen_url VARCHAR(500) DEFAULT NULL,

    creado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    actualizado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_productos_nombre (nombre),

    INDEX idx_productos_categoria (categoria),

    INDEX idx_productos_disponible (disponible),

    INDEX idx_productos_stock (stock)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- TABLA DE CARRITOS
CREATE TABLE IF NOT EXISTS carritos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT UNSIGNED NOT NULL,

    estado ENUM(
        'activo',
        'comprado',
        'cancelado'
    ) NOT NULL DEFAULT 'activo',

    creado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    actualizado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carritos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_carritos_usuario (usuario_id),

    INDEX idx_carritos_estado (estado)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- TABLA DE DETALLES DEL CARRITO
CREATE TABLE IF NOT EXISTS carrito_detalles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    carrito_id INT UNSIGNED NOT NULL,

    producto_id INT UNSIGNED NOT NULL,

    cantidad INT UNSIGNED NOT NULL DEFAULT 1,

    creado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    actualizado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carrito_detalles_carrito
        FOREIGN KEY (carrito_id)
        REFERENCES carritos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_carrito_detalles_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT uk_carrito_producto
        UNIQUE (carrito_id, producto_id),

    INDEX idx_carrito_detalles_carrito (carrito_id),

    INDEX idx_carrito_detalles_producto (producto_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT UNSIGNED NOT NULL,

    total DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,

    estado ENUM(
        'confirmado',
        'preparando',
        'entregado',
        'cancelado'
    ) NOT NULL DEFAULT 'confirmado',

    creado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    actualizado_el TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_pedidos_usuario (usuario_id),

    INDEX idx_pedidos_estado (estado),

    INDEX idx_pedidos_fecha (creado_el)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- TABLA DE DETALLES DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedido_detalles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    pedido_id INT UNSIGNED NOT NULL,

    producto_id INT UNSIGNED NOT NULL,

    codigo_producto VARCHAR(30) NOT NULL,

    nombre_producto VARCHAR(120) NOT NULL,

    cantidad INT UNSIGNED NOT NULL,

    precio_unitario DECIMAL(10,2) UNSIGNED NOT NULL,

    subtotal DECIMAL(10,2) UNSIGNED NOT NULL,

    CONSTRAINT fk_pedido_detalles_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_pedido_detalles_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_pedido_detalles_pedido (pedido_id),

    INDEX idx_pedido_detalles_producto (producto_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- TABLA DE SESIONES COMPARTIDAS
-- ESTA TABLA SERÁ UTILIZADA POR LOS TRES NODOS WEB
CREATE TABLE IF NOT EXISTS sesiones (
    session_id VARCHAR(128)
        COLLATE utf8mb4_bin
        NOT NULL,

    expires INT UNSIGNED NOT NULL,

    data MEDIUMTEXT
        COLLATE utf8mb4_bin,

    PRIMARY KEY (session_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_bin;

-- USUARIOS INICIALES
-- DE MOMENTO LAS CLAVES ESTÁN EN TEXTO PLANO
-- LUEGO LAS CAMBIAREMOS A BCRYPT
INSERT INTO usuarios (
    usuario,
    clave,
    nombre_completo,
    correo,
    telefono,
    rol
)
VALUES
(
    'admin',
    'admin123',
    'Administrador del sistema',
    'admin@inventario.local',
    '0999999999',
    'admin'
),
(
    'cliente',
    'cliente123',
    'Cliente de prueba',
    'cliente@inventario.local',
    '0988888888',
    'cliente'
)
ON DUPLICATE KEY UPDATE
    nombre_completo = VALUES(nombre_completo),
    correo = VALUES(correo),
    telefono = VALUES(telefono),
    rol = VALUES(rol);

-- PRODUCTOS GASTRONÓMICOS INICIALES

INSERT INTO productos (
    codigo,
    nombre,
    descripcion,
    categoria,
    unidad,
    stock,
    precio,
    imagen_url
)
VALUES
(
    'PROD-001',
    'Encebollado',
    'Plato preparado con albacora, yuca, cebolla curtida, tomate y especias.',
    'Platos fuertes',
    'porciones',
    20,
    3.50,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
),
(
    'PROD-002',
    'Locro de papa',
    'Sopa cremosa preparada con papa, queso fresco, leche y aguacate.',
    'Sopas',
    'porciones',
    15,
    2.75,
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'
),
(
    'PROD-003',
    'Empanada de viento',
    'Empanada frita rellena de queso y espolvoreada con azúcar.',
    'Entradas',
    'unidades',
    35,
    1.25,
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
),
(
    'PROD-004',
    'Jugo natural de mora',
    'Bebida natural preparada con mora, agua, azúcar y hielo.',
    'Bebidas',
    'vasos',
    25,
    1.50,
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80'
),
(
    'PROD-005',
    'Torta de chocolate',
    'Porción de torta de chocolate con cobertura cremosa.',
    'Postres',
    'porciones',
    10,
    2.25,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
)
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion),
    categoria = VALUES(categoria),
    unidad = VALUES(unidad),
    stock = VALUES(stock),
    precio = VALUES(precio),
    imagen_url = VALUES(imagen_url);

-- USUARIO PARA REPLICACIÓN MYSQL

CREATE USER IF NOT EXISTS
    'replicador'@'%'
    IDENTIFIED WITH mysql_native_password
    BY 'rootpass123';

GRANT REPLICATION SLAVE
ON *.*
TO 'replicador'@'%';

FLUSH PRIVILEGES;