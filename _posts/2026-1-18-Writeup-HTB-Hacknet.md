---
title: Hacknet WriteUp Hack The Box
published: true
---

# Introducción

<img width="300" height="300" alt="imagen" src="https://github.com/user-attachments/assets/564c70dd-a3cd-4ccc-a34c-68ce7b88e808" />

**Hacknet** es una máquina de **Hack The Box** de dificultad media. La explotación requiere adentrarse en una red social de _hackers_, comprender su funcionamiento e **introducir un payload en nuestro nombre de usuario** para extraer información, como **nombres y contraseñas** del resto de los usuarios.

Más adelante, se aprende a **inyectar código malicioso en la caché** del sitio web, lo que permite la ejecución de comandos para obtener acceso como el usuario **`sandy`**.

Finalmente, con el acceso del usuario `sandy`, se **crackea su clave GPG** para descomprimir los _backups_ de la máquina y, de esta manera, **encontrar la clave de administrador**.

# Reconocimiento
Comenzamos con el habitual escaneo de puertos. En este caso, se encuentra el **puerto 22** (SSH), que no se puede atacar inicialmente por falta de credenciales, y el **puerto 80** con una página web.

<img src="https://github.com/user-attachments/assets/73395c73-774b-45ee-91e2-04fd4f0808ec" />

Para acceder al puerto 80, es necesario **añadir la IP y el dominio al archivo `/etc/hosts`**. Una vez dentro, se presentan dos botones: uno para **iniciar sesión** y otro para **registrarse**.

<img src="https://github.com/user-attachments/assets/f719e8cc-6a36-4b97-ae4e-b67f45caf382" />

Dado que no se conocen usuarios, se procede a crear una **nueva cuenta** para explorar el contenido.

<img src="https://github.com/user-attachments/assets/431a477e-ee54-4cbe-a6e6-6775202533fd" />

Tras iniciar sesión, se observan varias secciones como "Profile", "Contacts", "Messages", entre otras.

<img src="https://github.com/user-attachments/assets/f6cb02e2-1bff-4401-99fc-d3005c4338df" />

En la sección de "**Search**" se pueden encontrar a todos los usuarios de la web.

<img src="https://github.com/user-attachments/assets/e8422fb5-31dd-48c6-8ded-8bfa1503114f" />

La sección "**Explore**" muestra publicaciones de los usuarios, con opciones para dar "likes" y añadir comentarios.

<img src="https://github.com/user-attachments/assets/a24f3dca-0f6d-47c8-a1d0-98a45560c18f" />

Si se intercepta la petición al pulsar el botón de "likes", se observa que se envía una solicitud a la **URL `/likes/22`**.

<img src="https://github.com/user-attachments/assets/7764e724-f873-4914-a5d0-a2b454a1863e" />

Al acceder directamente a esa URL, se visualizan los usuarios que han dado "like" a esa publicación. Además, **al revisar el código fuente, se exponen todos los nombres de usuario**.

<img src="https://github.com/user-attachments/assets/ac7bf96c-a84d-41d3-81ac-836fa95a2569" />

Por último, utilizando la extensión de navegador "**Wappalyzer**", se descubre que la página web está construida con **Django**.

<img src="https://github.com/user-attachments/assets/154cf446-8a94-4eeb-8c06-1b7092620d4e" />

Este dato sugiere la posibilidad de probar un **_payload_ de plantilla de Django**, ya que el sitio web muestra nuestro nombre de usuario.
# Explotación
Para que el ataque funcione, se requiere el campo `users`, un número que indique el usuario y el campo que se desea extraer (en este caso, el correo electrónico).

<img src="https://github.com/user-attachments/assets/6428efb8-0703-498e-985e-c35fa56f44ab" />

Tras guardar los cambios y refrescar la página, al final del código fuente se encuentra **una parte de la credencial filtrada**.

<img src="https://github.com/user-attachments/assets/66039417-5776-4449-b4f6-0b86376783de" />

Sabiendo esto, se modifica el _payload_ para **mostrar la contraseña** del usuario.

