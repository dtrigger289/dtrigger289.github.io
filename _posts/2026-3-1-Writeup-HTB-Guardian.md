---
title: Guardian WriteUp Hack The Box
published: true
---

# Introducción

La máquina **Guardian** es posiblemente la más difícil y extensa que he resuelto hasta la fecha. 

Esta máquina está compuesta por vulnerabilidades que involucran usuarios con credenciales por defecto, inyección de parámetros en la URL y varios ataques XSS para obtener cookies. Explotaremos tokens CSRF para crear usuarios con privilegios de administrador y así escalar nuestros privilegios. Una vez que tengamos acceso como administradores del sitio web, utilizaremos una vulnerabilidad de **Local File Inclusion** para establecer una conexión remota, acceder a la máquina como el usuario **www-data**, encontrar las credenciales de **jamil** en una base de datos y crackearlas utilizando una sal que acompaña a los hashes.

Una vez dentro de la máquina como **jamil**, encontraremos aplicaciones mal configuradas que nos permitirán escalar privilegios al usuario **mark**. Con este usuario, observaremos que puede ejecutar como administrador la herramienta **safeapachectl**. Finalmente, crearemos un módulo de configuración que nos permitirá establecer una conexión remota como el usuario **root** y obtendremos la flag final.

<img alt="guardian" src="https://github.com/user-attachments/assets/2a28f204-0cf6-4a2e-8ef8-edf67ae95686" />

# Enumeración
Comenzamos enumerando los puertos abiertos de la máquina. En este caso, tiene abierto el puerto **22**, que no podremos atacar de inmediato porque no tenemos usuarios, y no merece la pena gastar tiempo realizando ataques de fuerza bruta. Además, tenemos el puerto **80**; por lo tanto, debemos añadir la IP de la máquina y el dominio a nuestro archivo **/etc/hosts** para acceder a la web.

<img alt="1" src="https://github.com/user-attachments/assets/8d74f34b-db35-4add-b150-2124a8977884" />

Al acceder al puerto **80** con el navegador, veremos una página de bienvenida sobre **Guardian University**.

<img alt="2" src="https://github.com/user-attachments/assets/c020ad80-d19a-43f7-81c5-f28f76d18d98" />

Si investigamos un poco la web, encontraremos mensajes sobre estudiantes, donde podremos anotar posibles usuarios y cuentas para realizar ataques de fuerza bruta.

<img alt="3" src="https://github.com/user-attachments/assets/e79e7b15-d647-48e8-b57c-8c3b2d4a83d7" />

Si pulsamos en el botón "student portal" en la página principal, este nos redirige a **portal.guardian.htb**, por lo que debemos añadirlo a **/etc/hosts**. En este inicio de sesión, aparece una ventana emergente que nos indica que consultemos la guía del portal.

<img alt="4" src="https://github.com/user-attachments/assets/17770303-a127-48f6-a3d2-ce21975f40a4" />

Si hacemos clic en el enlace de la ventana emergente antes de que desaparezca, veremos una guía sobre cómo usar el portal. Al parecer, a los estudiantes se les asigna una contraseña por defecto al crear una cuenta.

<img alt="5" src="https://github.com/user-attachments/assets/ead0f804-5aab-4dbd-8816-9c3ab68f4b79" />

Utilizando los usuarios que encontramos al principio, descubrimos que el usuario **GU0142023** no ha modificado su contraseña todavía, lo que nos permite acceder a su cuenta.

<img alt="6" src="https://github.com/user-attachments/assets/4dbf2f24-bb35-4fa3-857e-46a783bd3205" />

Una vez dentro de la plataforma, veremos distintas secciones como "My Courses", "Assignments", "Grades", etc.

<img alt="7" src="https://github.com/user-attachments/assets/77dc7520-3e90-405b-a6e6-829b1d76c246" />

Si navegamos un poco por la sección de "Chat", notaremos que tiene una URL algo extraña. Podemos realizar ataques de fuerza bruta y probar combinaciones para encontrar conversaciones a las que no deberíamos tener acceso.

<img alt="8" src="https://github.com/user-attachments/assets/241556a2-c8e5-40b0-804a-a6fe33143b40" />

Después de un rato de prueba y error, encontraremos una conversación entre **jamil** y el usuario **admin**. En esta conversación, el usuario **admin** le proporciona la contraseña en texto plano de la plataforma **Gitea**. Esto nos permitirá investigar y aprender cómo funciona la aplicación web.

<img alt="9" src="https://github.com/user-attachments/assets/48725c20-619c-4c35-b0dd-d1115adfb506" />

Si accedemos al subdominio de **Gitea** e iniciamos sesión con las credenciales de **jamil** que obtuvimos anteriormente, veremos que existen dos repositorios: **portal.guardian.htb** y **guardian.htb**.

