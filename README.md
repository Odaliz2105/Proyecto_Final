# Inventario Gastronómico Distribuido

Aplicación web distribuida para la gestión de inventario de productos gastronómicos. Proyecto final de la asignatura **Aplicaciones Distribuidas** de la Escuela Politécnica Nacional, período académico **2026-A**.

Repositorio: [github.com/Odaliz2105/Proyecto_Final](https://github.com/Odaliz2105/Proyecto_Final)

---

## Arquitectura distribuida

El sistema está desplegado mediante Docker Compose y está compuesto por:

- Tres nodos que ejecutan la misma aplicación web.
- Un balanceador de carga NGINX.
- Una base de datos MySQL principal.
- Una réplica MySQL esclava.
- Adminer para administrar y verificar las bases de datos.

```text
                         ┌──────────────────────────────┐
 Navegador / JMeter ───► │ NGINX                       │
                         │ Host: 8080                   │
                         │ Balanceo por pesos 4:3:2     │
                         └──────────────┬───────────────┘
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
       ┌────────────┐           ┌────────────┐           ┌────────────┐
       │ nodo-web-1 │           │ nodo-web-2 │           │ nodo-web-3 │
       │ Peso 4     │           │ Peso 3     │           │ Peso 2     │
       │ :3000      │           │ :3000      │           │ :3000      │
       └─────┬──────┘           └─────┬──────┘           └─────┬──────┘
             │                        │                        │
             └──────────── Escrituras al maestro ─────────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │ servidor-maestro│
                             │ MySQL 8 :3306   │
                             │ server-id=1     │
                             └────────┬────────┘
                                      │ GTID
                                      ▼
                             ┌─────────────────┐
                             │ servidor-esclavo│
                             │ MySQL 8 :3306   │
                             │ server-id=2     │
                             └────────┬────────┘
                                      ▲
                         Lecturas ────┘

                             ┌─────────────────┐
                             │ Adminer         │
                             │ Host: 8081      │
                             └─────────────────┘
```

### Balanceo de carga

NGINX distribuye las solicitudes entre los tres nodos mediante balanceo por pesos:

```nginx
upstream grupo_nodos {
    server nodo-web-1:3000 weight=4;
    server nodo-web-2:3000 weight=3;
    server nodo-web-3:3000 weight=2;
}
```

La distribución aproximada es:

| Nodo | Peso | Tráfico aproximado |
|---|---:|---:|
| `nodo-web-1` | 4 | 44 % |
| `nodo-web-2` | 3 | 33 % |
| `nodo-web-3` | 2 | 22 % |

Los pesos se asignaron de acuerdo con los recursos de cada contenedor. El nodo 1 tiene mayor capacidad de CPU y memoria, por lo que recibe una mayor cantidad de solicitudes.

### Replicación de base de datos

- Las operaciones de escritura se realizan en `servidor-maestro`.
- Las consultas se realizan desde `servidor-esclavo`.
- Los cambios del maestro se replican automáticamente hacia el esclavo.
- Adminer permite revisar las tablas y comprobar que la información sea igual en ambas bases.

---

## Funcionalidades

### Administrador

- Inicio de sesión.
- Registro de productos.
- Edición y eliminación de productos.
- Validación de códigos duplicados.
- Consulta del stock disponible.

### Cliente

- Inicio de sesión.
- Consulta del catálogo.
- Visualización de disponibilidad.
- Agregar productos al carrito.
- Actualizar cantidades.
- Eliminar productos del carrito.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js y Express |
| Vistas | EJS, HTML, CSS y JavaScript |
| Base de datos | MySQL 8 |
| Balanceador | NGINX |
| Administración de BD | Adminer |
| Orquestación | Docker Compose |
| Pruebas de carga | Apache JMeter |

---

## Requisitos

- Docker Desktop o Docker Engine.
- Docker Compose v2.
- Git.
- Navegador web.
- Apache JMeter para las pruebas de carga.

---

## Instalación

```bash
git clone https://github.com/Odaliz2105/Proyecto_Final.git
cd Proyecto_Final
docker compose up --build -d
```

Verificar los contenedores:

```bash
docker compose ps
```

---

## Accesos

| Servicio | URL |
|---|---|
| Aplicación web | http://localhost:8080 |
| Verificación de nodo | http://localhost:8080/salud |
| Adminer | http://localhost:8081 |

### Usuarios de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Cliente | `cliente` | `cliente123` |

---

## Estructura del proyecto

```text
Proyecto_Final/
├── app/                    Aplicación Node.js y Express
├── mysql/                  Scripts y configuración de MySQL
├── nginx/                  Configuración del balanceador
├── docker-compose.yml      Orquestación de los contenedores
└── README.md               Documentación principal
```

---

## Servicios Docker

| Contenedor | Función |
|---|---|
| `balanceador-nginx` | Distribuye el tráfico entre los nodos |
| `nodo-web-1` | Primer nodo de aplicación |
| `nodo-web-2` | Segundo nodo de aplicación |
| `nodo-web-3` | Tercer nodo de aplicación |
| `servidor-maestro` | Base de datos principal |
| `servidor-esclavo` | Réplica de la base de datos |
| `adminer` | Administración de MySQL |

---

## Verificación del balanceo

Ejecutar varias solicitudes:

```bash
for i in {1..18}; do
  curl -s http://localhost:8080/salud
  echo
done
```

Deben aparecer respuestas de los tres nodos:

```text
nodo-web-1
nodo-web-2
nodo-web-3
```

Con una cantidad mayor de solicitudes, la distribución debe aproximarse a la proporción `4:3:2`.

---

## Verificación de la replicación

Consultar el estado del esclavo:

```bash
docker exec servidor-esclavo mysql \
  -uroot \
  -prootpass123 \
  -e "SHOW REPLICA STATUS\G"
```

Los campos principales deben mostrar:

```text
Replica_IO_Running: Yes
Replica_SQL_Running: Yes
```

Comparar la cantidad de productos:

```bash
docker exec servidor-maestro mysql \
  -uroot \
  -prootpass123 \
  inventario_gastronomico_db \
  -e "SELECT COUNT(*) FROM productos;"
```

```bash
docker exec servidor-esclavo mysql \
  -uroot \
  -prootpass123 \
  inventario_gastronomico_db \
  -e "SELECT COUNT(*) FROM productos;"
```

Ambos servidores deben mostrar el mismo resultado.

---

## Pruebas de carga

Las pruebas se realizan con Apache JMeter sobre los siguientes endpoints:

```text
GET /
GET /salud
GET /login
POST /login
GET /cliente
GET /admin
```

Durante las pruebas se registran:

- Tiempo promedio de respuesta.
- Throughput.
- Porcentaje de errores.
- Consumo de CPU.
- Consumo de memoria.
- Distribución de solicitudes entre los nodos.

Para monitorear los contenedores:

```bash
docker stats
```

---

## Tolerancia a fallos

Detener uno de los nodos:

```bash
docker stop nodo-web-3
```

Comprobar que el sistema continúa respondiendo:

```bash
curl http://localhost:8080/salud
```

Las solicitudes deben seguir siendo atendidas por `nodo-web-1` y `nodo-web-2`.

Restaurar el nodo:

```bash
docker start nodo-web-3
```

---

## Comandos útiles

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
docker compose down
docker compose down -v
```

---

## Asignatura

| Campo | Información |
|---|---|
| Institución | Escuela Politécnica Nacional |
| Carrera | Tecnología Superior en Desarrollo de Software |
| Asignatura | Aplicaciones Distribuidas |
| Profesor | Ing. Sergio Granizo |
| Período académico | 2026-A |

---

## Integrantes

- Odaliz — `<completar apellidos>`
- `<Integrante 2>`
- `<Integrante 3>`
