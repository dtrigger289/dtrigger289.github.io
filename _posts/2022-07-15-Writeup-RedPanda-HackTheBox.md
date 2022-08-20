---
title: Red Panda Writeup
published: false
---

(añadir imagen)

Hoy resolveremos la maquina retirada "RedPanda" es una maquina de hack the box de dificultad facil.

# [](#header-1) Enumeración

Empezamos escaneando los puertos de la maquina con nmap

```nmap
nmap -sC -sV -T4 10.10.11.170
Nmap scan report for 10.10.11.170
PORT      STATE SERVICE
22/tcp    open  ssh
8080/tcp  open  http-proxy
```
Con este analisis podemos ver que tiene el puerto ssh y el puerto http abierto. Esto nos hace enteder que esta maquina tiene un puerto para acceder de forma remota y un puerto para poder acceder en internet

![imagen](https://user-images.githubusercontent.com/109216235/185764843-feace9a3-e2e5-43e9-a1c4-3271e7620de2.png)

# [](#header-2) Vulnerabilidad

Dentro de la pagina vemos un buscador y probando payloads vemos que nos bloquea el caracter $

![imagen](https://user-images.githubusercontent.com/109216235/185764827-93488e1f-c4de-4f1c-b9fb-d89c58276616.png)

Probamos con el caracter * y vemos que si que nos deja

![imagen](https://user-images.githubusercontent.com/109216235/185764892-8e6c1201-4efe-42bd-a6c4-26852677a38e.png)

