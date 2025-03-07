---
title: Portal cautivo con Wifi Pineapple
published: true
---

# Introducción

Los portales cautivos son una forma de gestionar el acceso a Internet, y durante un fin de semana, mi profesor de "Puesta en Producción Segura", [Carmelo Alcolea](https://www.linkedin.com/in/carmelo-alcolea/), me ha dejado prestado el [Wifi Pineapple de Hak5](https://shop.hak5.org/products/wifi-pineapple), una herramienta para realizar pruebas de ataques a redes. En este post, te mostraré cómo crear un portal cautivo malicioso con este aparato.

# Configuración

Suponiendo que tenemos inicializado el "Wifi Pineapple" y que el dispositivo tiene conexión a Internet, nos dirigimos al apartado de módulos y nos descargamos el módulo "Evil Portal" de [newbi3](https://forums.hak5.org/profile/40973-newbi3/).


![1](https://github.com/user-attachments/assets/a8b75b44-8084-4aae-ae93-2981cd907254)


Una vez instalado, la primera vez que entremos en el módulo, comprobará si tenemos las dependencias; si no las tenemos, las descargará automáticamente.


![2](https://github.com/user-attachments/assets/f6eea27b-d819-4bd7-b5ed-026e78e938a8)


Una vez descargadas, podremos entrar al módulo.


![3](https://github.com/user-attachments/assets/3cd713b6-8e5d-4de7-aa6d-cacd6f065e67)


Una vez finalizado, configuramos el punto de acceso por el cual van a entrar los clientes.


![4](https://github.com/user-attachments/assets/1470b91f-8295-4e0e-801a-0735ff4899f1)


Nos descargamos los portales del [GitHub de Kleo](https://github.com/kleo/evilportals) para tener un ejemplo para esta prueba; en mi caso, elegiré el inicio de sesión de Starbucks.


![5](https://github.com/user-attachments/assets/2830b8c2-2ae9-461e-995f-e5faaa04bcc7)


Ahora necesitamos subir la carpeta del portal cautivo que queramos crear. Para ello, podemos conectarnos por SSH al Wifi Pineapple.


![6](https://github.com/user-attachments/assets/89b9384f-1aea-44b3-a377-c92069c1aedf)


Para enviar una carpeta por SSH, podemos usar la herramienta SCP.


![7](https://github.com/user-attachments/assets/93b16420-d466-44fe-8635-672eb01435fb)


Si refrescamos la pestaña, debería aparecer en la librería de portales el portal que hemos subido por SSH y activamos el portal.


![8](https://github.com/user-attachments/assets/43ad46a9-c10f-4e5c-bfa9-82a9f42d37af)


# Ataque

Si accedemos desde un móvil a la red Wi-Fi que hemos configurado anteriormente, nos aparecerá el siguiente inicio de sesión y nos pedirá las credenciales.


![11](https://github.com/user-attachments/assets/c08b6476-09e9-4fec-af49-20fad5fd9a2a)


También se puede acceder desde un ordenador.


![10](https://github.com/user-attachments/assets/f6e4e1c3-44f9-4146-9ee2-11abb86e33f0)


Si volvemos al Pineapple y alguien ha introducido sus credenciales, podremos hacer clic en el botón de "View logs".


![9](https://github.com/user-attachments/assets/3bddba04-7403-4afd-bf7b-50606d9b42e4)


# Conclusión

En este post, hemos explorado cómo configurar un portal cautivo malicioso utilizando el [Wifi Pineapple de Hak5](https://shop.hak5.org/products/wifi-pineapple). A través de un proceso paso a paso, desde la instalación del módulo "Evil Portal" hasta la creación y activación de un portal cautivo, hemos visto cómo se puede simular un ataque a redes Wi-Fi. Es fundamental recordar que, aunque esta herramienta puede ser utilizada para fines educativos y de pruebas de seguridad, su uso indebido puede tener consecuencias legales y éticas. Por lo tanto, es esencial emplear estos conocimientos de manera responsable y siempre con el consentimiento de los usuarios involucrados. La seguridad en redes es un tema crítico, y entender cómo funcionan estos ataques puede ayudar a fortalecer las defensas contra ellos.

¡Espero que os haya gustado el post!


![ZRPK](https://github.com/user-attachments/assets/2c377319-7973-4c87-aeff-a3ec150c5083)
