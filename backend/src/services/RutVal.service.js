export function validarRUT(rut) {
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();

    if (cuerpo.length < 7) {
        return false;
    }

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += multiplo * parseInt(cuerpo[i]);
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dv === dvCalculado;
}
