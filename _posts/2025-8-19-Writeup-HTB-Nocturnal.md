---
title: Nocturnal WriteUp Hack The Box
published: true
---

# Introducción

https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com/avatars/f6a56cec6e9826b4ed124fb4155abc66.png

**Nocturnal** es una máquina de **Hack The Box** que presenta una vulnerabilidad **IDOR** en una aplicación web desarrollada en **PHP**. Obtendremos las credenciales desde una base de datos y las crackearemos para acceder al usuario **Tobias**. Utilizaremos un **CVE** en la aplicación **ISPConfig** que nos permitirá ejecutar comandos, lo que nos llevará a obtener acceso como usuario **root**.

# Reconocimiento
Comenzaremos lanzando un escaneo con **nmap**.

<img width="773" height="320" alt="1" src="https://github.com/user-attachments/assets/6132164d-191d-43fe-92f4-870598e18825" />

Como se puede observar, están activos el puerto **22** y el puerto **80**. Para acceder al servidor **HTTP**, será necesario añadir la IP al archivo **/etc/hosts**.

<img width="1068" height="146" alt="2" src="https://github.com/user-attachments/assets/58e8fb40-e45e-4bc4-9e7e-5a79363bc294" />

Al visitar ``http://nocturnal.htb``, llegaremos a una página principal que nos permitirá registrarnos e iniciar sesión.

<img width="1920" height="833" alt="3" src="https://github.com/user-attachments/assets/32c0987b-4d87-49f0-bdea-1b289daccf96" />

Procedemos a registrarnos e iniciar sesión.

<img width="1920" height="833" alt="4" src="https://github.com/user-attachments/assets/ad84a5dc-4532-444b-a9aa-f0d99d138a62" />

Una vez redirigidos a **/dashboard.php**, notamos que al intentar subir un archivo **PHP**, se genera un error indicando que el formato no es válido y que solo se aceptan archivos con extensiones **.pdf**, **.doc**, **.docx**, entre otros.

<img width="1920" height="829" alt="5" src="https://github.com/user-attachments/assets/fc8d08a5-45fb-4249-b67f-a89a0cff3a73" />

Si creamos un archivo **PDF** de prueba y lo subimos, podremos descargarlo nuevamente haciendo clic en el enlace. Sin embargo, al observar el enlace, notamos que está compuesto por el nombre de usuario y el nombre del archivo.

<img width="662" height="198" alt="7" src="https://github.com/user-attachments/assets/0aeb6fa9-de52-4a69-81f6-6688a38998a0" />

Si modificamos la URL y cambiamos el parámetro **username**, si el usuario no existe, aparecerá un error indicando que el archivo no existe.

<img width="1920" height="830" alt="8" src="https://github.com/user-attachments/assets/301bd623-cae8-4dd5-aebe-edb105880506" />

Con esta información, podemos enumerar los usuarios utilizando la herramienta **ffuf**. Debemos añadir la URL, la palabra **FUZZ** en el lugar que queremos enumerar, el diccionario y la cookie de sesión que tengamos. Como se muestra en la imagen, obtenemos muchos resultados, por lo que será necesario filtrar los resultados más relevantes.

<img width="1459" height="802" alt="9" src="https://github.com/user-attachments/assets/4e089894-56b1-4c0b-9e7a-f0234bd0acc7" />

Filtraremos por tamaño (-fs) y por palabras (-fw), logrando identificar dos usuarios: **amanda** y **john**.

<img width="1608" height="486" alt="11" src="https://github.com/user-attachments/assets/755c4138-7702-4823-a09e-1211a1f2ea31" />

Al modificar la URL y colocar el usuario **amanda**, podremos ver los archivos que ha subido a la plataforma, en este caso, **privacy.odt**.

<img width="1920" height="834" alt="12" src="https://github.com/user-attachments/assets/cf301f71-db02-49a7-8a5b-fda580447e2a" />

Al descargarlo, encontraremos su contraseña.

<img width="1920" height="838" alt="13" src="https://github.com/user-attachments/assets/13e707a6-3a14-4f85-8f22-1efda3fe6ce3" />

Si accedemos a su cuenta, podremos ingresar al panel de administrador.

<img width="1920" height="833" alt="14" src="https://github.com/user-attachments/assets/42ce8741-5e5a-4968-8a29-64597409faaf" />

Desde aquí, podemos crear copias de seguridad, así que utilizaremos una contraseña de prueba y crearemos una.

<img width="1920" height="833" alt="15" src="https://github.com/user-attachments/assets/6827600c-88d8-49c2-bb52-8d8a9b7eb0c6" />

