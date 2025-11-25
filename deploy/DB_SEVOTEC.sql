USE [master]
GO

-- Crear login a nivel SQL Server
CREATE LOGIN app_votaciones
WITH PASSWORD = 'VotacionesSEVOTEC2025!';

/* ============================================
   CREACIÓN DE BASE DE DATOS
============================================ */
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SistemaVotacion')
BEGIN
    CREATE DATABASE [SistemaVotacion];
END
GO

USE [SistemaVotacion];
GO

CREATE USER app_votaciones FOR LOGIN app_votaciones;
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
    Partido        VARCHAR(100) NULL,
    Activo           BIT NOT NULL DEFAULT 1,
    FechaCreacion    DATETIME NOT NULL DEFAULT GETDATE(),
    ImagenURL        VARCHAR(300) NULL,
    FOREIGN KEY (EleccionID) REFERENCES dbo.Elecciones(EleccionID),
);

-- VOTOS (Hija de Usuarios, Elecciones y Candidatos)
CREATE TABLE dbo.Votos (
    VotoID        INT IDENTITY(1,1) PRIMARY KEY,
    EleccionID    INT NOT NULL,
    CandidatoID   INT NOT NULL,
    Provincia     VARCHAR(100) NOT NULL,
    FechaVoto     DATETIME NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (EleccionID)   REFERENCES dbo.Elecciones(EleccionID),
    FOREIGN KEY (CandidatoID)  REFERENCES dbo.Candidatos(CandidatoID)
);

-- SESIÓN TEMPORAL
CREATE TABLE SesionTemporal (
    token VARCHAR(200) PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL,
    email VARCHAR(200) NOT NULL,
    verified BIT DEFAULT 0,
    expiresAt BIGINT NOT NULL,
    createdAt DATETIME2 DEFAULT GETUTCDATE(),
    updatedAt DATETIME2 DEFAULT GETUTCDATE()
);


/* ============================================
   INSERTS: USUARIOS
============================================ */
INSERT INTO dbo.Usuarios (Cedula, CodigoDactilar, Correo, Nombres, Provincia, HaVotado)
VALUES
('1724915770','V4443V3442','josejoel.defaz@gmail.com','Joel Defaz','Pichincha',0),
('1500958069','D4443D3442','user2@mail.com','Issac de la Cadena','Napo',0),
('1729715779','A1234B5678','mibasuraenbinario@outlook.com','Santiago Murillo','Azuay',0),
('1715836811','D5268E5652','mari.sol@gmail.com','Maribel Lopez','Guayas',0),
('0502352917','G5895H7836','josue.iza@gmail.com','Josue Iza','Loja',0)
GO

/* ============================================
   INSERTS: ADMINISTRADORES
============================================ */
INSERT INTO dbo.Administradores (Nombres, Correo) VALUES
('Super Admin','admin@sevotec.ec'),
('Issac de la Cadena','issac.delacadena@gmail.com'),
('Joel Defaz','joel.defaz@gmail.com'),
('Santiago Murillo','santiago.murillo@gmail.com')
GO

/* ============================================
   INSERTS: ADMIN_CREDENCIALES
============================================ */
INSERT INTO dbo.AdminCredenciales (AdminID, HashPassword, Salt)
VALUES
(1,'admin123','salt1'), 
(2,'issac2025','salt2'),
(3,'joel2025','salt3'),
(4,'santiago2025','salt4')
GO

/* ============================================
   INSERTS: ELECCIONES
============================================ */
INSERT INTO dbo.Elecciones (Nombre, FechaInicio, FechaFin, Estado)
VALUES
('Consulta Popular 2025','2025-11-24 06:00','2025-11-25 23:00','Activa'),
('Elección Local Quito','2026-03-01 06:00','2026-03-05 18:00','Cerrado')
GO

/* ============================================
   INSERTS: CANDIDATOS
============================================ */
INSERT INTO dbo.Candidatos (EleccionID, Nombre, Descripcion, Partido)
VALUES
(1,'Pregunta A','Bases Militares','Partido A'),
(1,'Pregunta B','Reelección Presidencial','Partido B'),
(1,'Pregunta C','Circo','Partido C'),
(1,'Pregunta D','Constitución','Partido D'),
(1,'Voto Blanco','Sin elección','Ninguno'),
(1,'Voto Nulo','Ninguno','Ninguno'),
(2,'Candidato X','Plan 1','Partido X'),
(2,'Candidato Y','Plan 2','Partido Y')
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
GRANT SELECT, INSERT ON dbo.Votos TO app_votaciones;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.SesionTemporal TO app_votaciones;

PRINT '=== BASE DE DATOS REINICIADA Y CARGADA CORRECTAMENTE ===';
PRINT 'Usuario Admin: admin@sevotec.ec';
PRINT 'Password: admin123';
GO