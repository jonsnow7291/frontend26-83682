/**
 * Guarda en el equipo del usuario un archivo recibido del backend (PDF, Excel, CSV).
 * @param blob contenido del archivo.
 * @param nombre nombre sugerido para el archivo.
 */
export function descargarArchivo(blob: Blob, nombre: string): void {
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  window.URL.revokeObjectURL(url);
}

/**
 * Abre un PDF en una pestaña nueva (para previsualizar o imprimir).
 * @param blob contenido del PDF.
 */
export function abrirPdf(blob: Blob): void {
  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  window.open(url, '_blank');
}
