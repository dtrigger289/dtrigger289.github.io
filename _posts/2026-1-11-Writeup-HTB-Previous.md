---
title: Previous WriteUp Hack The Box
published: true
---

# Introducción
**Previous** es una máquina de HackTheBox de dificultad media. Para resolverla, tendremos que enumerar todos los puertos y servicios expuestos. En la aplicación web, veremos un inicio de sesión y una versión vulnerable del framework **Next.js**. Al realizar fuzzing, explotaremos esta vulnerabilidad y encontraremos credenciales incrustadas en el código.

Una vez accedamos a SSH con la cuenta del usuario y realicemos otra enumeración del sistema, descubriremos que el usuario puede ejecutar el programa **Terraform** como administrador del sistema. Modificaremos archivos de configuración y un archivo que nos permitirá escalar privilegios, de modo que al ejecutarlo obtendremos privilegios de administrador y capturaremos la flag final.

<img alt="Previous" src="https://github.com/user-attachments/assets/0f1d9dcf-cfaa-4cb1-83a1-cbafe197ab6f" />

# Reconocimiento
Comenzando con **nmap**, descubriremos que están abiertos el puerto **22** (SSH) y el puerto **80** (HTTP con nginx **1.18.0**).

<img alt="1" src="https://github.com/user-attachments/assets/1e28b7b2-a175-407a-af38-6f5043eabdb7" />

No podremos acceder al puerto **22** porque no conocemos ninguna de las credenciales. Al acceder al puerto **80**, encontraremos dos botones ("Get Started") que nos redirigen al mismo sitio.

<img alt="2" src="https://github.com/user-attachments/assets/cd423f9a-5206-4cb8-811d-afc4775b1cf5" />

A simple vista, no encontraremos nada útil, pero al fijarnos en la URL, vemos que está buscando en la máquina el archivo **"Docs"**.

<img alt="3" src="https://github.com/user-attachments/assets/407869c9-ec45-4930-b768-b5c98b2fb08d" />

Enumerando con la extensión de navegador **Wappalyzer**, encontraremos la versión de **Next.js** que utiliza la aplicación.

<img alt="4" src="https://github.com/user-attachments/assets/f7b3e099-af3c-4cf2-9af7-e49faaf02b54" />


# Explotación
Una vez finalizada toda la enumeración, buscaremos y encontraremos una prueba de concepto como esta del usuario **alihussainzada**:

[Prueba de concepto](https://github.com/alihussainzada/CVE-2025-29927-PoC)

Esta prueba de concepto demuestra que el framework **Next.js** es vulnerable a la cabecera **x-middleware-subrequest**. Sabiendo esto, utilizaremos herramientas para hacer fuzzing, como **dirsearch**, añadiendo el parámetro **-H** para incluir la cabecera.

Con un poco de paciencia, encontraremos el directorio **api** y dentro de él, **download**.

<img alt="5" src="https://github.com/user-attachments/assets/f3fd7bdd-f878-4115-b7b9-d35bca97985a" />

**Download** puede ser el directorio que lista los contenidos de la web. Nos falta encontrar el parámetro que utiliza para listar archivos. Utilizando la herramienta **ffuf**, podremos realizar fuzzing nuevamente para encontrar el parámetro.

<img alt="6" src="https://github.com/user-attachments/assets/bcdfb434-f74d-4e26-a39e-6dcf04eab1f2" />

Sabiendo el directorio y el parámetro, hacemos una prueba de concepto para demostrar que es vulnerable a **Local File Inclusion**.

<img alt="7" src="https://github.com/user-attachments/assets/8e040d7b-80b6-4115-9fd9-6cc611e7f77b" />

Ahora toca enumerar los archivos hasta encontrar bases de datos o credenciales para acceder a la máquina. Lo primero y más importante es conocer cómo se estructura un proyecto de **Next.js**. En esta web podremos ver qué archivos y carpetas se crean al generar un proyecto nuevo:

[Documentación de Next.js](https://nextjs.org/docs/app/getting-started/project-structure)

Conociendo un poco más la aplicación, encontraremos este archivo, que nos indica las variables de entorno.

<img alt="9" src="https://github.com/user-attachments/assets/2a6ec1f6-bc44-42ac-be7c-bb5292ee28b3" />

Al seguir enumerando la máquina, encontramos este archivo que puede sugerir dónde están las credenciales.

<img alt="10" src="https://github.com/user-attachments/assets/a7484382-5dd1-41fd-a5ee-3b9506a2e79a" />

El archivo tiene caracteres especiales en el nombre, así que tendremos que codificarlo a URL para poder listar el archivo sin problemas. Cuando veamos su contenido, nos costará mucho leerlo, así que debemos utilizar páginas web como **"js-beautify"** para facilitar la lectura.

<img alt="11" src="https://github.com/user-attachments/assets/3228d415-1e30-4e3d-be6c-f9bec00839c4" />

Pegando el contenido del archivo y pulsando en el botón de **"Beautify Code"**, se nos facilitará la lectura.

<img alt="12" src="https://github.com/user-attachments/assets/8e1ee479-3b1e-467f-9d51-6eb28cee9b13" />

En el contenido del archivo, podremos ver credenciales. Probaremos a iniciar sesión con ellas.

<img alt="13" src="https://github.com/user-attachments/assets/0d6f17f0-69b5-483f-ab93-3abcaa708bfb" />

Hemos podido acceder al SSH; ahora podremos obtener la primera flag.

<img alt="14" src="https://github.com/user-attachments/assets/bbbe2821-f7b5-4b64-a042-c05a66604523" />

# Escalada de privilegios

Una vez accedido al usuario **jeremy**, tendremos que buscar algo que nos permita escalar privilegios. En este caso, el programa **Terraform** puede ser ejecutado por **jeremy** con privilegios de administrador.

<img alt="15" src="https://github.com/user-attachments/assets/ccf5e216-bed3-404d-a42c-6a189a18cdec" />

Investigamos cómo funciona la aplicación **Terraform**. Para ejecutar esta aplicación, es necesario utilizar un directorio para aplicar una configuración. Si visualizamos el código, aprenderemos que necesita un archivo **"examples"**.

<img alt="16" src="https://github.com/user-attachments/assets/7ab56cc2-45a5-4fbd-9277-2bb4e4ea1fd5" />

Mirando otros archivos, podemos encontrar uno que nos enseña cómo la aplicación gestiona la infraestructura de la máquina.

<img alt="17" src="https://github.com/user-attachments/assets/d8246a5d-b736-4490-a523-db424bffe609" />

Dentro del directorio de **jeremy**, hay un archivo oculto llamado **.terraformrc**.

<img alt="18" src="https://github.com/user-attachments/assets/da267f6f-5ee1-40a4-b38f-5cda0cbc02cc" />

Podemos editarlo para añadir un archivo que nos permita escalar privilegios.

<img alt="19" src="https://github.com/user-attachments/assets/7506ae90-7c96-4dc0-be73-6beba106618d" />

Creamos un archivo en **C** simple que mejorará nuestra shell con permisos de administrador.

<img alt="20" src="https://github.com/user-attachments/assets/0eb5da55-16d0-4d0a-8c66-6ef85f149462" />

Lo compilamos con **gcc**.

<img alt="21" src="https://github.com/user-attachments/assets/acfa7e43-02ae-4b48-95ff-85387db46d20" />

Finalmente, lo ejecutaremos. Puede dar un fallo indicando que no ha podido cargar algunas estructuras, pero lo importante es que nuestro payload sí se ha cargado.

<img alt="22" src="https://github.com/user-attachments/assets/590e3c4a-6423-45ff-8824-e6aebf491069" />

Ejecutando el comando **bash -p**, mejoraremos la shell y obtendremos la segunda flag.

<img alt="23" src="https://github.com/user-attachments/assets/5b2b98bf-2740-4af9-b7b0-83e9d2c24537" />

# Conclusión

En la máquina **Previous**, realizamos una enumeración de puertos y servicios, lo que nos permitió identificar la vulnerabilidad en el framework **Next.js**. A través de fuzzing, descubrimos el directorio **api** y el parámetro necesario para realizar **Local File Inclusion**, lo que nos llevó a obtener credenciales incrustadas en el código. Con estas credenciales, accedimos a SSH como **jeremy** y obtuvimos la primera flag.

El reconocimiento de después reveló que **jeremy** podía ejecutar **Terraform** con privilegios de administrador. Modificamos el archivo de configuración **.terraformrc** para incluir un script que nos permitiera escalar privilegios. Al ejecutar este script, logramos obtener una shell con permisos de administrador, lo que nos permitió capturar la flag final. 

![ken](https://github.com/user-attachments/assets/03c28eee-8b4a-4ac0-9601-0e036fc89aa8)
