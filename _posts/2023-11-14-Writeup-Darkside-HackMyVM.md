---
title: Darkside WriteUp HackMyVM
published: true
---

Hoy probaré la página de HackMyVM porque me la han recomendado mucho, empezaremos con esta máquina ya que es sencilla y buena para calentar

# Reconocimiento

Usando el comando:

```bash
sudo netdiscover -r 192.168.X.X/24
```

Podremos buscar las IPs en nuestra red y descubrimos que la IP de la maquina es: "192.168.1.90"

Usamos nmap para ver que puertos tiene activados

```nmap
sudo nmap -sS -sC -sV 192.168.1.90

Starting Nmap 7.94 ( https://nmap.org ) at 2023-11-10 12:50 CET
Nmap scan report for 192.168.1.90
Host is up (0.000059s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u2 (protocol 2.0)
| ssh-hostkey: 
|   3072 e0:25:46:8e:b8:bb:ba:69:69:1b:a7:4d:28:34:04:dd (RSA)
|   256 60:12:04:69:5e:c4:a1:42:2d:2b:51:8a:57:fe:a8:8a (ECDSA)
|_  256 84:bb:60:b7:79:5d:09:9c:dd:24:23:a3:f2:65:89:3f (ED25519)
80/tcp open  http    Apache httpd 2.4.56 ((Debian))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: The DarkSide
|_http-server-header: Apache/2.4.56 (Debian)
MAC Address: 08:00:27:D4:DF:30 (Oracle VirtualBox virtual NIC)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Vemos que tiene los puertos 22 y el 80. Entramos en el puerto 80 y vemos que tiene una pagina para iniciar sesión. Podemos probar con injección SQL pero no me ha dado ningun resultado.

![1](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/7ced19bd-166c-4cc3-b58b-5563f3a958b5)

Probamos con la herramienta "gobuster" para encontrar subdirectorios encontramos el directorio "backup"

```bash
gobuster dir -u 192.168.1.90 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

Dentro de backup vemos un "vote.txt" y encontramos el posible usuario para entrar en la página

![2](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/23517dd1-578e-4484-9cf8-de8e9930ad87)

# Explotación

Asi que probamos a hacer un ataque de fuerza bruta con "burpsuite" para encontrar la contraseña de "kevin". Primero capturamos la petición con "burpsuite".

![3](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/222aef85-2bf2-4fb6-bcec-0375c82f73c3)

La mandamos al Intruder y marcamos la palabra donde va la contraseña.

![4](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/23e688ad-0b1c-4936-b4a0-5f51718f2cd9)

Nos vamos al apartado de "Payloads", cargamos un diccionario de contraseñas y empezamos el ataque

![5](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/c9e749fc-d10e-4a57-a5d4-93560f9767f9)

Despues de un rato, la contraseña al final era "iloveyou"

![6](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/ede9da67-ff74-4e2a-bcf1-ed36943d2ba6)

Entramos con la contraseña y vemos lo siguiente

![7](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/2bf3cc57-6e79-4e32-ad73-aa3e1c0ba209)

Este codigo podemos probar a desencriptarlo con "cyberchef"

![8](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/8f3f0399-90ac-4f3d-af5c-0642ad2942f7)

Este enlace nos lleva a otra parte de la página 

![9](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/0a7a6e05-b185-44c5-878b-ab6a1258fbc8)

Si miramos el codigo fuente de la página se ejecuta un codigo javascript relacionado con las cookies, en el apartado de las cookies existe el apartado "whiteside".

![10](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/ff07877f-d69d-49dc-a4ed-53e17f5144cc)

Probamos a cambiar el nombre a "darkside" (ya que la máquina se llama "darkside") y nos dá el usuario y la contraseña del ssh

![11](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/9f29867c-5cc9-479d-861e-12941f49d4ed)

Si miramos dentro del directorio encontramos la "user.txt" y así habríamos completado la primera parte de la máquina

# Escalada de privilegios

Mirando mas a fondo del directorio, podemos ver un archivo llamado ".history"

![12](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/0715fa01-96a4-49b7-9452-1cd8082e33c7)

Así de fácil encontramos la contraseña para el siguiente usuario. Ahora solo toca llegar hasta root, usando el comando ```sudo -l``` podremos saber que permisos puede ejecutar "rijaba" como administrador

![13](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/15660768-4632-43bb-9b16-9417c3301de9)

El siguiente paso será buscar en GTFObins si existe alguna forma de escalar de privilegios usando "nano" o tendremos que buscar otra forma. Suerte para nosotros si existe una forma, la replicamos y tendremos el acceso a root

![14](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/d1105e87-b699-43a0-b5b2-27592785660a)

Siguiendo los pasos primero tenemos que ejecutar ```sudo nano```, pulsar ctrl+R, pulsar ctrl+X y ejecutar ```reset; sh 1>&0 2>&0``` y quedaría así

![15](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/8ca34085-032d-4ad0-bd4b-23469fba4e8d)

Al lado de "Executing..." está el simbolo "#" haciendo referencia a root, si desde ahí creamos un archivo usando nano y salimos tendremos una consola como root

![16](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/c3962a82-a9cd-4e46-b246-33a907038d7b)

Finalmente vamos al directorio de root y allí encontramos la segunda flag y habríamos completado la máquina

![imagen](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/72181e5a-4376-4b34-bfc7-3600e2267f5e)