<img src="https://github.com/user-attachments/assets/1e92e3bf-cee9-4712-8173-6daaacc5d793" />

<img src="https://github.com/user-attachments/assets/49884a59-af40-49ee-bc90-9f94572bb3c8" />

Después de una investigación exhaustiva en las cuentas de usuario de esa publicación, no se encontró nada útil, por lo que se probó con la publicación que tenía **más "likes" en la plataforma**.

<img src="https://github.com/user-attachments/assets/e923bfab-928f-46a2-82ce-c5ea9e0f2ae1" />

Aplicando el mismo _payload_ para extraer correos y probando múltiples veces, se identifica la credencial más interesante.

<img src="https://github.com/user-attachments/assets/7b39dbd8-3f02-44b6-a0bd-704513d3c1a7" />

Con el _payload_ de la contraseña, se extrae el siguiente valor.

<img src="https://github.com/user-attachments/assets/8cb48048-70ec-494b-aca3-cad6f2c843f5" />

Se intenta iniciar sesión con la cuenta de este usuario.

<img src="https://github.com/user-attachments/assets/e0c14a2b-a6e8-4e1d-a18f-ba06d2a7f520" />

Como se muestra en la imagen, el usuario **`deepdive`** tenía una **publicación oculta con un solo "like"**.

<img src="https://github.com/user-attachments/assets/94ad3076-0e6a-4fe3-8c19-bca45e2bbe1c" />

Al revisar sus contactos, se encuentra que solo tiene agregado al usuario **`backdoor_bandit`**.

<img src="https://github.com/user-attachments/assets/8011dae4-468c-4a1f-bbd4-6d0ddcf37943" />

Se verifica que el usuario **`backdoor_bandit`** es quien ha dado "like" a la publicación privada.

<img src="https://github.com/user-attachments/assets/f5c32fc2-4e24-4b83-8f96-7b9a13ff0582" />

Interceptando la petición con **Burp Suite**, se determina que la publicación oculta tiene el **número 23**.

<img src="https://github.com/user-attachments/assets/c20be874-6e0f-43cf-9ed5-f3ba02f58a0f" />

Se cierra la sesión de `deepdive`, se intercepta otro "like" de una publicación diferente, se **manipula la petición y se cambia el número por 23**.

<img src="https://github.com/user-attachments/assets/685c84c5-7b1f-4160-906c-f48d10f54fe0" />

Si el ataque se ha realizado correctamente, al acceder a la URL de la publicación 23, se debe visualizar nuestro propio usuario.

<img src="https://github.com/user-attachments/assets/b89068df-1e14-49fd-a15c-fb92917fa5c1" />

Aplicando el _exploit_ utilizado anteriormente, se obtienen las credenciales de **`mikey@hacknet.htb`**. Al intentar iniciar sesión por **SSH** con este usuario, se consigue el acceso. En su carpeta se encuentra la **primera _flag_**.

<img src="https://github.com/user-attachments/assets/4259ff0e-c32b-4d0c-b5d3-edfa474a84b5" />

Realizando un reconocimiento de la máquina para identificar carpetas con permisos de escritura para el usuario `mikey`, se descubre la ruta inusual **`/var/tmp/django_cache`**. Se procede a **envenenar la caché** antes de que sea eliminada para **crear una _shell_ como el usuario `sandy`**.

<img src="https://github.com/user-attachments/assets/659ef16d-16c1-4b6f-867e-be1e8a3e6afe" />

El elemento principal de este _script_ es la librería **`pickle`** para crear objetos maliciosos. Cuando la aplicación Django (ejecutándose con el usuario `sandy`) **deserializa la caché**, se creará la _shell_ en el directorio `/tmp/`.

<img src="https://github.com/user-attachments/assets/0ffff79f-7f75-43dd-a810-00512e2e7ec7" />

Se ejecuta el _script_ que genera el _payload_.

<img src="https://github.com/user-attachments/assets/7de737a0-7693-4896-958f-7b40525f0c36" />

