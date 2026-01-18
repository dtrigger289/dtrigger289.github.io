Introducción

**Hacknet** es una máquina de **Hack The Box** de dificultad media. La explotación requiere adentrarse en una red social de _hackers_, comprender su funcionamiento e **introducir un payload en nuestro nombre de usuario** para extraer información, como **nombres y contraseñas** del resto de los usuarios.

Más adelante, se aprende a **inyectar código malicioso en la caché** del sitio web, lo que permite la ejecución de comandos para obtener acceso como el usuario **`sandy`**.

Finalmente, con el acceso del usuario `sandy`, se **crackea su clave GPG** para descomprimir los _backups_ de la máquina y, de esta manera, **encontrar la clave de administrador**.

# Reconocimiento
Comenzamos con el habitual escaneo de puertos. En este caso, se encuentra el **puerto 22** (SSH), que no se puede atacar inicialmente por falta de credenciales, y el **puerto 80** con una página web.

<img src="https://github.com/user-attachments/assets/73395c73-774b-45ee-91e2-04fd4f0808ec" />

Para acceder al puerto 80, es necesario **añadir la IP y el dominio al archivo `/etc/hosts`**. Una vez dentro, se presentan dos botones: uno para **iniciar sesión** y otro para **registrarse**.

![[hacknet (sin publicar)/2.png]]

Dado que no se conocen usuarios, se procede a crear una **nueva cuenta** para explorar el contenido.

![[hacknet (sin publicar)/3.png]]

Tras iniciar sesión, se observan varias secciones como "Profile", "Contacts", "Messages", entre otras.

![[hacknet (sin publicar)/4.png]]

En la sección de "**Search**" se pueden encontrar a todos los usuarios de la web.

![[hacknet (sin publicar)/5.png]]

La sección "**Explore**" muestra publicaciones de los usuarios, con opciones para dar "likes" y añadir comentarios.

![[hacknet (sin publicar)/6.png]]

Si se intercepta la petición al pulsar el botón de "likes", se observa que se envía una solicitud a la **URL `/likes/22`**.

![[hacknet (sin publicar)/7.png]]

Al acceder directamente a esa URL, se visualizan los usuarios que han dado "like" a esa publicación. Además, **al revisar el código fuente, se exponen todos los nombres de usuario**.

![[hacknet (sin publicar)/8.png]]

Por último, utilizando la extensión de navegador "**Wappalyzer**", se descubre que la página web está construida con **Django**.

![[hacknet (sin publicar)/9.png]]

Este dato sugiere la posibilidad de probar un **_payload_ de plantilla de Django**, ya que el sitio web muestra nuestro nombre de usuario.
# Explotación
Para que el ataque funcione, se requiere el campo `users`, un número que indique el usuario y el campo que se desea extraer (en este caso, el correo electrónico).

![[hacknet (sin publicar)/10.png]]

Tras guardar los cambios y refrescar la página, al final del código fuente se encuentra **una parte de la credencial filtrada**.

![[hacknet (sin publicar)/11.png]]

Sabiendo esto, se modifica el _payload_ para **mostrar la contraseña** del usuario.

![[hacknet (sin publicar)/12.png]]

![[hacknet (sin publicar)/13.png]]

Después de una investigación exhaustiva en las cuentas de usuario de esa publicación, no se encontró nada útil, por lo que se probó con la publicación que tenía **más "likes" en la plataforma**.

![[hacknet (sin publicar)/14.png]]

Aplicando el mismo _payload_ para extraer correos y probando múltiples veces, se identifica la credencial más interesante.

![[hacknet (sin publicar)/15.png]]

Con el _payload_ de la contraseña, se extrae el siguiente valor.

![[hacknet (sin publicar)/16.png]]

Se intenta iniciar sesión con la cuenta de este usuario.

![[hacknet (sin publicar)/17.png]]

Como se muestra en la imagen, el usuario **`deepdive`** tenía una **publicación oculta con un solo "like"**.

![[hacknet (sin publicar)/18.png]]

Al revisar sus contactos, se encuentra que solo tiene agregado al usuario **`backdoor_bandit`**.

![[hacknet (sin publicar)/19.png]]

Se verifica que el usuario **`backdoor_bandit`** es quien ha dado "like" a la publicación privada.

![[hacknet (sin publicar)/20.png]]

Interceptando la petición con **Burp Suite**, se determina que la publicación oculta tiene el **número 23**.

