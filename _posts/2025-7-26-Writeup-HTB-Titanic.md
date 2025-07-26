---
title: Titanic WriteUp Hack The Box
published: true
---

# Introducción

Hoy analizaremos la máquina **Titanic** de **Hack The Box**, que es una máquina fácil con sistema operativo **Linux**. En la fase de reconocimiento, identificaremos los puertos **22** (SSH) y **80** (HTTP). Posteriormente, realizaremos un **path traversal** en el directorio `/download`, lo que nos permitirá acceder a archivos sensibles, como por ejemplo `/etc/passwd`. Más adelante, descubriremos que hay una instancia de **Gitea** desplegada en un subdominio de la máquina, desde donde podremos extraer el archivo de configuración de Gitea, que nos llevará a una base de datos **SQLite** con los hashes de los usuarios. Utilizando **hashcat**, lograremos descifrar la contraseña del usuario "developer" y accederemos a través de **SSH**. Para el escalado de privilegios, encontraremos un proceso de **ImageMagick** ejecutándose como **root**. Finalmente, inyectaremos una librería maliciosa para obtener la **flag** de root.


<img width="1400" height="1138" alt="imagen" src="https://github.com/user-attachments/assets/a26f3f37-75e2-490a-bdda-cb158f597cc0" />


# Reconocimiento
Usando **nmap**, detectaremos dos puertos abiertos: **SSH** y **HTTP**.


<img width="837" height="463" alt="1" src="https://github.com/user-attachments/assets/dcf72a87-9c55-420f-8363-7946329ed7c3" />


El puerto **80** nos redirige a `titanic.htb`. Utilizaré **ffuf** para buscar subdominios, y solo encontraremos el subdominio **dev.titanic.htb**.


<img width="1082" height="428" alt="2" src="https://github.com/user-attachments/assets/93850014-8323-4d68-98de-614c9324e84b" />


Por lo tanto, añadiremos estos dos dominios al archivo `/etc/hosts`.

## titanic.htb


<img width="1037" height="75" alt="3" src="https://github.com/user-attachments/assets/e65e40e5-7ace-4bd6-bd86-2c6252cd3edd" />


Al acceder al puerto **80** de la máquina, observaremos que se trata de una compañía de cruceros.


<img width="1920" height="835" alt="4" src="https://github.com/user-attachments/assets/7f65b57a-592f-47af-b999-81947741949f" />


Ninguno de los enlaces de la página nos lleva a algún sitio útil, pero el botón de **"Book Now"** hace que aparezca una encuesta.


<img width="495" height="555" alt="5" src="https://github.com/user-attachments/assets/8a4a959d-ef74-43d4-a1e6-53b7c8cb7497" />


Si completamos la encuesta y pulsamos el botón de **"Submit"**, se nos devolverá un archivo **JSON**.


<img width="521" height="353" alt="6" src="https://github.com/user-attachments/assets/32aee567-99a1-4051-a463-9a26a7b657be" />


<img width="482" height="159" alt="7" src="https://github.com/user-attachments/assets/ef938fc8-eced-4d4a-b600-574a4d5142e4" />


Utilizando la extensión de navegador **Wappalyzer**, podremos identificar las tecnologías que están funcionando en el sitio web.


<img width="495" height="527" alt="8" src="https://github.com/user-attachments/assets/70120545-c3e1-47a5-9cfc-18d042b521ae" />


## dev.titanic.htb

Al acceder, veremos que tiene instalado **Gitea**.


<img width="1915" height="842" alt="10" src="https://github.com/user-attachments/assets/b0cc38e3-b7da-4dc4-a0d5-aa3d1df23cbe" />


Explorando, encontraremos dos repositorios públicos: **docker-config** y **flask-app**.


<img width="1920" height="428" alt="11" src="https://github.com/user-attachments/assets/89b9d569-1e2b-44a7-b79c-3161b0811b6e" />


### docker-config

En el repositorio, podremos encontrar una contraseña de la base de datos en el código sin cifrar.


<img width="1357" height="591" alt="12" src="https://github.com/user-attachments/assets/237ef911-283b-47ca-950e-a4bd1edc3156" />


### flask-app
Este repositorio contiene el código fuente de **titanic.htb**.


<img width="1918" height="771" alt="13" src="https://github.com/user-attachments/assets/51c31397-a8cd-4853-b9a1-6c426fa1dd01" />


Lo interesante de este repositorio es que nos muestra el funcionamiento del dominio. El directorio `/book` realiza una petición **POST**, guarda los datos en un archivo y redirige a `/download` utilizando ese nombre.


<img width="625" height="379" alt="14" src="https://github.com/user-attachments/assets/4ef73d13-96df-4a9e-beac-d36f6b2dce20" />


El directorio `/download` pasa una constante **TICKETS_DIR** (que se establece en "tickets" al principio del archivo) y el parámetro de entrada del usuario a **os.path.join**, luego verifica si el archivo resultante existe y lo envía.


<img width="692" height="303" alt="15" src="https://github.com/user-attachments/assets/9cd65136-d9bb-49b4-9911-1aab143dd035" />