Se puede generar caché simplemente navegando por la web. Una vez que se tiene caché almacenada en la máquina, se utiliza el siguiente comando que permite **añadir el _payload_ a todos los archivos y les otorga todos los permisos**.

<img src="https://github.com/user-attachments/assets/2fcadf6f-27a8-4449-8eef-d7008ab3e4b1" />

Tras unos 5 segundos, el archivo se genera con los **permisos del usuario `sandy`**.

<img src="https://github.com/user-attachments/assets/18a27003-afd6-47af-bef2-9eed9d194ab7" />

# Escalada de privilegios
El último paso es la escalada de privilegios. El usuario `sandy` tiene _backups_ de la web almacenados en la máquina, los cuales están **comprimidos y cifrados con GPG**.

<img src="https://github.com/user-attachments/assets/9c6e2c4c-cb9c-4328-a382-c557f9f2b434" />

Al acceder a su directorio, se encuentra una carpeta oculta: **`.gnupg`**.

<img src="https://github.com/user-attachments/assets/993ebd33-03aa-4a75-a513-3dc459aeb090" />

Dentro de ella está el archivo con la clave necesaria para descifrar los _backups_.

<img src="https://github.com/user-attachments/assets/68898288-f331-4e20-9179-dc00df4a8299" />

Si se guarda el contenido de ese archivo y se intenta importar en la máquina atacante, se solicita la clave, que aún no se conoce.

<img src="https://github.com/user-attachments/assets/f89e813d-de9d-43c3-951a-f7368b606cd7" />

Se intenta **crackear la clave** utilizando la herramienta **`gpg2john`** para extraer un _hash_ que luego pueda ser procesado por la herramienta **`john`** (John the Ripper).

<img src="https://github.com/user-attachments/assets/d61f4633-0671-47e2-9bf3-124e7140d00c" />

Se indica el formato, el diccionario y el archivo _hash_ generado. En poco tiempo, se obtiene la **contraseña** para descifrar los _backups_.

<img src="https://github.com/user-attachments/assets/3a109b61-0c7f-44d2-8f15-dde68ae66c25" />

Finalmente, solo queda copiar los archivos a la máquina atacante para su descompresión.

<img src="https://github.com/user-attachments/assets/50c8ee2d-55f9-46cf-93af-a6f833186709" />

Se importa la clave obtenida anteriormente.

<img src="https://github.com/user-attachments/assets/1aef1ece-90ff-489d-9a18-4f8f6b8fffa1" />

Y por último, se **descomprime el archivo**.

<img src="https://github.com/user-attachments/assets/e8a5af36-0af8-47e1-964f-ac391ea5cbf9" />

Una vez descomprimido, al buscar por la palabra "**password**", se encuentra una conversación donde **se filtra la clave de administrador**.

<img src="https://github.com/user-attachments/assets/054ba06c-4212-4408-b5b3-7367b4a15904" />

De esta forma, se consigue acceder fácilmente al usuario **`root`** y se obtiene la **última _flag_** de la máquina.

<img src="https://github.com/user-attachments/assets/ecc70427-18c4-4929-84a2-dc0e77a4f582" />

# Conclusión
La explotación de Hacknet se ejecutó mediante una cadena de ataque en tres fases: primero, se utilizó una **Inyección de Plantilla de Django (SSTI)** para extraer credenciales y obtener acceso inicial como el usuario `mikey`. Segundo, se escaló a `sandy` mediante el **envenenamiento de la caché de Django** explotando una vulnerabilidad de deserialización de `pickle`. Finalmente, se alcanzó el acceso a `root` al **crackear la clave GPG** de `sandy` para descifrar _backups_ que contenían las credenciales de administrador, destacando la necesidad de asegurar tanto el código de la aplicación como la gestión de claves criptográficas.

Espero que os haya gustado esta máquina y nos vemos en la próxima.

![ken](https://github.com/user-attachments/assets/6f8b55e0-029f-4d6d-9bca-c747d7931696)

