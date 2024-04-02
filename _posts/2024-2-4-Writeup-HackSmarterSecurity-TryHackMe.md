---
title: HackSmarterSecurity WriteUp TryHackMe
published: true
---

![image](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/3f8c088a-9ec0-4878-81cb-47fcfcfdfa35)

Buenas! Hoy vamos a hacer la máquina "Hack Smarter Security" de TryHackMe
# Reconocimiento

Empezamos reconociendo todos los puertos que tiene abiertos la máquina

```nmap
nmap -sCV 10.10.106.152
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-04-01 16:15 CEST
Nmap scan report for 10.10.106.152
Host is up (0.054s latency).
Not shown: 995 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           Microsoft ftpd
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| 06-28-23  02:58PM                 3722 Credit-Cards-We-Pwned.txt
|_06-28-23  03:00PM              1022126 stolen-passport.png
| ftp-syst: 
|_  SYST: Windows_NT
22/tcp   open  ssh           OpenSSH for_Windows_7.7 (protocol 2.0)
| ssh-hostkey: 
|   2048 0d:fa:da:de:c9:dd:99:8d:2e:8e:eb:3b:93:ff:e2:6c (RSA)
|   256 5d:0c:df:32:26:d3:71:a2:8e:6e:9a:1c:43:fc:1a:03 (ECDSA)
|_  256 c4:25:e7:09:d6:c9:d9:86:5f:6e:8a:8b:ec:13:4a:8b (ED25519)
80/tcp   open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: HackSmarterSec
| http-methods: 
|_  Potentially risky methods: TRACE
1311/tcp open  ssl/rxmon?
| fingerprint-strings: 
|   GetRequest: 
|     HTTP/1.1 200 
|     Strict-Transport-Security: max-age=0
|     X-Frame-Options: SAMEORIGIN
|     X-Content-Type-Options: nosniff
|     X-XSS-Protection: 1; mode=block
|     vary: accept-encoding
|     Content-Type: text/html;charset=UTF-8
|     Date: Mon, 01 Apr 2024 14:16:04 GMT
|     Connection: close
|     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
|     <html>
|     <head>
|     <META http-equiv="Content-Type" content="text/html; charset=UTF-8">
|     <title>OpenManage&trade;</title>
|     <link type="text/css" rel="stylesheet" href="/oma/css/loginmaster.css">
|     <style type="text/css"></style>
|     <script type="text/javascript" src="/oma/js/prototype.js" language="javascript"></script><script type="text/javascript" src="/oma/js/gnavbar.js" language="javascript"></script><script type="text/javascript" src="/oma/js/Clarity.js" language="javascript"></script><script language="javascript">
|   HTTPOptions: 
|     HTTP/1.1 200 
|     Strict-Transport-Security: max-age=0
|     X-Frame-Options: SAMEORIGIN
|     X-Content-Type-Options: nosniff
|     X-XSS-Protection: 1; mode=block
|     vary: accept-encoding
|     Content-Type: text/html;charset=UTF-8
|     Date: Mon, 01 Apr 2024 14:16:09 GMT
|     Connection: close
|     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
|     <html>
|     <head>
|     <META http-equiv="Content-Type" content="text/html; charset=UTF-8">
|     <title>OpenManage&trade;</title>
|     <link type="text/css" rel="stylesheet" href="/oma/css/loginmaster.css">
|     <style type="text/css"></style>
|_    <script type="text/javascript" src="/oma/js/prototype.js" language="javascript"></script><script type="text/javascript" src="/oma/js/gnavbar.js" language="javascript"></script><script type="text/javascript" src="/oma/js/Clarity.js" language="javascript"></script><script language="javascript">
| ssl-cert: Subject: commonName=hacksmartersec/organizationName=Dell Inc/stateOrProvinceName=TX/countryName=US
| Not valid before: 2023-06-30T19:03:17
|_Not valid after:  2025-06-29T19:03:17
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=hacksmartersec
| Not valid before: 2024-03-31T14:13:56
|_Not valid after:  2024-09-30T14:13:56
|_ssl-date: 2024-04-01T14:16:22+00:00; +1s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: HACKSMARTERSEC
|   NetBIOS_Domain_Name: HACKSMARTERSEC
|   NetBIOS_Computer_Name: HACKSMARTERSEC
|   DNS_Domain_Name: hacksmartersec
|   DNS_Computer_Name: hacksmartersec
|   Product_Version: 10.0.17763
|_  System_Time: 2024-04-01T14:16:18+00:00
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port1311-TCP:V=7.94SVN%T=SSL%I=7%D=4/1%Time=660AC1A3%P=x86_64-pc-linux-
SF:gnu%r(GetRequest,1089,"HTTP/1\.1\x20200\x20\r\nStrict-Transport-Securit
SF:y:\x20max-age=0\r\nX-Frame-Options:\x20SAMEORIGIN\r\nX-Content-Type-Opt
SF:ions:\x20nosniff\r\nX-XSS-Protection:\x201;\x20mode=block\r\nvary:\x20a
SF:ccept-encoding\r\nContent-Type:\x20text/html;charset=UTF-8\r\nDate:\x20
SF:Mon,\x2001\x20Apr\x202024\x2014:16:04\x20GMT\r\nConnection:\x20close\r\
SF:n\r\n<!DOCTYPE\x20html\x20PUBLIC\x20\"-//W3C//DTD\x20XHTML\x201\.0\x20S
SF:trict//EN\"\x20\"http://www\.w3\.org/TR/xhtml1/DTD/xhtml1-strict\.dtd\"
SF:>\r\n<html>\r\n<head>\r\n<META\x20http-equiv=\"Content-Type\"\x20conten
SF:t=\"text/html;\x20charset=UTF-8\">\r\n<title>OpenManage&trade;</title>\
SF:r\n<link\x20type=\"text/css\"\x20rel=\"stylesheet\"\x20href=\"/oma/css/
SF:loginmaster\.css\">\r\n<style\x20type=\"text/css\"></style>\r\n<script\
SF:x20type=\"text/javascript\"\x20src=\"/oma/js/prototype\.js\"\x20languag
SF:e=\"javascript\"></script><script\x20type=\"text/javascript\"\x20src=\"
SF:/oma/js/gnavbar\.js\"\x20language=\"javascript\"></script><script\x20ty
SF:pe=\"text/javascript\"\x20src=\"/oma/js/Clarity\.js\"\x20language=\"jav
SF:ascript\"></script><script\x20language=\"javascript\">\r\n\x20")%r(HTTP
SF:Options,1089,"HTTP/1\.1\x20200\x20\r\nStrict-Transport-Security:\x20max
SF:-age=0\r\nX-Frame-Options:\x20SAMEORIGIN\r\nX-Content-Type-Options:\x20
SF:nosniff\r\nX-XSS-Protection:\x201;\x20mode=block\r\nvary:\x20accept-enc
SF:oding\r\nContent-Type:\x20text/html;charset=UTF-8\r\nDate:\x20Mon,\x200
SF:1\x20Apr\x202024\x2014:16:09\x20GMT\r\nConnection:\x20close\r\n\r\n<!DO
SF:CTYPE\x20html\x20PUBLIC\x20\"-//W3C//DTD\x20XHTML\x201\.0\x20Strict//EN
SF:\"\x20\"http://www\.w3\.org/TR/xhtml1/DTD/xhtml1-strict\.dtd\">\r\n<htm
SF:l>\r\n<head>\r\n<META\x20http-equiv=\"Content-Type\"\x20content=\"text/
SF:html;\x20charset=UTF-8\">\r\n<title>OpenManage&trade;</title>\r\n<link\
SF:x20type=\"text/css\"\x20rel=\"stylesheet\"\x20href=\"/oma/css/loginmast
SF:er\.css\">\r\n<style\x20type=\"text/css\"></style>\r\n<script\x20type=\
SF:"text/javascript\"\x20src=\"/oma/js/prototype\.js\"\x20language=\"javas
SF:cript\"></script><script\x20type=\"text/javascript\"\x20src=\"/oma/js/g
SF:navbar\.js\"\x20language=\"javascript\"></script><script\x20type=\"text
SF:/javascript\"\x20src=\"/oma/js/Clarity\.js\"\x20language=\"javascript\"
SF:></script><script\x20language=\"javascript\">\r\n\x20");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 42.05 seconds
```

