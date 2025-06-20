---
title: Security Footage Tryhackme Walkthrought
published: true
---

![intro](https://github.com/user-attachments/assets/7f4c5f35-90cb-4886-9585-a32254d3059d)

# Introducción
He estado resolviendo retos en TryHackMe, y el reto de "Security Footage" me ha gustado mucho. En este reto, podemos aprender cómo se pueden recuperar las imágenes desde una captura de Wireshark para recrear un video de una cámara de vigilancia.

# Analizando el archivo .pcap
El reto nos pide recuperar un video de una cámara de vigilancia, pero solo disponemos de una captura de Wireshark. Al analizarla, vemos que la IP "10.0.2.15" ha iniciado una conexión no cifrada con la cámara y esta está mostrando video.

![1](https://github.com/user-attachments/assets/f7f3603d-51c6-42ab-af7f-b543af95e798)

Si hacemos clic derecho y seguimos la cadena, podremos analizar que no se está enviando video, sino que se están mandando muchas imágenes. Para extraer las imágenes de esta captura, podemos ir al apartado de "Mostrar como" en formato "raw" y guardar el archivo para su posterior descompresión. En mi caso, guardaré el archivo como "cadena.fjpeg", que es el formato que normalmente utilizan las cámaras de vigilancia.

![2](https://github.com/user-attachments/assets/2bc9727d-61c5-4b97-a889-465f12fe5c41)

# Obtener las imágenes

Con la herramienta ffmpeg podremos extraer todas las imágenes del archivo que hemos creado anteriormente. El comando hace lo siguiente:

- `-i ./cadena.fjpeg`: Aquí le decimos al programa cuál archivo usar como entrada, en este caso, `cadena.fjpeg`. Puede ser un video o una imagen, dependiendo de lo que quieras convertir.
- `-q:v 2`: Esto ajusta la calidad de las imágenes JPEG que se generan. El número `2` indica una calidad bastante alta, ya que en esta escala, donde 1 es la mejor y 31 la peor, un valor más bajo significa mejor calidad.
- `imagen_%04d.jpg`: Este es el patrón que usará para nombrar los archivos de salida. `%04d` será reemplazado por un número secuencial de cuatro dígitos. Así, las imágenes saldrán como `imagen_0001.jpg`, `imagen_0002.jpg`, etc.

![3](https://github.com/user-attachments/assets/4a1da9af-b810-4833-93be-c6c1c1f0b43d)

![4](https://github.com/user-attachments/assets/26716d01-895d-4a71-bba6-6dd4b2eefe03)

# Volver a montar el video
Ahora que ya tenemos todas las imágenes del video, solo falta juntarlas y montar el video de nuevo. Utilizando la misma herramienta de antes y estos parámetros, podremos hacerlo:

- `-framerate 10`: Este ajuste establece que el video final reproduzca 10 imágenes por segundo. Es decir, verás 10 cuadros en cada segundo de video.
- `-i ./imagen_%04d.jpg`: Este patrón indica cómo nombrar las imágenes de entrada, que deben estar numeradas en orden (como `imagen_0001.jpg`, `imagen_0002.jpg`, y así sucesivamente).
- `-c:v libx264`: Aquí se usa el códec `libx264`, que es muy popular para comprimir videos en el formato H.264, permitiendo buena calidad con un tamaño de archivo moderado.
- `-pix_fmt yuv420p`: Esto configura el formato de píxeles del video de salida para que sea compatible con la mayoría de los reproductores, asegurando que puedas verlo sin problemas.
- `video_reconstruido.mp4`: Es el nombre del archivo final, el video que se genera y que podrás reproducir en cualquier dispositivo compatible con MP4.

![5](https://github.com/user-attachments/assets/2670d04e-d849-457c-9d0b-d02732c9f673)

Una vez vuelto a montar el video, podremos ver la flag que necesitamos para resolver el reto.

![6](https://github.com/user-attachments/assets/0a965381-4caf-4919-8a8e-4b040a72cb5e)

# Conclusión
Con este ejercicio, aprendimos a extraer imágenes de un archivo .pcap usando "Wireshark" y a reconstruir un video a partir de esas imágenes con "ffmpeg". Este proceso no solo nos ayuda a entender cómo se transmiten los datos en redes no cifradas, sino que también muestra lo útiles que son las herramientas de análisis y conversión de medios en la ciberseguridad. Al lograr recuperar el video de la cámara de vigilancia, no solo completamos el reto, sino que también adquirimos conocimientos que podemos aplicar en situaciones reales.

![ken](https://github.com/user-attachments/assets/2d06bc15-58d3-4395-b8fd-79f90e481a3b)