![[hacknet (sin publicar)/21.png]]

Se cierra la sesión de `deepdive`, se intercepta otro "like" de una publicación diferente, se **manipula la petición y se cambia el número por 23**.

![[hacknet (sin publicar)/22.png]]

Si el ataque se ha realizado correctamente, al acceder a la URL de la publicación 23, se debe visualizar nuestro propio usuario.

![[hacknet (sin publicar)/23.png]]

Aplicando el _exploit_ utilizado anteriormente, se obtienen las credenciales de **`mikey@hacknet.htb`**. Al intentar iniciar sesión por **SSH** con este usuario, se consigue el acceso. En su carpeta se encuentra la **primera _flag_**.

![[hacknet (sin publicar)/24.png]]

Realizando un reconocimiento de la máquina para identificar carpetas con permisos de escritura para el usuario `mikey`, se descubre la ruta inusual **`/var/tmp/django_cache`**. Se procede a **envenenar la caché** antes de que sea eliminada para **crear una _shell_ como el usuario `sandy`**.

![[hacknet (sin publicar)/25.png]]

El elemento principal de este _script_ es la librería **`pickle`** para crear objetos maliciosos. Cuando la aplicación Django (ejecutándose con el usuario `sandy`) **deserializa la caché**, se creará la _shell_ en el directorio `/tmp/`.

![[hacknet (sin publicar)/26.png]]

Se ejecuta el _script_ que genera el _payload_.

![[hacknet (sin publicar)/27.png]]

Se puede generar caché simplemente navegando por la web. Una vez que se tiene caché almacenada en la máquina, se utiliza el siguiente comando que permite **añadir el _payload_ a todos los archivos y les otorga todos los permisos**.

![[hacknet (sin publicar)/28.png]]

Tras unos 5 segundos, el archivo se genera con los **permisos del usuario `sandy`**.

![[hacknet (sin publicar)/29.png]]

# Escalada de privilegios
El último paso es la escalada de privilegios. El usuario `sandy` tiene _backups_ de la web almacenados en la máquina, los cuales están **comprimidos y cifrados con GPG**.

![[hacknet (sin publicar)/30.png]]

Al acceder a su directorio, se encuentra una carpeta oculta: **`.gnupg`**.

![[hacknet (sin publicar)/31.png]]

Dentro de ella está el archivo con la clave necesaria para descifrar los _backups_.

![[hacknet (sin publicar)/32.png]]

Si se guarda el contenido de ese archivo y se intenta importar en la máquina atacante, se solicita la clave, que aún no se conoce.

![[hacknet (sin publicar)/33.png]]

Se intenta **crackear la clave** utilizando la herramienta **`gpg2john`** para extraer un _hash_ que luego pueda ser procesado por la herramienta **`john`** (John the Ripper).

![[hacknet (sin publicar)/34.png]]

Se indica el formato, el diccionario y el archivo _hash_ generado. En poco tiempo, se obtiene la **contraseña** para descifrar los _backups_.

![[hacknet (sin publicar)/35.png]]

Finalmente, solo queda copiar los archivos a la máquina atacante para su descompresión.

![[hacknet (sin publicar)/36.png]]

Se importa la clave obtenida anteriormente.

![[hacknet (sin publicar)/37.png]]

Y por último, se **descomprime el archivo**.

![[hacknet (sin publicar)/38.png]]

Una vez descomprimido, al buscar por la palabra "**password**", se encuentra una conversación donde **se filtra la clave de administrador**.

![[hacknet (sin publicar)/39.png]]

De esta forma, se consigue acceder fácilmente al usuario **`root`** y se obtiene la **última _flag_** de la máquina.

![[hacknet (sin publicar)/40.png]]

# Conclusión
La explotación de Hacknet se ejecutó mediante una cadena de ataque en tres fases: primero, se utilizó una **Inyección de Plantilla de Django (SSTI)** para extraer credenciales y obtener acceso inicial como el usuario `mikey`. Segundo, se escaló a `sandy` mediante el **envenenamiento de la caché de Django** explotando una vulnerabilidad de deserialización de `pickle`. Finalmente, se alcanzó el acceso a `root` al **crackear la clave GPG** de `sandy` para descifrar _backups_ que contenían las credenciales de administrador, destacando la necesidad de asegurar tanto el código de la aplicación como la gestión de claves criptográficas.

Espero que os haya gustado esta máquina y nos vemos en la próxima.

![[ken.gif]]
