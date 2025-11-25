const bcrypt = require('bcrypt');
const { AdminCredencial } = require('../models');

/**
 * Script de migración para cifrar contraseñas existentes
 * Ejecutar solo una vez para actualizar contraseñas no cifradas
 */

async function migrateExistingPasswords() {
  try {
    console.log('🔄 Iniciando migración de contraseñas...');

    // Obtener todas las credenciales
    const credentials = await AdminCredencial.findAll();

    console.log(`📊 Encontradas ${credentials.length} credenciales para revisar`);

    let updated = 0;
    let skipped = 0;

    for (const cred of credentials) {
      const password = cred.HashPassword;
      
      // Verificar si ya está hasheada (bcrypt hashes empiezan con $2a$, $2b$, etc.)
      const isAlreadyHashed = password.startsWith('$2a$') || 
                              password.startsWith('$2b$') || 
                              password.startsWith('$2y$');

      if (isAlreadyHashed) {
        console.log(`⏩ AdminID ${cred.AdminID}: Contraseña ya cifrada, omitiendo...`);
        skipped++;
        continue;
      }

      // Cifrar la contraseña existente
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await cred.update({ HashPassword: hashedPassword });
      
      console.log(`✅ AdminID ${cred.AdminID}: Contraseña cifrada exitosamente`);
      updated++;
    }

    console.log(`\n📈 Migración completada:`);
    console.log(`   • Contraseñas actualizadas: ${updated}`);
    console.log(`   • Contraseñas omitidas: ${skipped}`);
    console.log(`   • Total procesadas: ${credentials.length}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

/**
 * Función para verificar si una contraseña necesita ser migrada
 */
async function checkPasswordMigrationStatus() {
  try {
    const credentials = await AdminCredencial.findAll({
      attributes: ['AdminID', 'HashPassword']
    });

    const results = credentials.map(cred => {
      const isHashed = cred.HashPassword.startsWith('$2a$') || 
                       cred.HashPassword.startsWith('$2b$') || 
                       cred.HashPassword.startsWith('$2y$');
      
      return {
        adminId: cred.AdminID,
        needsMigration: !isHashed,
        passwordFormat: isHashed ? 'bcrypt' : 'plaintext'
      };
    });

    console.log('🔍 Estado de las contraseñas:');
    results.forEach(result => {
      const status = result.needsMigration ? '❌ Necesita migración' : '✅ Ya cifrada';
      console.log(`   Admin ${result.adminId}: ${status} (${result.passwordFormat})`);
    });

    const needsMigration = results.filter(r => r.needsMigration).length;
    console.log(`\n📊 Resumen: ${needsMigration} de ${results.length} contraseñas necesitan migración`);

    return results;

  } catch (error) {
    console.error('❌ Error verificando estado de contraseñas:', error);
    throw error;
  }
}

/**
 * Función para crear un administrador de prueba con contraseña cifrada
 */
async function createTestAdmin() {
  const { Administrador } = require('../models');
  const { Sequelize } = require('sequelize');

  try {
    console.log('👤 Creando administrador de prueba...');

    // Crear administrador
    const testAdmin = await Administrador.create({
      Nombres: 'Test Administrator',
      Correo: 'test@sevotec.ec',
      FechaCreacion: Sequelize.literal('GETDATE()')
    });

    // Crear credenciales cifradas
    const hashedPassword = await bcrypt.hash('test123456', 12);
    
    await AdminCredencial.create({
      AdminID: testAdmin.AdminID,
      HashPassword: hashedPassword,
      FechaCreacion: Sequelize.literal('GETDATE()')
    });

    console.log(`✅ Administrador de prueba creado:`);
    console.log(`   • ID: ${testAdmin.AdminID}`);
    console.log(`   • Correo: ${testAdmin.Correo}`);
    console.log(`   • Contraseña: test123456 (cifrada con bcrypt)`);

    return testAdmin;

  } catch (error) {
    console.error('❌ Error creando administrador de prueba:', error);
    throw error;
  }
}

module.exports = {
  migrateExistingPasswords,
  checkPasswordMigrationStatus,
  createTestAdmin
};

// Si se ejecuta directamente (node migration-script.js)
if (require.main === module) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🔐 Script de migración de contraseñas BCrypt');
  console.log('==========================================\n');

  rl.question('¿Qué operación deseas realizar?\n1) Verificar estado de contraseñas\n2) Migrar contraseñas existentes\n3) Crear administrador de prueba\n\nIngresa el número (1-3): ', async (answer) => {
    try {
      switch(answer.trim()) {
        case '1':
          await checkPasswordMigrationStatus();
          break;
        case '2':
          console.log('\n⚠️  ATENCIÓN: Esta operación modificará las contraseñas en la base de datos.');
          rl.question('¿Estás seguro de continuar? (si/no): ', async (confirm) => {
            if (confirm.toLowerCase() === 'si' || confirm.toLowerCase() === 'yes') {
              await migrateExistingPasswords();
            } else {
              console.log('❌ Operación cancelada');
            }
            rl.close();
          });
          return; // No cerrar aún
        case '3':
          await createTestAdmin();
          break;
        default:
          console.log('❌ Opción no válida');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    rl.close();
  });
}