Una vez finalizado, intentamos controlarlo mediante una inyección de código, pero recibimos un error de "intentar otra contraseña", lo que impide la ejecución de código.

Otra función del panel de administrador es la opción de ver el código fuente. En el archivo **admin.php**, podremos observar cuáles son los caracteres que no podemos utilizar.

<img width="814" height="265" alt="16" src="https://github.com/user-attachments/assets/20966e96-024f-45e5-823e-82fe746fbbd8" />

# Explotación
Con esta información, podemos crear un archivo **shell** y, utilizando la herramienta **curl**, realizaremos una petición para subir la shell que hemos creado previamente.

<img width="1040" height="41" alt="17" src="https://github.com/user-attachments/assets/0018b438-9779-43d7-8e22-004f1da2125d" />

<img width="1469" height="369" alt="18" src="https://github.com/user-attachments/assets/d67b1475-c719-4dfb-9bfc-3dd4e8eebf29" />

Ahora, con **curl**, podremos ejecutar la shell y establecer una conexión remota con la máquina como el usuario **www-data**.

<img width="1907" height="255" alt="19" src="https://github.com/user-attachments/assets/182e25db-ca9f-423a-835e-5694256f0f07" />

Al realizar una búsqueda rápida en el sistema, encontraremos la base de datos **nocturnal_database.db**. Con la herramienta **sqlite3**, accederemos y obtendremos las credenciales hasheadas.

<img width="665" height="246" alt="20" src="https://github.com/user-attachments/assets/7ddab7d2-0190-465d-b45b-4e17b9c051a4" />

Utilizando la herramienta **john**, podremos crackear el hash del usuario **Tobias**.

<img width="791" height="174" alt="21" src="https://github.com/user-attachments/assets/93541a4f-b12b-44fc-98c9-9c552c9f7b29" />

Finalmente, podremos acceder al **SSH** de la máquina con el usuario **Tobias** y obtener la primera flag de la máquina.

<img width="1030" height="605" alt="22" src="https://github.com/user-attachments/assets/ebae5620-1f9c-4964-a653-cb46a4e96334" />

# Escalada de privilegios
Al realizar una enumeración completa de la máquina, observamos que el puerto **8080** está abierto en la interfaz local.

<img width="1559" height="184" alt="23" src="https://github.com/user-attachments/assets/a2930f74-4429-4aba-8edd-fe648f23d884" />

Con esta información, redirigiremos este puerto a nuestra máquina para poder acceder a él.

<img width="1920" height="199" alt="24" src="https://github.com/user-attachments/assets/57ab2227-92e9-4ae8-a391-82736cdc30d1" />

En este puerto, se está ejecutando un panel de control de **ISPConfig**. Podemos iniciar sesión como **admin** utilizando la contraseña que hemos crackeado del usuario **Tobias**. Una vez dentro, en la sección de "ayuda", podremos ver la versión del programa.

<img width="1917" height="836" alt="26" src="https://github.com/user-attachments/assets/fc1b5d0f-7338-48b5-b98b-30cddfb58abe" />

Conociendo la versión utilizada, podemos buscar exploits y pruebas de concepto que podamos utilizar contra la máquina. Utilizaremos [CVE-2024-46818](https://github.com/bipbopbup/CVE-2023-46818-python-exploit) del usuario **bipbopbup**.

<img width="1920" height="835" alt="27" src="https://github.com/user-attachments/assets/4a13413d-97e3-4db5-9511-5513c0b85df2" />

Al ejecutar el exploit, obtendremos una shell interactiva como el usuario **root**.

```bash
python3 exploit.py http://127.0.0.1:8080 admin slowmotionapocalypse
```

Esto ocurre porque la carpeta donde opera **ISPConfig** pertenece al usuario **root**.

<img width="540" height="115" alt="28" src="https://github.com/user-attachments/assets/322a1b0d-6a5a-499a-9dd5-43c6837fb197" />

Además, el usuario **ispconfig** también existe en el sistema.

<img width="768" height="673" alt="29" src="https://github.com/user-attachments/assets/e57ef4cc-411a-4339-856b-d7f33cc7bcae" />

# Conclusión

A través de este proceso, hemos logrado escalar privilegios desde un usuario normal hasta obtener acceso como **root** en la máquina **Nocturnal**. Espero que os haya gustado esta publicación y nos vemos en la siguiente.

![ken](https://github.com/user-attachments/assets/8df78f31-0843-408b-a89c-c8e58f58d7cd)
