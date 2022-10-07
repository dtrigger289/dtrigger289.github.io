---
title: Shoppy Writeup
published: false
---

Hoy resolveremos la máquina retirada "Shoppy" es una máquin de hack the box de dificultad fácil.

![Shoppy](https://user-images.githubusercontent.com/109216235/194640772-fe62bab2-662e-4a3e-801c-03e05b456a06.png)

# [](#header-1) Enumeración

Empezamos escaneando los puertos de la máquina con nmap

```nmap
nmap -sC -sV -T4 10.10.11.180

PORT    STATE    SERVICE   VERSION
22/tcp  open     ssh       OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 9e:5e:83:51:d9:9f:89:ea:47:1a:12:eb:81:f9:22:c0 (RSA)
|   256 58:57:ee:eb:06:50:03:7c:84:63:d7:a3:41:5b:1a:d5 (ECDSA)
|_  256 3e:9d:0a:42:90:44:38:60:b3:b6:2c:e9:bd:9a:67:54 (ED25519)
80/tcp  open     http      nginx 1.23.1
|_http-title: Did not follow redirect to http://shoppy.htb
|_http-server-header: nginx/1.23.1
912/tcp filtered apex-mesh
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Con este análisis podemos ver que tiene el puerto ssh y el puerto http abierto. Esto nos hace entender que esta máquina tiene un puerto para acceder de forma remota y un puerto para poder acceder en internet

Al acceder a la página aparece un error:


![imagen](https://user-images.githubusercontent.com/109216235/194642458-b8270486-26fc-451d-af3b-0ffc14159398.png)

