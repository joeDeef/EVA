
function validarCedula(cedula) {
  if (!cedula) return false;
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const digitoVerificador = parseInt(cedula[9], 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10);

    if (i % 2 === 0) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }

    suma += valor;
  }

  const decenaSuperior = Math.ceil(suma / 10) * 10;
  const resultado = decenaSuperior - suma;

  return (resultado === 10 ? 0 : resultado) === digitoVerificador;
}

module.exports = validarCedula;