Vemos que tiene abiertos los puertos 21, 22, 80, 1311 y el 3389

Entramos en la pagina y podemos ver varias secciones. Pero no hay nada interesante.

![1](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/4f458382-852a-44a7-a9e6-e871460c5cc8)

Probamos a acceder al puerto 1311 y vemos que el software que utiliza es OpenManage. Podemos probar a buscar vulnerabilidades de este sistema.

![2](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/c759c569-7b9c-437e-a8ba-79dfeb1a6581)

# Explotación

Investigando un poco, veo que existe un CVE que vulnera un fallo dentro de OpenManage

![3](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/2e9b7d15-cee9-452b-8aa3-7d063b070fb5)

Nos descargamos el script y lo usamos

![4](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/03da081d-02e7-48fc-a5a1-c0e860c7acac)

Y después de buscar un poco dentro del sistema, existe el archivo "web.config" dentro del servidor web. Allí está la contraseña y el usuario sin cifrar para poder acceder al SSH (puerto 22)

![5](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/732cf27f-efea-4a5f-bf39-993aec28efda)

Introducimos el usuario y la contraseña y conseguiremos

![6](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/3d3537f7-5ef0-4648-aa55-e7a4159ffd41)

Finalmente, la contraseña del usuario estará en su escritorio

![7](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/2a52f236-f9b1-4d58-8236-f88b49ded8ba)

# Escalada de privilegios

Subimos y usamos "WinPEAS.exe" para buscar posibles escaladas de privilegios dentro de la máquina

![8](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/f650607e-0e50-429e-a32f-87195cecccd4)

Lamentablemente no funciona, asi que probaré con otra herramienta llamada "PrivescCheck". Una herramienta que analiza el sistema usando powershell

![9](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/25636a54-7ac9-40f2-bcdf-6faa759b00dc)

Cuando termina el proceso podemos ver que podemos escalar de privilegios aprovechándonos del programa "spoofer-scheduler.exe"

![10](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/812cdb23-8d28-43e1-9b38-58150edf674e)

Para ello usaremos una revershell para escalar de privilegios usando el programa

![11](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/5a9bef93-0eeb-4685-815d-0b16c6b09bf7)

Ahora hacemos ejecutable la revershell usando nim

![12](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/4f6ec99b-d6b4-4d73-95d6-5dd1d1e728c7)

Sustituimos el programa por la revershell maliciosa. Iniciamos una revershell y después reiniciamos el programa

![13](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/2588dd30-1f8e-49a8-bd61-aa12ed6d93ec)

Finalmente obtendremos una revershell con privilegios. Pero como es muy inestable, tendremos que crear un usuario que pertenezca al grupo administrators

![15](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/feb5a397-c55c-4d1f-bb0b-bbd9aceec592)

Nos conectamos a esa cuenta y podremos conseguir la ultima flag

![16](https://github.com/dtrigger289/dtrigger289.github.io/assets/109216235/9ccd14ab-3bf7-4078-b690-099151be4edc)

Y allí estaría la ultima flag que estábamos buscando
