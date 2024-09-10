---
title: Mailing WriteUp Hack The Box
published: true
---

Hey!

Vamos a hackear la máquina "Mailing" de Hack The Box. Esta máquina se centra en vulnerar aplicaciones ofimáticas.

![Mailing](https://github.com/user-attachments/assets/df196382-4f6b-41f6-87a0-1d19eeacc579)

# Enumeración

Empezamos enumerando los puertos abiertos que tiene la máquina con nmap.

![Pasted image 20240908203504](https://github.com/user-attachments/assets/315d9a18-3afb-44cb-880f-b19d82148034)

Como se puede ver, esta máquina tiene múltiples puertos abiertos, pero el más importante es el puerto 25 con Simple Mail Transfer Protocol (SMTP). Este puerto nos revela el Domain Name Server (DNS) "mailing.htb". Lo añadimos a nuestro archivo /etc/hosts y accedemos a su página web.

![Pasted image 20240908204132](https://github.com/user-attachments/assets/9be401d2-d4a2-4c5e-b682-616542f5bae9)
![Pasted image 20240908204356](https://github.com/user-attachments/assets/da73db9b-8545-4170-9533-811d4e414022)

Nada más entrar, podemos ver nombres que nos pueden servir más adelante y un botón de "Download Instructions". Nos descargará un archivo PDF donde se explica cómo conectarse al servidor de correo de "mailing.htb". Dentro de él no hay mucha información relevante.

Si intentamos interceptar la petición cuando pulsamos el botón, vemos que utiliza código PHP vulnerable.

![Pasted image 20240908210926](https://github.com/user-attachments/assets/db7e5b96-d126-42f4-8f1e-7a21ea92b6fb)

# Explotación

Si modificamos la petición, podemos buscar archivos dentro del sistema que nos permitan acceder sin autorización. Buscaremos el archivo "hMailServer.ini" para obtener las contraseñas del servidor de correo.

![Pasted image 20240908211324](https://github.com/user-attachments/assets/4bf233ca-8129-41ce-a197-3d7fea75145a)

Como se ve en la imagen, hemos obtenido el hash de la contraseña del administrador. Para saber cuál es la contraseña, podemos utilizar herramientas como "CrackStation" y obtener la contraseña.

![Pasted image 20240908211854](https://github.com/user-attachments/assets/be26de0b-9314-4127-9d88-85fad09069b1)

El siguiente paso sería encontrar alguna vulnerabilidad para acceder al sistema con la contraseña que hemos conseguido. Con el siguiente código de Xaitax, podremos obtener ejecución de comandos.

![Pasted image 20240908213130](https://github.com/user-attachments/assets/66a886c1-4daa-4aca-a060-4db36d7a10b9)

Nos descargamos la prueba de concepto, activamos la aplicación "Responder", la dejamos en escucha y proporcionamos los parámetros que necesitemos.

![Pasted image 20240908214622](https://github.com/user-attachments/assets/3ec16a33-2c9f-483c-ab20-18d8ca85f20c)

Al cabo de un rato, recibimos el hash de la contraseña de Maya.

![Pasted image 20240910124704](https://github.com/user-attachments/assets/b15d6aeb-5ae0-42d5-b1a7-022182fe2355)

Desencriptamos el hash con la herramienta "John".

![Pasted image 20240910124839](https://github.com/user-attachments/assets/ab72a463-0144-4ee7-9581-2bdbd6a95b20)

Y ahora podremos acceder al sistema y conseguir la primera flag.

![Pasted image 20240910125240](https://github.com/user-attachments/assets/46a75876-9f81-4ccd-8f02-dbf5693003a1)
![Pasted image 20240910125520](https://github.com/user-attachments/assets/82e53cbc-f226-4ce3-87a8-331367ad3110)

# Escalada de privilegios

Para empezar, miramos qué puede hacer el usuario "Maya". No puede hacer nada interesante, pero sí puede conectarse al "WinRM", como hemos visto antes. Sin embargo, si miramos qué aplicaciones tiene instaladas, veremos que está "LibreOffice" y la versión que tiene instalada es vulnerable.

![Pasted image 20240910130358](https://github.com/user-attachments/assets/27bc730c-cfa8-48d5-9fab-6d53cdaeed31)

Si buscamos en internet, veremos que existe un CVE para esa versión de LibreOffice. Con este exploit, crearemos un documento malicioso de LibreOffice que nos permitirá ejecutar un comando como root.

![Pasted image 20240910131132](https://github.com/user-attachments/assets/fbe869fd-7999-423d-b078-1cbaca2f08b4)

Creamos un documento malicioso que ejecute el archivo "nc.exe" para tener una reverse shell como administrador.

![Pasted image 20240910134443](https://github.com/user-attachments/assets/033ded11-4b5f-4027-941f-3fa8adc96a6e)

Subimos el archivo de nc en la carpeta que hemos indicado anteriormente.

![Pasted image 20240910134659](https://github.com/user-attachments/assets/94b67ada-6066-4a30-abef-6f5f9f97a3d7)

Nos ponemos en escucha, subimos el documento malicioso y recibiremos una shell como administrador.

![Pasted image 20240910134730](https://github.com/user-attachments/assets/c9dcebf7-3ce5-4c17-8b13-9585e20ca225)
![Pasted image 20240910134846](https://github.com/user-attachments/assets/109c413c-79f5-4fca-a4c6-fbf5a1acd242)

Esto ha sido todo. ¡Nos vemos en el siguiente post!

![ZRPK](https://github.com/user-attachments/assets/efd20496-6fbc-41d6-af7b-84471c9bc893)
