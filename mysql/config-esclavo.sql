-- Configuración de la replicación en el servidor esclavo
-- Este script se ejecuta automáticamente al inicializar el contenedor del esclavo.

CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='servidor-maestro',
  SOURCE_USER='replicador',
  SOURCE_PASSWORD='rootpass123',
  SOURCE_PORT=3306,
  GET_SOURCE_PUBLIC_KEY=1,
  SOURCE_AUTO_POSITION=1;

-- Iniciar el proceso de réplica
START REPLICA;
