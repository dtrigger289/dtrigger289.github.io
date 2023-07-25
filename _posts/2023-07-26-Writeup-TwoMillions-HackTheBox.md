---
title: TwoMillions Writeup
published: true
---

Hoy haremos la máquina "TwoMillions" de Hack The Box. Esta máquina se publicó cuando la plataforma llegó a los 2 millones de usuarios, es una máquina fácil con sistema operativo linux, la intrusión es algo complicada pero la escalada de privilegios es fácil.

![TwoMillion](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/d50c6709-5fb7-4fe1-9472-adc8d2ac3c95)

# Enumeración

Comenzando con la enumeración podemos ver que tiene el puerto 22 y el 80 con un framework "nginx"

```nmap
nmap -sCV -T4 10.10.11.221

Starting Nmap 7.94 ( https://nmap.org ) at 2023-07-25 15:41 CEST
Nmap scan report for 2million.htb (10.10.11.221)
Host is up (0.049s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx
|_http-trane-info: Problem with XML parsing of /evox/about
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: Hack The Box :: Penetration Testing Labs
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.23 seconds
```

Intentamos acceder al puerto 80 y vemos que redirige a "2million.htb", para poder acceder tendremos que añadir la ip en nuestro /etc/hosts

![1a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/3413cf9a-9aa1-43ca-a11f-03cf66cb792b)

Para añadirlo en el /etc/hosts tendremos que usar nano o algo que nos permita escribir en el archivo

```bash
sudo nano /etc/hosts

127.0.0.1       localhost
127.0.1.1       kali
10.10.11.221    2million.htb

::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters
```

Dentro de la página web nos puede interesar la parte de "login" y de "join". Si intentamos iniciar sesión no vamos a poder aunque intentemos una inyección SQL. Tendremos que crearnos una cuenta en el apartado de "login"

![2a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/ee7689ed-09ef-44a7-85c9-1217cfe570ef)

Dentro de "login" vemos que necesitamos un código de invitación pero si miramos dentro del código de la página vemos que en el apartado "Debugger" existe un script en JavaScript llamado "inviteapi.min.js" que está ofuscado. Utilizando [Js-beautifier](https://beautifier.io/) podemos ver mejor el código y vemos que utiliza una función llamada "makeInviteCode"

```javascript
function verifyInviteCode(code) {
    var formData = {
        "code": code
    };
    $.ajax({
        type: "POST",
        dataType: "json",
        data: formData,
        url: '/api/v1/invite/verify',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    })
}

function makeInviteCode() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: '/api/v1/invite/how/to/generate',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    })
}
```

La ejecutamos desde la consola del navegador y obtendremos esto:

![3a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/3b4c4081-c536-4aab-8a38-a4bd6f64a267)

Podemos ver que la frase esta encriptada en "ROT13". Para desencriptarla podemos usar [Cyberchef](https://gchq.github.io/CyberChef/) y obtendremos la siguiente frase "In order to generate the invite code, make a POST request to /api/v1/invite/generate"

Entonces con "curl" haremos un POST a esa url para generar un código.

```curl
curl -X POST 2million.htb/api/v1/invite/generate

{"0":200,"success":1,"data":{"code":"VERFUUctOEhLUUotOVgyNk4tS1Q4SUo=","format":"encoded"}}
```

Este código también esta encriptado pero esta vez en base64 (porque el código es corto y tiene un "=" al final), así que volvemos a usar [Cyberchef](https://gchq.github.io/CyberChef/) y obtenemos un codigo de invitación para poder crear nuestra cuenta.

# Explotación

Dentro de la pagina web lo más importante que podemos encontrar es el apartado de "Access", hay dos botones que nos puede interesar, capturamos la petición de "generate" y la mandamos al apartado de "Repeter". Este proceso puede aparecer algún error, para solucionarlo tendremos que ejecutar "burpsuite" como usuario administrador.

![4a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/9c5c0d3e-cadd-459c-8551-fd625d1bfae6)

Si hacemos una petición a /api/v1 podemos ver todas las rutas y ver si podemos ver algunas rutas peligrosas

![5a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/50d1a2cf-3ffd-4f2d-85c8-f04870cb984c)

Después de mucho tiempo descubro que en /api/v1/admin/settings/update podemos actualizar nuestra cuenta a admin.

![6a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/517f3b68-12c6-47ee-94b8-c51a1d45a737)

Ahora probamos si podemos crear una revershell en el apartado /api/v1/admin/vpn/generate.

![7a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/f6bc68cd-caca-4c6f-b524-cbb86f8c985d)

Una vez dentro, somos el usuario "www-data" y podemos ver en el archivo ".env" podemos ver el usuario y la contraseña del SSH

```bash
www-data@2million:~/html$ cat .env 

DB_HOST=127.0.0.1
DB_DATABASE=htb_prod
DB_USERNAME=admin
DB_PASSWORD=SuperDuperPass123
```

Para cambiar de usuario utilizamos el comando

```bash
www-data@2million:~/html$ su - admin
Password: SuperDuperPass123
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

admin@2million:~$ 
```

Y en su carpeta podremos encontrar la user.txt

# Escalada de privilegios

Empezamos viendo que puede acceder el usuario "admin"

```bash
admin@2million:~$ find / -user admin 2>/dev/null | grep -v '^/run\|^/proc\|^/sys 
/home/admin
/home/admin/.cache
/home/admin/.cache/motd.legal-displayed
/home/admin/.ssh
/home/admin/.profile
/home/admin/.bash_logout
/home/admin/.bashrc
/var/mail/admin
```

Vemos el archivo /var/mail/admin y dentro podemos ver que el ssh utiliza "OverlayFS". Buscamos vulnerabilidades y encontramos el siguiente github (https://github.com/xkaneiki/CVE-2023-0386/) 

Para ejecutarlo tendremos que tener 2 consolas con la misma sesión y seguir los pasos del github en la maquina victima.

![8a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/4fdbc373-686f-4eac-a660-25953b1e3b16)

![9a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/7fef433f-08fe-4332-aa67-2ede949d2862)

Accedemos a la carpeta /root y conseguiriamos el root.txt para finalizar la máquina
