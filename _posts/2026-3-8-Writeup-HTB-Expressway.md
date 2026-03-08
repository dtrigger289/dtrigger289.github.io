---
title: Expressway WriteUp Hack The Box
published: true
---

# Introducción
**Expressway** es una máquina fácil de **Hack The Box** que destaca la importancia de realizar un buen reconocimiento con **Nmap**, la negociación de claves a través de **IKE (Internet Key Exchange)**, la técnica de crackeo de hashes y la escalación de privilegios mediante una vulnerabilidad en **sudo**.

# Reconocimiento
Comenzamos con nuestro clásico escaneo de puertos usando **Nmap**. Para nuestra sorpresa, solo encontramos el puerto **22** (SSH). Aunque podríamos intentar ataques de fuerza bruta, esto consumiría mucho tiempo, ya que no contamos con usuarios ni contraseñas para probar.

<img src="https://github.com/user-attachments/assets/ee43ff25-ecdb-4d41-9dd2-d0ce833cb451" />

Dado que no es habitual en nosotros, decidimos escanear los puertos **UDP**. Después de un tiempo, descubrimos el puerto **500 UDP**, que ejecuta el servicio **ISAKMP**, utilizado por **IKE** para la negociación de VPN.

<img src="https://github.com/user-attachments/assets/0024ca0c-0608-4eee-a641-942c5fb5755b" />

Usaremos la herramienta [**ike-scan**](https://salsa.debian.org/pkg-security-team/ike-scan) para probar este servicio.

<img src="https://github.com/user-attachments/assets/9d598b2d-3e7f-41e0-93b6-fbccfc5466a9" />

Este escaneo nos revela que utiliza un tipo de cifrado **3DES**, que actualmente es débil, junto con un hash **SHA1**, que también es vulnerable en la actualidad. Procederemos a realizar un escaneo más agresivo.

<img src="https://github.com/user-attachments/assets/d98512ea-4f7b-4792-8029-eeeaf83203c4" />

# Explotación
Con el siguiente comando, descubrimos que el **ID** tiene un valor de ike@expressway.htb, que podría ser el nombre de usuario; lo utilizaremos después para acceder al puerto **22**. Con la misma herramienta, extraeremos el hash del **PSK** para crackearlo, ya que es débil.

<img src="https://github.com/user-attachments/assets/1c8b2739-2688-4ac9-8eff-a14b6f94595d" />

Ya tenemos el hash; ahora utilizaremos la herramienta **psk-crack** para obtener la contraseña.

<img src="https://github.com/user-attachments/assets/cbf67524-da20-4aac-8c40-f83e4b782733" />

Hemos conseguido la contraseña; ahora ingresaremos en el puerto **22**, obtendremos la primera flag y comenzaremos la escalación de privilegios.

<img src="https://github.com/user-attachments/assets/8b7e42cc-3c65-4f7d-8bf0-b1b650303790" />

# Escalada de privilegios
Primero, verifiquemos qué podemos hacer con **sudo**.

<img src="https://github.com/user-attachments/assets/bfaeffeb-ab18-4b79-a49c-74894153ad8d" />

Este mensaje de error es inusual; procederemos a comprobar el binario. Como se observa en la siguiente imagen, **sudo** se encuentra en una ruta que no es la habitual; normalmente, debería estar en **/usr/bin/sudo**. Esto indica que alguien ha instalado otra versión de **sudo**.

<img src="https://github.com/user-attachments/assets/a9de252b-9094-4b15-a767-01c849be2a74" />

Verifiquemos la versión para confirmar nuestras sospechas.

<img src="https://github.com/user-attachments/assets/20ec5867-4fcc-4d4e-9cd9-5ad37af951a9" />

Está utilizando la versión **1.9.17**. Busquemos en Internet si existe algún **CVE** relacionado con esta versión. Al realizar una búsqueda rápida, encontramos un [**CVE-2025-32463**](https://github.com/K1tt3h/CVE-2025-32463-POC) que nos permite escalar privilegios.

<img src="https://github.com/user-attachments/assets/74cba1aa-485b-4c59-8cd3-bfed6c69cb7c" />

Solo nos queda crear este exploit en la máquina víctima en el directorio **/tmp**.

<img src="https://github.com/user-attachments/assets/13b4f3f8-4acc-4bc4-98d0-b92a22a93e52" />

Por último, daremos permisos de ejecución, ejecutaremos el exploit y obtendremos la última flag.

<img src="https://github.com/user-attachments/assets/f025316e-6547-4198-82ea-ae3f9014d4a8" />

# Conclusión
La máquina **Expressway** nos enseña sobre la relevancia de realizar un escaneo de puertos TCP y UDP, los peligros de los protocolos criptográficos obsoletos, las técnicas de descifrado de contraseñas, la identificación y explotación de instalaciones de software personalizadas, así como la investigación y aplicación de exploits públicos de **CVE**. Esta máquina es perfecta para cualquier persona que esté comenzando a resolver máquinas en **Hack The Box**.

Espero que les haya gustado. ¡Nos vemos en la próxima!

![ken](https://github.com/user-attachments/assets/306dde1b-4c5d-447e-90e5-fa7ed51ee3f7)
