---
title: Soulmate WriteUp Hack The Box
published: true
---
# Introducción

**Soulmate** es una máquina sencilla. Tendremos que acceder a una página web de citas, descubrir un subdominio para compartir archivos, utilizar un exploit para crear un usuario con privilegios de administrador, cambiar la contraseña de un usuario y acceder a él para establecer una conexión remota.

Una vez dentro, buscaremos en la máquina archivos que contengan la contraseña del usuario de SSH y escalaremos privilegios utilizando **ssh_runner**, ya que permite ejecutar comandos con permisos de administrador.

<img src="https://github.com/user-attachments/assets/c9cac3b2-b7ce-43f7-a064-989fa0b8b388" />

# Reconocimiento
Comenzaremos nuestra etapa de reconocimiento con un **nmap** simple y encontraremos el puerto **22**, que no nos interesa por el momento, ya que no tenemos ningún usuario ni contraseña. También encontraremos el puerto **80**, al que podremos acceder desde el navegador.

<img src="https://github.com/user-attachments/assets/34e2d311-5e0e-43f9-8bc0-6d6ea4841999" />

Al añadir el dominio a nuestro **/etc/hosts** e intentar acceder al puerto **80**, veremos la siguiente página.

<img src="https://github.com/user-attachments/assets/758c05d3-49d1-4889-91af-f8d98a9b699e" />

No tiene mucha información, así que crearemos una cuenta para ver si podemos escalar a partir de ella.

<img src="https://github.com/user-attachments/assets/e4c3e423-479e-4ad0-bd47-2132ed66c7db" />

Una vez dentro, no encontramos botones o funciones nuevas, así que realizaremos **fuzzing** para descubrir directorios o subdominios ocultos.

<img src="https://github.com/user-attachments/assets/4f0d58fe-6c47-45c4-a1dd-e6bf27bad485" />

Utilizando la herramienta **ffuf**, enumeraremos los directorios de la página web, pero tampoco encontramos nada interesante al que podamos acceder.

<img src="https://github.com/user-attachments/assets/d42f8789-5e8e-4052-a57c-fa67717537f0" />

Intentémoslo con subdominios. Al hacerlo de esta forma, descubriremos que existe **ftp.soulmate.htb**.

<img src="https://github.com/user-attachments/assets/dddd1724-b266-4f59-b7cb-087a61d2e849" />

Cuando accedemos a este subdominio, veremos que utiliza la aplicación **CrushFTP**.

<img src="https://github.com/user-attachments/assets/0b58fd9f-1a01-4eaf-a0a5-c25230730639" />

# Explotación
Al analizar el HTML de la página, encontraremos que la aplicación usa la versión **11.W.657**, que es vulnerable a este [payload](https://github.com/Immersive-Labs-Sec/CVE-2025-31161) 

<img src="https://github.com/user-attachments/assets/8e4fcd7c-8b59-403a-a0a6-6840afe9dd7c" />

Este payload nos permite crear un nuevo usuario administrador, así que crearemos uno para acceder sin las credenciales de administrador.

<img src="https://github.com/user-attachments/assets/d7f896e2-464a-4f5e-ad3b-d2a02fe5b1de" />

Una vez dentro, encontraremos un FTP para compartir archivos y también accederemos al panel de administrador.

<img src="https://github.com/user-attachments/assets/0f9c2fab-f03d-48d6-8dd4-ae565a857a75" />

En el panel de administrador, encontraremos varias secciones, pero nos centraremos en la sección **"User Manager"**. Allí estarán todos los usuarios creados en el sistema. Lo más interesante es que podremos ver los archivos que tienen guardados los usuarios. En este caso, el usuario **ben** tiene una carpeta llamada **"webProd"**, que sugiere que allí se almacena toda la página web que hemos visto antes.

<img src="https://github.com/user-attachments/assets/ebcdef87-46b3-4820-893f-8b0a104fdc66" />

Como somos administradores, podemos cambiar la contraseña del usuario **ben**. Nos copiaremos su nueva contraseña e intentaremos acceder con ella en el sistema.

<img src="https://github.com/user-attachments/assets/388ae338-4f95-4768-bebd-c665a5c2bcb8" />

Una vez dentro, podemos acceder a la carpeta de la página web en producción y añadir archivos.

<img src="https://github.com/user-attachments/assets/822b1b75-0ffa-4fd9-b660-177c1fde0784" />

Dentro de la raíz de la web, añadiremos un script para que, al ejecutarlo desde el navegador, podamos recibir una conexión remota.

<img src="https://github.com/user-attachments/assets/ffd03620-e4b1-4f05-8c08-730b04fe106a" />

Preparamos nuestro **netcat** y ejecutaremos el script desde el navegador. Ahora hemos escalado como el usuario **www-data**.

<img src="https://github.com/user-attachments/assets/2482c5a3-4295-4fad-96cf-863ad1e256f7" />

Si realizamos un reconocimiento a todos los archivos de la máquina, encontraremos un login de **Erlang**. Si abrimos los scripts de configuración, encontraremos las credenciales del usuario **ben** para el SSH. Además, podemos ver que hay un **ssh_runner** dentro del sistema por el puerto **2222**.

<img src="https://github.com/user-attachments/assets/94c4e48b-d62f-492e-a64d-d525a1da4657" />

Para investigar esa parte de la máquina, primero tendremos que acceder al SSH de la máquina como el usuario **ben** y obtener la primera flag.

<img src="https://github.com/user-attachments/assets/4400a148-5cde-495c-b888-48f0c11c0577" />

# Escalada de privilegios
Ya estamos dentro, así que investiguemos ese puerto oculto. Con este comando, listaremos todos los puertos que se están utilizando en la máquina, y el puerto **2222** está funcionando con el **ssh_runner**.

<img src="https://github.com/user-attachments/assets/94c79e6e-1e2e-40b4-aa3a-7b968f13c5cd" />

Como hemos visto en el script anterior, tenemos las credenciales para acceder, así que entraremos como el usuario **ben**.

<img src="https://github.com/user-attachments/assets/fa3a756c-c2e7-429e-8df1-b20125de05c1" />

La aplicación **ssh_runner** nos permite ejecutar comandos desde el sistema, así que podemos obtener la flag desde aquí utilizando el comando `os:cmd(cat /root/flag.txt)`, o de la forma que se muestra en la siguiente imagen, que creo que es la forma intencionada: creando una conexión remota que nos permita acceder como el usuario **root**.

<img src="https://github.com/user-attachments/assets/72ffa8fa-c269-4fb1-ace3-6d36860f1d95" />

Al ejecutar el comando, deberíamos poder ver el contenido de la flag en la terminal. Esto nos permitirá confirmar que hemos escalado correctamente los privilegios y que ahora tenemos acceso completo al sistema.

# Conclusión
La identificación de la aplicación **CrushFTP** y su vulnerabilidad nos permitió crear un usuario administrador, lo que facilitó el acceso a información sensible y la posibilidad de manipular archivos en el servidor. Además, el uso de herramientas como **Ffuf** y **ssh_runner** ha demostrado ser esencial para descubrir directorios ocultos y ejecutar comandos con privilegios elevados.

![ken](https://github.com/user-attachments/assets/36bb0edb-1726-4d0e-8cd8-a8f24b2f83ed)
