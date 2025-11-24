USE [master]
GO

-- Crear login a nivel SQL Server
CREATE LOGIN app_votaciones
WITH PASSWORD = 'VotacionesSEVOTEC2025!';

/* ============================================
   CREACIÓN DE BASE DE DATOS
============================================ */
IF DB_ID('SistemaVotacion') IS NULL
    CREATE DATABASE SistemaVotacion;
GO

USE SistemaVotacion;
GO

CREATE USER app_votaciones FOR LOGIN app_votaciones;
GO


/* ============================================
   TABLA: USUARIOS
============================================ */
IF OBJECT_ID('dbo.Usuarios') IS NOT NULL
    DROP TABLE dbo.Usuarios;
GO

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
GO

/* ============================================
   TABLA: ADMINISTRADORES
============================================ */
IF OBJECT_ID('dbo.Administradores') IS NOT NULL
    DROP TABLE dbo.Administradores;
GO

CREATE TABLE dbo.Administradores (
    AdminID        INT IDENTITY(1,1) PRIMARY KEY,
    Nombres        VARCHAR(120) NOT NULL,
    Correo         VARCHAR(120) NOT NULL UNIQUE,
    Activo         BIT NOT NULL DEFAULT 1,
    FechaCreacion  DATETIME NOT NULL DEFAULT GETDATE()
);
GO

/* ============================================
   TABLA: ADMIN_CREDENCIALES
============================================ */
IF OBJECT_ID('dbo.AdminCredenciales') IS NOT NULL
    DROP TABLE dbo.AdminCredenciales;
GO

CREATE TABLE dbo.AdminCredenciales (
    CredencialID  INT IDENTITY(1,1) PRIMARY KEY,
    AdminID       INT NOT NULL,
    HashPassword  VARCHAR(255) NOT NULL,
    Salt          VARCHAR(255) NULL,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES dbo.Administradores(AdminID)
);
GO

/* ============================================
   TABLA: ELECCIONES
============================================ */
IF OBJECT_ID('dbo.Elecciones') IS NOT NULL
    DROP TABLE dbo.Elecciones;
GO

CREATE TABLE dbo.Elecciones (
    EleccionID      INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          VARCHAR(200) NOT NULL,
    FechaInicio     DATETIME NOT NULL,
    FechaFin        DATETIME NOT NULL,
    Estado          VARCHAR(20) NOT NULL DEFAULT 'Activa',
    FechaCreacion   DATETIME NOT NULL DEFAULT GETDATE()
);
GO

/* ============================================
   TABLA: CANDIDATOS
============================================ */
IF OBJECT_ID('dbo.Candidatos') IS NOT NULL
    DROP TABLE dbo.Candidatos;
GO

CREATE TABLE dbo.Candidatos (
    CandidatoID    INT IDENTITY(1,1) PRIMARY KEY,
    EleccionID     INT NOT NULL,
    Nombre         VARCHAR(150) NOT NULL,
    Descripcion    VARCHAR(300) NULL,
    Partido        VARCHAR(100) NULL,
    Activo         BIT NOT NULL DEFAULT 1,
    FechaCreacion  DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (EleccionID) REFERENCES dbo.Elecciones(EleccionID)
);
GO

/* ============================================
   TABLA: VOTOS
============================================ */
IF OBJECT_ID('dbo.Votos') IS NOT NULL
    DROP TABLE dbo.Votos;
GO

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
GO

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
   RESTRICCIÓN: Un usuario = 1 voto por elección
============================================ */
IF EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'UX_Voto_Unico'
      AND object_id = OBJECT_ID('dbo.Votos')
)
    DROP INDEX UX_Voto_Unico ON dbo.Votos;
GO

CREATE UNIQUE INDEX UX_Voto_Unico 
ON dbo.Votos (UsuarioID, EleccionID);
GO

/* ============================================
   TRIGGER: Marcar HaVotado
============================================ */
IF OBJECT_ID('dbo.trg_MarcarUsuarioVoto', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_MarcarUsuarioVoto;
GO

CREATE TRIGGER dbo.trg_MarcarUsuarioVoto
ON dbo.Votos
AFTER INSERT
AS
BEGIN
    UPDATE U
    SET HaVotado = 1
    FROM dbo.Usuarios U
    INNER JOIN inserted i ON i.UsuarioID = U.UsuarioID;
END;
GO

/* ============================================
   INSERTS: USUARIOS
============================================ */
INSERT INTO dbo.Usuarios (Cedula, CodigoDactilar, Correo, Nombres, Provincia, HaVotado)
VALUES
('1721354687','V4443V3442','josejoel.defaz@gmail.com','Joel Defaz','Pichincha',0),
('0204567893','CD34','user2@mail.com','María López','Pichincha',0),
('0309876543','EF56','user3@mail.com','Juan Torres','Guayas',0),
('0405678916','GH78','user4@mail.com','Ana Gómez','Loja',0),
('0506789124','IJ90','user5@mail.com','Luis Herrera','Manabí',0),
('0603456785','KL12','user6@mail.com','Sofía Vega','El Oro',0),
('0702345671','MN34','user7@mail.com','Pedro Ramos','Tungurahua',0),
('0804567815','OP56','user8@mail.com','Andrea Ruiz','Cotopaxi',0),
('0912345674','QR78','user9@mail.com','Daniel Castro','Chimborazo',0),
('1015678932','ST90','user10@mail.com','Carla Mendoza','Carchi',0);
GO

/* ============================================
   INSERTS: ADMINISTRADORES
============================================ */
INSERT INTO dbo.Administradores (Nombres, Correo)
VALUES
('Admin 1','admin1@mail.com'),
('Admin 2','admin2@mail.com'),
('Admin 3','admin3@mail.com'),
('Admin 4','admin4@mail.com'),
('Admin 5','admin5@mail.com'),
('Admin 6','admin6@mail.com'),
('Admin 7','admin7@mail.com'),
('Admin 8','admin8@mail.com'),
('Admin 9','admin9@mail.com'),
('Admin 10','admin10@mail.com');
GO

/* ============================================
   INSERTS: ADMIN_CREDENCIALES
============================================ */
INSERT INTO dbo.AdminCredenciales (AdminID, HashPassword, Salt)
VALUES
(1,'hash1','salt1'),
(2,'hash2','salt2'),
(3,'hash3','salt3'),
(4,'hash4','salt4'),
(5,'hash5','salt5'),
(6,'hash6','salt6'),
(7,'hash7','salt7'),
(8,'hash8','salt8'),
(9,'hash9','salt9'),
(10,'hash10','salt10');
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

-- Dar permisos mínimos sobre las tablas necesarias
-- Usuarios
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Usuarios TO app_votaciones;
-- Administradores
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Administradores TO app_votaciones;
-- AdminCredenciales
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.AdminCredenciales TO app_votaciones;
-- Elecciones
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Elecciones TO app_votaciones;
-- Candidatos
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Candidatos TO app_votaciones;
-- Votos
GRANT SELECT, INSERT ON dbo.Votos TO app_votaciones;
-- SesionTemporal
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.SesionTemporal TO app_votaciones;