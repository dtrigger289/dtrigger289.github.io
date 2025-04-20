---
title: Vuls en Docker
published: true
---

# Introducción

Buenos días, últimamente he estado dando muchas vueltas con la herramienta "Vuls" y, como he tenido varias complicaciones al instalarla y configurarla en docker, he pensado en explicar a mi manera cómo instalar, configurar y analizar los reportes de una forma más clara.

![image](https://github.com/user-attachments/assets/eacd7a5b-2a16-4e03-b687-feb3cbefa46b)

# Instalación

Vamos a instalar "Vuls" con Docker para poder utilizar nuestra configuración de Docker en cualquier dispositivo. Para ello, necesitamos descargar [docker](https://docs.docker.com/engine/install/) para el sistema operativo que vayamos a utilizar.

Una vez instalado, tendremos que dirigirnos a la página de [Vuls](https://vuls.io/docs/en/install-with-docker.html) en "Install with Docker", nos descargamos todos los docker de las bases de datos y la herramienta.

```docker
docker pull vuls/go-cve-dictionary
docker pull vuls/goval-dictionary
docker pull vuls/gost
docker pull vuls/go-exploitdb
docker pull vuls/go-msfdb
docker pull vuls/go-kev
docker pull vuls/go-cti
docker pull vuls/vuls
```

# Preparación

Una vez instalados todos los Docker, faltará crear el directorio donde vamos a trabajar.

```bash
mkdir go-cve-dictionary-log goval-dictionary-log gost-log go-exploitdb-log go-msfdb-log db
```

Y descargamos la bases de datos desde los Docker.

```bash
docker run --rm -it \
    -v $PWD:/go-cve-dictionary \
    -v $PWD/go-cve-dictionary-log:/var/log/go-cve-dictionary \
    vuls/go-cve-dictionary fetch nvd

docker run --rm -it \
    -v $PWD:/goval-dictionary \
    -v $PWD/goval-dictionary-log:/var/log/goval-dictionary \
    vuls/goval-dictionary fetch oracle 7 8 9

docker run --rm -i \
    -v $PWD:/gost \
    -v $PWD/gost-log:/var/log/gost \
    vuls/gost fetch redhat

docker run --rm -i \
    -v $PWD:/go-exploitdb \
    -v $PWD/go-exploitdb-log:/var/log/go-exploitdb \
    vuls/go-exploitdb fetch exploitdb

docker run --rm -i \
    -v $PWD:/go-exploitdb \
    -v $PWD/go-exploitdb-log:/var/log/go-exploitdb \
    vuls/go-exploitdb fetch awesomepoc

docker run --rm -i \
    -v $PWD:/go-exploitdb \
    -v $PWD/go-exploitdb-log:/var/log/go-exploitdb \
    vuls/go-exploitdb fetch githubrepos
docker run --rm -i \
    -v $PWD:/go-exploitdb \
    -v $PWD/go-exploitdb-log:/var/log/go-exploitdb \
    vuls/go-exploitdb fetch inthewild

docker run --rm -i \
    -v $PWD:/go-msfdb \
    -v $PWD/go-msfdb-log:/var/log/go-msfdb \
    vuls/go-msfdb fetch msfdb

docker run --rm -i \
    -v $PWD:/go-kev \
    -v $PWD/go-kev-log:/var/log/go-kev \
    vuls/go-kev fetch kevuln

docker run --rm -i \
    -v $PWD:/go-cti \
    -v $PWD/go-cti-log:/var/log/go-cti \
    vuls/go-cti fetch threat
```

Una vez ejecutados los comandos anteriores, para que la aplicación funcione es necesario crear un archivo llamado "config.toml" que contendrá una configuración parecida a esta.

```bash
# Añadir/Quitar las bases de datos que se quieran usar

[cveDict]
type        = "sqlite3"
sqlite3Path = "/vuls/db/cve.sqlite3"
url        = ""

[ovalDict]
type        = "sqlite3"
sqlite3Path = "/vuls/db/oval.sqlite3"
url        = ""

[gost]
type        = "sqlite3"
sqlite3Path = "/vuls/db/gost.sqlite3"
url        = ""

[exploit]
type        = "sqlite3"
sqlite3Path = "/vuls/db/go-exploitdb.sqlite3"
url        = ""

[metasploit]
type        = "sqlite3"
sqlite3Path = "/vuls/db/go-msfdb.sqlite3"
url        = ""

[kevuln]
type        = "sqlite3"
sqlite3Path = "/vuls/db/go-kev.sqlite3"
url        = ""

[cti]
type        = "sqlite3"
sqlite3Path = "/vuls/db/go-cti.sqlite3"
url        = ""

# Añadir/Quitar equipos que se van a analizar

[servers]

[servers.local]
host               = "127.0.0.1"
port               = "local"
scanMode           = ["fast"]

[servers.remoto]
host               = "10.0.2.16"
user               = "user"
port               = "22"
keyPath            = "./id_rsa"
scanMode           = ["fast"]
```

Algo a tener en cuenta de esta configuración es el tema de las rutas, ya que, por el funcionamiento de Docker, la ruta empieza siempre en `/vuls/`, seguida de la ruta donde hayamos guardado las bases de datos. En el siguiente dibujo podremos ver cómo es el funcionamiento de esta aplicación en Docker ([Documentación oficial](https://vuls.io/docs/en/install-with-vulsctl.html#setup-docker))

![Pasted image 20250416165708](https://github.com/user-attachments/assets/b7e0181a-0407-4d78-a0ae-3c20b80cfdc3)

# Comprobar la configuración

Para comprobar que el archivo "config.toml" funciona correctamente, se podrá utilizar el comando "configtest".

```bash
docker run --rm -i $t \
    -v $HOME/.ssh:/root/.ssh:ro \
    -v $PWD:/vuls \
    vuls/vuls configtest \
    -log-dir=/vuls/log \
    -config=/vuls/config.toml \
    $@
```

# Escanear equipos

Si ya se ha comprobado el fichero de configuración, eso significa que ya podremos escanear equipos y detectar sus vulnerabilidades. Al ejecutar este comando, buscará el archivo "config.toml" y analizará los equipos que hayamos indicado en él.

```bash
docker run --rm -i $t \
    -v $HOME/.ssh:/root/.ssh:ro \
    -v $PWD:/vuls \
    vuls/vuls scan \
    -log-dir=/vuls/log \
    -config=/vuls/config.toml \
    $@
```

![1](https://github.com/user-attachments/assets/c4fd8e52-a712-4c01-ac7b-7e3f985d7404)

Una vez escaneado el equipo, se genera un reporte en formato .json en la carpeta "results".
# Reportes

Para generar reportes, se debe haber añadido las bases de datos que se quieran utilizar y haber realizado un escaneo a alguna máquina.

```bash
docker run --rm -it \
    -v ~/.ssh:/root/.ssh:ro \
    -v $PWD:/vuls \
    -v $PWD/vuls-log:/var/log/vuls \
    -v /etc/localtime:/etc/localtime:ro \
    vuls/vuls report \
    -format-list \
    -config=./config.toml
```

En mi caso, ninguna de mis máquinas tiene ningún CVE conocido.

![2](https://github.com/user-attachments/assets/4d0d1c2e-7574-4d7f-9e3e-8c5df6879afe)

# Vulsrepo

Como adición, existe otro Docker que se llama "[Vulsrepo](https://github.com/usiusi360/vulsrepo)" que nos permite ver de una forma más amigable el contenido de los ficheros .json generados por el escaneo anterior.

```bash
docker pull ishidaco/vulsrepo

docker run -d $t \
    -v $PWD:/vuls \
    -p 5111:5111 \
    ishidaco/vulsrepo \
    $@
```

Podremos acceder a él accediendo a nuestro puerto 5111 y visualizar los CVEs, filtrar por los que te interesen e imprimir la tabla que hayas creado.

![3](https://github.com/user-attachments/assets/89c6d111-e10e-490f-8529-769d999ac305)

# Conclusión

En conclusión, Vuls se presenta como una herramienta poderosa y eficiente para la gestión de vulnerabilidades en sistemas informáticos. Su capacidad para escanear equipos Linux en busca de vulnerabilidades conocidas permite a los desarrolladores y administradores de sistemas mantener un alto nivel de seguridad en sus aplicaciones. Al estar la herramienta dockerizada, facilita su ejecución en cualquier ordenador y simplifica la gestión de dependencias.

Si tienes alguna pregunta o necesitas más información, no dudes en preguntar.

![ken](https://github.com/user-attachments/assets/e681377f-a137-43f8-aae0-2f6c0d26cbb3)
