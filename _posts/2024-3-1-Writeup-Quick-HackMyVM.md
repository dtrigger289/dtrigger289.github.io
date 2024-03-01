---
title: Darkside WriteUp HackMyVM
published: true
---

Hey!

Hoy vamos a probar la máquina "Quick", que como su nombre indica es una máquina muy rapida de completar.

![quick](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/903b8dfc-f162-432b-bfb0-45f1ffd37bf2)

# Reconocimiento

Utilizando nmap, vamos a ver que puertos tiene abiertos la máquina

```nmap
nmap -sVC 10.0.2.4

Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-02-29 15:33 CET

Nmap scan report for 10.0.2.4

Host is up (0.00039s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Quick Automative
|_http-server-header: Apache/2.4.41 (Ubuntu)
```

Cuando termine el proceso, podemos ver que solo tiene el puerto 80 abierto y que es una máquina con el sistema operativo "Ubuntu" que utiliza la versión de "Apache" 2.4.41

Entramos en el puerto 80 desde el buscador y vemos la siguiente página

![Captura desde 2024-02-29 15-51-34](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/caf164af-c000-4253-b601-93055e8afa5b)

Si probamos a entrar en otra pestaña de la página, nos daremos cuenta de que la URL llama a los diferentes scripts utilizando la función "page"

```html
http://10.0.2.4/index.php?page=cars
```

![Captura desde 2024-02-29 15-55-54](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/6f331912-21e9-4de8-b76a-9966d26d4f77)

# Explotación

Podemos intentar que la página ejecute comandos desde la URL, para ello iniciaremos un servidor php para probar si podemos hacer que ejecute archivos de nuestra máquina

![Captura desde 2024-02-29 16-02-40](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/ebbc20b8-d829-4501-92ce-c312f7752d1d)

Parece ser que si ejecuta archivos, pero añade la extensión ".php" al final de cada fichero. Podemos probar que ejecute una revershell para conectarnos a la máquina

![Captura desde 2024-02-29 16-07-49](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/9ea29f5e-439a-412b-960b-c6856c9161c9)

¡Efectivamente! nos hemos podido conectar a la máquina. Ahora lo que hacemos es configurar nuestra terminal para que sea interactiva y sea más agradable su uso

```bash
script /dev/null -c bash
CTRL + Z
stty raw -echo; fg
reset xterm
export TERM=xterm
export SHELL=bash
```

Ahora nos dirigimos a la carpeta del usuario "andrew" y allí tendremos la primera flag de la máquina

![Captura desde 2024-03-01 17-10-42](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/8e5de0f2-93fb-47b0-bc19-29df411b036f)

# Escalada de privilegios

Primero buscamos las SUID de los binarios utilizando la herramienta "find"

```bash
find / -perm -4000 2>/dev/null
```

Y encontramos que el binario "php7.0" tiene SUID

![Captura desde 2024-03-01 17-13-34](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/71cb2a23-90a1-4b7c-9522-422292bbd68b)

Ahora buscamos alguna escalada de privilegios que pueda funcionar con php. Si miramos en GTFOBins podemos hacer esta escalada

![Captura desde 2024-03-01 17-27-05](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/9196e73f-fbeb-4c1f-8aed-abd7b1e60c9b)

La ejecutamos y seremos el usuario "root"

![Captura desde 2024-03-01 17-28-42](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/3b9450f4-111b-4731-adaa-c22c38d4dde7)

Y ahí conseguiríamos la 2ª "flag" de la máquina.
