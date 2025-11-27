Carpeta para figuras del documento.

Coloca aquí los archivos de imagen referenciados por los capítulos, por ejemplo:
- caso_de_uso_gestion_propuestas.png
- usuarios.png
- caso_de_uso_gestion_archivos.png

Si quieres generar imágenes placeholder en Windows con ImageMagick, puedes usar PowerShell y `magick` (instala ImageMagick primero):

```powershell
magick -size 900x600 xc:white -gravity center -pointsize 20 -annotate 0 "Diagrama pendiente: caso_de_uso_gestion_propuestas" caso_de_uso_gestion_propuestas.png
magick -size 900x600 xc:white -gravity center -pointsize 20 -annotate 0 "Diagrama pendiente: usuarios" usuarios.png
magick -size 900x600 xc:white -gravity center -pointsize 20 -annotate 0 "Diagrama pendiente: gestion archivos" caso_de_uso_gestion_archivos.png
```

Alternativamente, dime si quieres que genere placeholders básicos yo mismo (requiere crear archivos binarios PNG en el repo).