<img alt="11" src="https://github.com/user-attachments/assets/a0b8fb36-66f0-46bd-ab18-e2e96c714f34" />

Investigando, encontraremos que dentro del repositorio **portal.guardian.htb** existe un archivo de configuración llamado **config.php**, donde veremos las credenciales de la base de datos, que pueden ser útiles para seguir escalando.

<img alt="12" src="https://github.com/user-attachments/assets/42978967-51ee-4f30-906f-204ae87658df" />

Cuando te encuentres en situaciones donde no sabes cómo continuar, lo primero que debes preguntarte es: "¿Qué aplicaciones y versiones están corriendo?". Al buscar por aplicaciones, encontraremos **phpoffice** con una versión vulnerable.

<img alt="14" src="https://github.com/user-attachments/assets/eb61a4bd-c9f8-4f05-a7d0-06f2e1ee9634" />


# Explotación
Una vez enumerado todo lo que podamos sobre la aplicación que queremos vulnerar, debemos investigar las vulnerabilidades de las aplicaciones que hemos encontrado. En este caso, podemos ver en el siguiente GitHub que la versión que se está utilizando es vulnerable a **XSS** en la función **generateNavigation()**.

Como se muestra en la [prueba de concepto](https://github.com/PHPOffice/PhpSpreadsheet/security/advisories/GHSA-79xx-vf93-p7cx), tendremos que generar un archivo **.xlsx** e introducir un payload XSS en la segunda pestaña del documento. En mi caso, utilizaré una web como [Treegrid](https://www.treegrid.com/FSheet) para generarlo.

Nota: He probado con distintas herramientas para crear archivos **.xlsx**, como Microsoft Office, Google Sheets o Calc de LibreOffice, pero no ha funcionado. Si alguien sabe por qué, por favor escríbelo en la sección de comentarios de la publicación de LinkedIn.

<img alt="15" src="https://github.com/user-attachments/assets/a3b77b0c-68d9-4abf-8bba-85f4eeb81fe0" />

Una vez introducido el payload, abriremos nuestro servidor con Python para recibir las peticiones con la cookie del usuario que abra el archivo que hemos creado anteriormente.

<img alt="16" src="https://github.com/user-attachments/assets/7c2ca351-3070-42a9-bb88-3ea315e1e8b0" />

Finalmente, solo queda enviar el archivo y esperar a que alguien lo abra.

<img alt="17" src="https://github.com/user-attachments/assets/7d3b6f4f-5b85-457e-983d-45942326892d" />

Después de un rato, recibiremos la cookie del usuario que ha abierto el archivo.

<img alt="18" src="https://github.com/user-attachments/assets/a8c429bd-19b8-438e-bcc7-2f81afac3f17" />

Ahora podremos modificar nuestra cookie en el navegador y acceder al panel de "Lecturer".

<img alt="19" src="https://github.com/user-attachments/assets/f43af2de-d7bd-41ba-89c3-c24ad99dc44a" />

Tenemos nuevas secciones que investigar, como "Notice Board" y "Submissions". Si examinamos detenidamente la sección de "Notice Board", podemos ver qué tipo de peticiones utiliza este sitio.

<img alt="20" src="https://github.com/user-attachments/assets/00025dee-9b85-4f10-8e8c-7cfa75ba6063" />

Con la herramienta **Burp Suite**, podemos interceptar la petición de "Create Notice" para ver qué parámetros requiere la web. Probemos a crear una noticia indicando el título, el contenido y un enlace de referencia para que lo revise el usuario admin. Para este último apartado, abriré un servidor HTTP con Python para ver si realmente algún usuario abre el archivo.

<img alt="22" src="https://github.com/user-attachments/assets/00f26c48-0b93-4f73-a8b5-98ddfc4c2b22" />

Con **Burp Suite**, interceptaremos la petición para ver qué parámetros son necesarios para crear una noticia. Como se puede ver en la imagen, lo más importante que necesitaremos es un **token CSRF**.

<img alt="21" src="https://github.com/user-attachments/assets/83d3ac74-8cce-44a3-a2b1-96a330b59db6" />

Continuando con la petición, después de un rato, un usuario abre el archivo **.txt** que he dejado expuesto.

<img alt="23" src="https://github.com/user-attachments/assets/6dc7c6aa-2615-4426-a67f-2c675283abaa" />

Volvamos a **Gitea** y entendamos cómo funcionan estos parámetros. En el archivo **csrf-token.php**, descubriremos que los tokens se guardan en el directorio **/config/tokens.json**.

<img alt="24" src="https://github.com/user-attachments/assets/5e01ad07-132e-4ad8-b051-0dbedf094da9" />

Además, podemos ver cómo crear un usuario. Necesitamos investigar cómo funciona, ya que el usuario admin va a abrir nuestro archivo. Podemos crear un formulario para que el usuario admin lo ejecute y así escalar privilegios.

<img alt="25" src="https://github.com/user-attachments/assets/c8216a05-cb64-4548-9d80-ea933ae4c65d" />

Comencemos creando el formulario que pulsará el usuario. Necesitaremos indicar a dónde apunta (en este caso, a **createuser.php**), el token CSRF que generaremos después, todos los parámetros que hemos visto antes y un script para que, al abrir el archivo, se ejecute el formulario.

<img alt="26" src="https://github.com/user-attachments/assets/2bccd832-cd46-4356-96b9-794b79a28bf4" />

Generaremos un token CSRF enviando una petición para crear una noticia.

<img alt="29" src="https://github.com/user-attachments/assets/75262465-525a-4c82-a308-d4759e89b7ff" />

En el directorio que hemos visto antes, se generarán los tokens.

<img alt="30" src="https://github.com/user-attachments/assets/deebd408-aa16-40ac-8c25-8efc97cde294" />

Añadimos nuestro token CSRF a nuestro archivo **.html** y abrimos nuestro servidor HTTP.

<img alt="31" src="https://github.com/user-attachments/assets/a8d5037e-a1b4-47ea-b00e-837e08435b51" />

Finalmente, crearemos la noticia enviándola con **Burp Suite** y esperaremos a que el usuario admin abra el formulario.

<img alt="32" src="https://github.com/user-attachments/assets/758488d3-ee6f-42e3-8660-ef04a9fdbbd0" />

Como se ve en la imagen, el usuario admin ha accedido a nuestro archivo HTML. Ahora queda ver si el usuario que hemos especificado en el formulario se ha creado correctamente.

<img alt="28" src="https://github.com/user-attachments/assets/e9b85fba-e474-4cd7-8c71-b468a799d63e" />

¡Lo hemos conseguido! Hemos escalado hasta el usuario admin, y ya queda menos para acceder a la máquina.

<img alt="33" src="https://github.com/user-attachments/assets/f24229e0-be63-4f54-903c-e524cffa50e5" />

Accedemos al apartado de "Reports", ya que es la sección que no tiene ningún usuario anterior. En este apartado, podemos ver un potencial **Local File Inclusion** en la URL.

<img alt="34" src="https://github.com/user-attachments/assets/07bc8bda-10fa-4901-b42b-5d22012ff863" />

Si miramos el código fuente, podemos confirmar que existe la vulnerabilidad.

<img alt="35" src="https://github.com/user-attachments/assets/83a8e69f-4b74-4515-8b1f-49cb223ea6ff" />

Utilizando esta [herramienta](https://github.com/synacktiv/php_filter_chain_generator), podemos generar un payload que nos permita explotar la **Local File Inclusion** y, además, generar una reverse shell. Primero, modifiquemos el código para que utilice uno de los archivos de la web.

<img alt="36" src="https://github.com/user-attachments/assets/904e6075-83a1-4505-939a-8e7f76003624" />

Probamos a generar un payload que cargue código; en este caso, que muestre la información de PHP que tenga instalada.

<img alt="37" src="https://github.com/user-attachments/assets/fb219bbb-6e09-4c8e-b38d-8de20136d419" />

Si copiamos y pegamos todo el payload, comprobaremos que existe la vulnerabilidad, ya que muestra el panel de información de PHP.

<img alt="38" src="https://github.com/user-attachments/assets/08e3a86d-edb3-4b76-9c31-3b20e46a81ee" />

Probemos con la conexión remota. Como sabemos que tiene PHP, intentemos crear una conexión remota utilizando PHP.

<img alt="39" src="https://github.com/user-attachments/assets/fad6dae2-a9b2-4593-994c-9cf261744134" />

Activamos nuestro **netcat** y pegamos el payload en la URL. Así es como hemos logrado conectarnos a la máquina.

<img alt="40" src="https://github.com/user-attachments/assets/779e896d-81cc-4174-86db-708dc4105871" />

¿Recuerdas cuando encontramos las credenciales de la base de datos en el código?

<img alt="41" src="https://github.com/user-attachments/assets/c1f0eff2-792b-45c7-b977-952ced031ef7" />

El usuario **www-data** puede acceder a la base de datos, así que nosotros también.

<img alt="42" src="https://github.com/user-attachments/assets/21e6ff9d-6b15-4781-972b-97e111fd19a0" />

Si copiamos los hashes e intentamos crackearlos, no lo conseguiremos, ya que, como se puede ver en el código fuente, los hashes tienen una sal que debemos tener en cuenta al crackearlos. Para hacerlo con la herramienta **Hashcat**, tendremos que añadir la sal de la siguiente forma.

<img alt="43" src="https://github.com/user-attachments/assets/b90e0515-eb76-422e-9cf4-a71a2de9197a" />

Después de unos 2 minutos, obtendremos las contraseñas en texto plano de **admin** y **jamil**.

<img alt="45" src="https://github.com/user-attachments/assets/fef69805-c10e-4d6b-a4ce-e020be4f111b" />

Si probamos a iniciar sesión en el **SSH** con ellas, descubriremos que **jamil** sí puede acceder al **SSH**. Finalmente, hemos llegado a la primera mitad de la máquina.

<img alt="46" src="https://github.com/user-attachments/assets/86198cd2-f0ee-429d-b9fa-6bfba3c37047" />

Con esto, hemos completado una parte significativa del proceso de explotación de la máquina **Guardian**. Ahora, con acceso a **jamil**, podemos continuar explorando y buscando nuevas vulnerabilidades para escalar aún más nuestros privilegios y, eventualmente, obtener acceso completo a la máquina.

# Escalada de privilegios
Bien, hemos llegado a la máquina; solo queda alcanzar el acceso como **root**. Comenzamos, como siempre, enumerando qué puede hacer este usuario con privilegios. En este caso, **jamil** solo puede ejecutar el código **utilities.py** con el usuario **mark**.

<img alt="47" src="https://github.com/user-attachments/assets/157498da-069c-43c8-b032-4a447b655383" />

Analicemos qué puede hacer este código. Parece que sirve para ejecutar comandos dentro de la máquina de forma automática, como hacer backups, comprimir archivos o comprobar el estado de procesos. Algo importante a tener en cuenta es que el usuario **jamil** solo puede ejecutar el parámetro **system-status**.

<img alt="48" src="https://github.com/user-attachments/assets/d3c4da6a-fbef-454d-aaa8-b4fa4c1640ea" />

El código anterior ejecuta otros scripts dentro de la carpeta **/utils**. El usuario **jamil** solo puede ejecutar el parámetro **system-status**; como se puede ver en la imagen, no podemos editar ninguno de estos scripts, excepto el de **status.py**.

<img alt="49" src="https://github.com/user-attachments/assets/ac3e2961-e5da-4163-941f-605e1c1bf014" />

Probemos a crear una conexión remota para conectarnos como el usuario **mark**. Primero, encriptaremos la conexión remota con **base64**.

<img alt="50" src="https://github.com/user-attachments/assets/3087ae3d-bea8-4c9e-bce0-86c46aa030d8" />

Después, modificaremos el código completo para añadir el payload, prepararemos nuestro **netcat** para recibir la conexión y, finalmente, lo ejecutaremos como **mark**.

<img alt="51" src="https://github.com/user-attachments/assets/1206c18f-34b9-455a-87a2-f0633f4c13a1" />

Ahora estamos como el usuario **mark**. Veamos qué puede ejecutar con permisos de administrador. Puede ejecutar la herramienta **safeapache2ctl**, que permite cargar configuraciones en la máquina.

<img alt="52" src="https://github.com/user-attachments/assets/2f0fc8c5-5434-43d3-aec2-ed88c6b15295" />

Si probamos a ejecutarla, veremos que nos pide un archivo de configuración desde la carpeta **/confs/**. En esa carpeta, podemos crear cualquier archivo de configuración.

<img alt="53" src="https://github.com/user-attachments/assets/774e512d-0e21-472a-b962-23bd5f963d04" />

Si investigamos un poco, al crear un archivo de configuración que cargue un módulo y, si da error, que ejecute una conexión remota, podemos aprovechar esto.

<img alt="54" src="https://github.com/user-attachments/assets/6c15ee0b-1fef-4ea4-b927-7f9bf157b0b5" />

Ejecutamos la aplicación con el archivo de configuración malicioso y, finalmente, hemos escalado hasta el usuario **root**, completando así la máquina.

<img alt="55" src="https://github.com/user-attachments/assets/7773d31e-a09e-43ae-9471-63787e221c72" />

# Conclusión
La máquina **Guardian** fue una experiencia realmente interesante que me ayudó a entender mejor cómo se pueden explotar vulnerabilidades y escalar privilegios. Desde el recorrido inicial por los puertos y servicios hasta la explotación de vulnerabilidades como **XSS** y **Inclusion de Archivos Locales**, cada paso fue clave para avanzar en el proceso.

La escalada de privilegios, comenzando con el usuario **jamil** y llegando hasta **root**, nos permitieron conocer bien las herramientas y scripts disponibles en el sistema. Poder modificar y ejecutar código en un entorno controlado nos permitió establecer conexiones remotas y aprovechar configuraciones que estaban mal protegidas.

Quiero agradecer a **echoesofwhoami** y a compañeros que me han ayudado a completar esta máquina.

Espero que esta publicación sirva como una guía para esta máquina tan compleja.

![ken](https://github.com/user-attachments/assets/dc12abde-26e1-4955-be48-9a267b3102c6)
