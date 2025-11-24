USE [master];
GO

-- 1. Crear la Base de Datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SistemaVotacion')
BEGIN
    CREATE DATABASE [SistemaVotacion];
END
GO

USE [SistemaVotacion];
GO

/* ============================================
   2. LIMPIEZA (DROP) EN ORDEN CORRECTO
   (Hijos primero, Padres después)
============================================ */
IF OBJECT_ID('dbo.trg_MarcarUsuarioVoto', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_MarcarUsuarioVoto;
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UX_Voto_Unico' AND object_id = OBJECT_ID('dbo.Votos')) DROP INDEX UX_Voto_Unico ON dbo.Votos;

-- Tablas Hija
IF OBJECT_ID('dbo.Votos', 'U') IS NOT NULL DROP TABLE dbo.Votos;
IF OBJECT_ID('dbo.Candidatos', 'U') IS NOT NULL DROP TABLE dbo.Candidatos;
IF OBJECT_ID('dbo.AdminCredenciales', 'U') IS NOT NULL DROP TABLE dbo.AdminCredenciales;

-- Tablas Padre
IF OBJECT_ID('dbo.Elecciones', 'U') IS NOT NULL DROP TABLE dbo.Elecciones;
IF OBJECT_ID('dbo.Administradores', 'U') IS NOT NULL DROP TABLE dbo.Administradores;
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Usuarios;
GO

/* ============================================
   3. CREACIÓN DE TABLAS (Padres primero)
============================================ */

-- USUARIOS
CREATE TABLE dbo.Usuarios (
    UsuarioID        INT IDENTITY(1,1) PRIMARY KEY,
    Cedula           VARCHAR(20) NOT NULL UNIQUE,
    CodigoDactilar   VARCHAR(20) NOT NULL,
    Correo           VARCHAR(120) NOT NULL,
    Nombres          VARCHAR(120) NOT NULL,
    Provincia        VARCHAR(100) NOT NULL,
    HaVotado         BIT NOT NULL DEFAULT 0,
    FechaCreacion    DATETIME NOT NULL DEFAULT GETDATE(),
    Activo           BIT NOT NULL DEFAULT 1
);

-- ADMINISTRADORES
CREATE TABLE dbo.Administradores (
    AdminID          INT IDENTITY(1,1) PRIMARY KEY,
    Nombres          VARCHAR(120) NOT NULL,
    Correo           VARCHAR(120) NOT NULL UNIQUE,
    Activo           BIT NOT NULL DEFAULT 1,
    FechaCreacion    DATETIME NOT NULL DEFAULT GETDATE()
);

-- ELECCIONES
CREATE TABLE dbo.Elecciones (
    EleccionID       INT IDENTITY(1,1) PRIMARY KEY,
    Nombre           VARCHAR(200) NOT NULL,
    FechaInicio      DATETIME NOT NULL,
    FechaFin         DATETIME NOT NULL,
    Estado           VARCHAR(20) NOT NULL DEFAULT 'Activa',
    FechaCreacion    DATETIME NOT NULL DEFAULT GETDATE()
);

-- ADMIN_CREDENCIALES (Hija de Administradores)
CREATE TABLE dbo.AdminCredenciales (
    CredencialID     INT IDENTITY(1,1) PRIMARY KEY,
    AdminID          INT NOT NULL,
    HashPassword     VARCHAR(255) NOT NULL,
    Salt             VARCHAR(255) NULL,
    FechaCreacion    DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES dbo.Administradores(AdminID)
);

-- CANDIDATOS (Hija de Elecciones)
CREATE TABLE dbo.Candidatos (
    CandidatoID      INT IDENTITY(1,1) PRIMARY KEY,
    EleccionID       INT NOT NULL,
    Nombre           VARCHAR(150) NOT NULL,
    Descripcion      VARCHAR(300) NULL,
    Activo           BIT NOT NULL DEFAULT 1,
    FechaCreacion    DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (EleccionID) REFERENCES dbo.Elecciones(EleccionID)
);

-- VOTOS (Hija de Usuarios, Elecciones y Candidatos)
CREATE TABLE dbo.Votos (
    VotoID           INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID        INT NOT NULL,
    EleccionID       INT NOT NULL,
    CandidatoID      INT NOT NULL,
    Provincia        VARCHAR(100) NOT NULL,
    FechaVoto        DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UsuarioID)    REFERENCES dbo.Usuarios(UsuarioID),
    FOREIGN KEY (EleccionID)   REFERENCES dbo.Elecciones(EleccionID),
    FOREIGN KEY (CandidatoID)  REFERENCES dbo.Candidatos(CandidatoID)
);
GO

/* ============================================
   4. RESTRICCIONES E ÍNDICES
============================================ */
CREATE UNIQUE INDEX UX_Voto_Unico 
ON dbo.Votos (UsuarioID, EleccionID);
GO

/* ============================================
   5. TRIGGERS
============================================ */
CREATE TRIGGER dbo.trg_MarcarUsuarioVoto
ON dbo.Votos
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE U
    SET HaVotado = 1
    FROM dbo.Usuarios U
    INNER JOIN inserted i ON i.UsuarioID = U.UsuarioID;
END;
GO

