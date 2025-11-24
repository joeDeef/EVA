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
    UsuarioID     INT NOT NULL,
    EleccionID    INT NOT NULL,
    CandidatoID   INT NOT NULL,
    Provincia     VARCHAR(100) NOT NULL,
    FechaVoto     DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UsuarioID)    REFERENCES dbo.Usuarios(UsuarioID),
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
INSERT INTO dbo.Usuarios (Cedula, CodigoDactilar, Correo, Nombres, Provincia)
VALUES
('1724915770','V4443V3442','josejoel.defaz@gmail.com','Joel Defaz','Pichincha'),
('0203040506','CD34','user2@mail.com','María López','Pichincha'),
('0304050607','EF56','user3@mail.com','Juan Torres','Guayas'),
('0405060708','GH78','user4@mail.com','Ana Gómez','Loja'),
('0506070809','IJ90','user5@mail.com','Luis Herrera','Manabí'),
('0607080910','KL12','user6@mail.com','Sofía Vega','El Oro'),
('0708091011','MN34','user7@mail.com','Pedro Ramos','Tungurahua'),
('0809101112','OP56','user8@mail.com','Andrea Ruiz','Cotopaxi'),
('0910111213','QR78','user9@mail.com','Daniel Castro','Chimborazo'),
('1011121314','ST90','user10@mail.com','Carla Mendoza','Carchi');
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
('Elección Presidencial 2025','2025-11-01','2025-11-10','Activa'),
('Elección Local Quito','2026-03-01','2026-03-05','Activa'),
('Elección Estudiantil','2025-12-01','2025-12-02','Activa'),
('Elección Comité Empresa','2026-01-10','2026-01-11','Activa'),
('Elección Vecinal','2025-09-15','2025-09-16','Cerrada'),
('Elección Ambiental','2025-08-20','2025-08-21','Archivada'),
('Elección Barrial','2025-10-01','2025-10-02','Cerrada'),
('Elección Directiva','2024-04-01','2024-04-02','Archivada'),
('Elección Provincial','2026-05-10','2026-05-15','Activa'),
('Elección General 2027','2027-02-01','2027-02-10','Activa');
GO

/* ============================================
   INSERTS: CANDIDATOS
============================================ */
INSERT INTO dbo.Candidatos (EleccionID, Nombre, Descripcion)
VALUES
(1,'Candidato A','Propuesta 1'),
(1,'Candidato B','Propuesta 2'),
(1,'Candidato C','Propuesta 3'),
(1,'Candidato D','Propuesta 4'),
(1,'Candidato E','Propuesta 5'),

(2,'Candidato X','Plan 1'),
(2,'Candidato Y','Plan 2'),
(2,'Candidato Z','Plan 3'),
(2,'Candidato W','Plan 4'),
(2,'Candidato V','Plan 5');
GO

/* ============================================
   INSERTS: VOTOS
============================================ */
INSERT INTO dbo.Votos (UsuarioID, EleccionID, CandidatoID, Provincia)
VALUES
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
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Votos TO app_votaciones;
-- SesionTemporal
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.SesionTemporal TO app_votaciones;