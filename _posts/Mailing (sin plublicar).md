Hey! 

Vamos a hackear la máquina "Mailing" de Hack The Box. Esta máquina se centra en vulnerar aplicaciones ofimáticas.

![[Mailing.png]]

# Enumeración

Empezamos enumerando los puertos abiertos que tiene la máquina con nmap.

![[Pasted image 20240908203504.png]]

Como se puede ver, esta máquina tiene múltiples puertos abiertos, pero el más importante es el puerto 25 con Simple Mail Transfer Protocol (SMTP). Este puerto nos filtra el Domain Name Server (DNS) "mailing.htb". Lo añadimos a nuestro archivo /etc/host y accedemos a su página web.

![[Pasted image 20240908204132.png]]

![[Pasted image 20240908204356.png]]

Nada más entrar podemos ver nombres que nos pueden servir más adelante y un botón de "Download Instructions". Nos descargará un archivo PDF donde se explica como conectarse al servidor de correo de "mailing.htb", dentro de él no hay mucha información relevante.

Si intentamos interceptar la petición cuando pulsamos el botón, vemos que utiliza código php vulnerable

![[Pasted image 20240908210926.png]]

# Explotación

Si modificamos la petición podemos buscar archivos dentro del sistema que nos permitan acceder sin autorización. Buscaremos por el archivo "hMailServer.ini" para saber las contraseñas del servidor de correo.

![[Pasted image 20240908211324.png]]

Como se ve en la imágen, hemos obtenido el hash de la contraseña del administrador. Para saber cual es la contraseña podemos utilizar herramientas como "CrackStation" y obtener la contraseña.

![[Pasted image 20240908211854.png]]

El siguiente paso sería encontrar alguna vulnerabilidad para acceder al sistema con la 
contraseña que hemos conseguido. Con el siguiente codigo de xaitax, podremos obtener ejecución de comandos.

![[Pasted image 20240908213130.png]]

Nos descargamos la prueba de concepto, activamos la aplicación "responder", la dejamos en escucha y proporcionamos los parámetros que necesitemos

![[Pasted image 20240908214622.png]]

Al cabo de un rato recibimos el hash de la contraseña de maya.

![[Pasted image 20240910124704.png]]

Desencriptamos el hash con la herramienta "john" 

![[Pasted image 20240910125124.png]]

Y ahora podremos acceder al sistema y conseguir la primera flag

![[Pasted image 20240910125240.png]]

![[Pasted image 20240910125520.png]]

# Escalada de privilegios

Para empezar miramos que puede hacer el usuario "maya". No puede hacer nada interesante pero si que puede conectarse al "WinRM" como hemos visto antes. Pero si miramos que aplicaciones tiene instaladas y podremos ver que esta "LibreOffice" y la versión que tiene instalada es vulnerable.

![[Pasted image 20240910130358.png]]

Si buscamos en internet, veremos que existe un CVE para esa versión de libreoffice. Con este exploit creará un documento malicioso de libreoffice que nos permitirá ejecutar un comando como root.

![[Pasted image 20240910131132.png]]

Creamos un documento malicioso que ejecute el archivo "nc.exe" para tener una revershell como administrador

![[Pasted image 20240910134443.png]]

Subimos el archivo de nc en la carpeta que hemos indicado anteriormente

![[Pasted image 20240910134413.png]]

Nos ponemos en escucha y subimos el documento malicioso y recibiremos una shell como administrador

![[Pasted image 20240910134730.png]]

![[Pasted image 20240910134846.png]]