/* ============================================
   6. INSERTS (DATOS DE PRUEBA)
============================================ */

-- USUARIOS
INSERT INTO dbo.Usuarios (Cedula, CodigoDactilar, Correo, Nombres, Provincia) VALUES
('0102030405','AB12','user1@mail.com','Carlos Pérez','Azuay'),
('0203040506','CD34','user2@mail.com','María López','Pichincha'),
('0304050607','EF56','user3@mail.com','Juan Torres','Guayas'),
('0405060708','GH78','user4@mail.com','Ana Gómez','Loja'),
('0506070809','IJ90','user5@mail.com','Luis Herrera','Manabí'),
('0607080910','KL12','user6@mail.com','Sofía Vega','El Oro'),
('0708091011','MN34','user7@mail.com','Pedro Ramos','Tungurahua'),
('0809101112','OP56','user8@mail.com','Andrea Ruiz','Cotopaxi'),
('0910111213','QR78','user9@mail.com','Daniel Castro','Chimborazo'),
('1011121314','ST90','user10@mail.com','Carla Mendoza','Carchi');

-- ADMINISTRADORES (Incluye el Super Admin para Login)
INSERT INTO dbo.Administradores (Nombres, Correo) VALUES
('Super Admin','admin@sevotec.ec'), -- ID 1 (Este usaremos para login)
('Admin 2','admin2@mail.com'),
('Admin 3','admin3@mail.com'),
('Admin 4','admin4@mail.com'),
('Admin 5','admin5@mail.com'),
('Admin 6','admin6@mail.com'),
('Admin 7','admin7@mail.com'),
('Admin 8','admin8@mail.com'),
('Admin 9','admin9@mail.com'),
('Admin 10','admin10@mail.com');

-- ADMIN CREDENCIALES
-- Nota: 'admin123' está en texto plano. Si tu backend usa bcrypt, 
-- el login funcionará SOLO si el código compara texto plano o si generamos un hash real.
-- Para desarrollo inicial, dejamos texto plano 'admin123' para el ID 1.
INSERT INTO dbo.AdminCredenciales (AdminID, HashPassword, Salt) VALUES
(1,'admin123','salt1'), 
(2,'hash2','salt2'),
(3,'hash3','salt3'),
(4,'hash4','salt4'),
(5,'hash5','salt5'),
(6,'hash6','salt6'),
(7,'hash7','salt7'),
(8,'hash8','salt8'),
(9,'hash9','salt9'),
(10,'hash10','salt10');

-- ELECCIONES
INSERT INTO dbo.Elecciones (Nombre, FechaInicio, FechaFin, Estado) VALUES
('Elección Presidencial 2025','2025-11-01','2025-11-10','Activa'), -- ID 1
('Elección Local Quito','2026-03-01','2026-03-05','Activa'), -- ID 2
('Elección Estudiantil','2025-12-01','2025-12-02','Activa'),
('Elección Comité Empresa','2026-01-10','2026-01-11','Activa'),
('Elección Vecinal','2025-09-15','2025-09-16','Cerrada'),
('Elección Ambiental','2025-08-20','2025-08-21','Archivada'),
('Elección Barrial','2025-10-01','2025-10-02','Cerrada'),
('Elección Directiva','2024-04-01','2024-04-02','Archivada'),
('Elección Provincial','2026-05-10','2026-05-15','Activa'),
('Elección General 2027','2027-02-01','2027-02-10','Activa');

-- CANDIDATOS
INSERT INTO dbo.Candidatos (EleccionID, Nombre, Descripcion) VALUES
(1,'Candidato A','Propuesta 1'), -- ID 1
(1,'Candidato B','Propuesta 2'), -- ID 2
(1,'Candidato C','Propuesta 3'), -- ID 3
(1,'Candidato D','Propuesta 4'), -- ID 4
(1,'Candidato E','Propuesta 5'), -- ID 5
(2,'Candidato X','Plan 1'),      -- ID 6
(2,'Candidato Y','Plan 2'),
(2,'Candidato Z','Plan 3'),
(2,'Candidato W','Plan 4'),
(2,'Candidato V','Plan 5');       -- ID 10

-- VOTOS
INSERT INTO dbo.Votos (UsuarioID, EleccionID, CandidatoID, Provincia) VALUES
(1,1,1,'Azuay'),
(2,1,2,'Pichincha'),
(3,1,3,'Guayas'),
(4,1,1,'Loja'),
(5,1,4,'Manabí'),
(6,2,6,'El Oro'),
(7,2,7,'Tungurahua'),
(8,2,8,'Cotopaxi'),
(9,2,9,'Chimborazo'),
(10,2,10,'Carchi');
GO

/* ============================================
   7. PERMISOS (Login app_votaciones)
============================================ */
-- Aseguramos que el usuario tenga acceso a las tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Usuarios TO app_votaciones;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Administradores TO app_votaciones;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.AdminCredenciales TO app_votaciones;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Elecciones TO app_votaciones;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Candidatos TO app_votaciones;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Votos TO app_votaciones;
GO

PRINT '=== BASE DE DATOS REINICIADA Y CARGADA CORRECTAMENTE ===';
PRINT 'Usuario Admin: admin@sevotec.ec';
PRINT 'Password: admin123';
GO