# Explotación
Cuando hacemos una petición a `/book`, nos redirige a `/download`. Este directorio utiliza el parámetro **ticket** para devolvernos el archivo **JSON**. Como he resuelto varias máquinas, sé que este tipo de parámetros puede llevar a una vulnerabilidad de lectura de archivos.


<img width="1592" height="876" alt="16" src="https://github.com/user-attachments/assets/9c307593-ae8d-45d9-a92a-7f4fa694d8d5" />


Como se puede observar en la siguiente imagen, si cambiamos el valor por un archivo interno de la máquina, podremos leer el archivo `/etc/passwd`. Poder acceder a este archivo es peligroso, ya que nos permite listar todos los usuarios que existen en la máquina.


<img width="1592" height="872" alt="17" src="https://github.com/user-attachments/assets/87bcc2bd-f9fa-4e66-a963-03e7c0d03e7f" />


Sabiendo esto y revisando el código fuente que encontramos anteriormente, podremos listar la base de datos.


<img width="1599" height="882" alt="18" src="https://github.com/user-attachments/assets/e0219207-3d04-4f0a-823f-c6dc0e0defef" />


Ahora simplemente podemos descargarla utilizando **curl** y analizarla después con la herramienta **sqlite3**.

<img width="838" height="91" alt="19" src="https://github.com/user-attachments/assets/d4c1ad06-34c6-4d6e-82e0-2164aa44d0ad" />


<img width="453" height="430" alt="20" src="https://github.com/user-attachments/assets/8d28944e-c1eb-4ef7-92c8-f148a6375eeb" />


Si listamos todos los datos de la tabla **user**, obtendremos los hashes de los usuarios.


<img width="1894" height="213" alt="21" src="https://github.com/user-attachments/assets/0a1fdcfa-81ca-4b8f-8a60-127e1750d7a6" />


Con **hashcat**, podremos crackear los hashes obtenidos anteriormente para acceder al **SSH** con el siguiente comando:

```bash
hashcat basedatos.db /usr/share/wordlists/rockyou.txt --user
```

![[23.png]]

# Escalado de privilegios
Una vez conectados por **SSH** a la máquina como "developer", encontraremos en su directorio la primera **flag**.


<img width="1118" height="714" alt="24" src="https://github.com/user-attachments/assets/90dc34ae-6794-4c15-95ec-17a733df2bab" />


Realizando un reconocimiento básico de la máquina con los privilegios del usuario "developer", encontraremos un script llamado **identify_images.sh**. Con esto, descubriremos que la herramienta **ImageMagick** está instalada en la máquina. **ImageMagick** es un programa que permite editar imágenes digitales.


<img width="872" height="67" alt="25" src="https://github.com/user-attachments/assets/93220006-5c57-4b69-a192-398368084655" />


La versión instalada es **7.1.1-35**, que presenta vulnerabilidades. Podemos buscar una prueba de concepto para escalar privilegios.


<img width="1069" height="119" alt="27" src="https://github.com/user-attachments/assets/a03dfce7-e716-41ec-a6b9-3769f5a61a23" />


He encontrado esta prueba de concepto con una búsqueda rápida.

```bash
gcc -x c -shared -fPIC -o ./libxcb.so.1 - << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void init(){
    system("id");
    exit(0);
}
EOF
```

La modificamos para que nos proporcione una **shell** con los privilegios de administrador.


<img width="795" height="147" alt="30" src="https://github.com/user-attachments/assets/30b981ac-063f-4a99-9ee5-29dcfbbc06b0" />


Si la ejecutamos, generará un archivo que nos otorgará la **shell** con los privilegios de administrador.


<img width="1162" height="370" alt="31" src="https://github.com/user-attachments/assets/368e1ec3-f2ff-4d25-ac6e-5866ef3cc5f1" />


<img width="1484" height="168" alt="32" src="https://github.com/user-attachments/assets/9ed8b30d-3540-4854-a814-327ab8fe2db5" />


Finalmente, al acceder como administrador, podremos obtener la última **flag** en el directorio `/root`.

# ¿Como se puede securizar?

- Implementar controles de acceso para evitar que archivos sensibles como `/etc/passwd` sean accesibles a través de la web.
- Asegurarse de que todos los parámetros de entrada, como el **ticket** en el directorio `/download`, sean validados y sanitizados para prevenir ataques de **path traversal**.
- Mantener **ImageMagick** y otros paquetes de software actualizados a sus versiones más recientes para mitigar vulnerabilidades conocidas.
- Implementar políticas de contraseñas que requieran el uso de contraseñas fuertes y únicas para cada usuario.

# Conclusión

La máquina **Titanic** de **Hack The Box** permite explorar vulnerabilidades a través de técnicas como el **path traversal** y la explotación de **ImageMagick** para escalar privilegios. Este ejercicio enseña la importancia de validar entradas, proteger archivos sensibles, mantener el software actualizado y deshabilitar funciones innecesarias.

Espero que os haya gustado la publicación, nos vemos en la siguiente!

![ken](https://github.com/user-attachments/assets/2eb2ac4f-63d3-4a40-a18b-c96455fec681)
