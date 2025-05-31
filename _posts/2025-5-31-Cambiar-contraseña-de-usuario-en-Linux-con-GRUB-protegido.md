---
title: Cambiar contraseña de usuario en Linux con GRUB protegido
published: true
---

# Introducción
Imagínate que, en un día inesperado, te enfrentas a la situación de necesitar acceder a un equipo con sistema operativo Linux del que no conoces ninguna de las contraseñas de usuario. La frustración comienza a apoderarse de ti, mientras te preguntas cómo podrás recuperar el acceso a ese sistema que, en ese momento, parece estar completamente fuera de tu alcance.

Pues en esta publicación resolveremos este problema, además al final de la publicación hablaremos de como podemos mitigar esta forma para que personas malintencionadas no puedan acceder a nuestros sistemas (aunque si nos olvidamos de la contraseña no podremos acceder al sistema)

# Entorno
Para esta prueba, utilizaremos Ubuntu como sistema operativo. Aunque es cierto que los pasos pueden variar ligeramente en otros sistemas basados en Linux, la mayoría de ellos siguen un enfoque similar. Así que, independientemente de la distribución que estés utilizando, estos pasos te guiarán en el proceso de cambiar la contraseña de usuario.

# Configuración
El equipo se configurará como si estuvieras en un entorno real, donde es común que el GRUB esté protegido con una contraseña para evitar accesos no autorizados. Esta medida de seguridad es fundamental en muchas empresas, ya que ayuda a proteger la integridad del sistema. En esta publicación, también explicaré qué hacer si te encuentras en la situación de no recordar la contraseña de GRUB.

Primero generaremos el hash de nuestra contraseña.

```bash
sudo grub-mkpasswd-pbkdf2
```

Copiaremos lo que nos ha generado el comando y añadiremos al final de archivo ```/etc/grub.d/40_custom``` las siguientes lineas.

```bash
set superusers="tu_usuario"
password_pbkdf2 tu_usuario <hash generado>
```


![1](https://github.com/user-attachments/assets/d087f010-8546-46a6-9052-2ead8611c7c6)


Finalmente actualizaremos el GRUB.

```bash
sudo update-grub
```

# Acceder al GRUB

Reiniciamos la máquina y cuando arranca el GRUB pulsaremos la tecla `e` para modificar el arranque. 


![2](https://github.com/user-attachments/assets/d6f8d743-f271-49d2-a389-337729ea272a)


Como el GRUB tiene contraseña y en este caso no nos acordamos de ella, no nos dejara modificarlo.


![3](https://github.com/user-attachments/assets/15848cee-d364-499b-a7d3-d9b49609523c)


# Modificar el GRUB desde un Live Boot
Para modificar el GRUB, es necesario que utilicemos un entorno de live boot para montar la partición del sistema donde está instalado GRUB. En este caso, he optado por utilizar un live boot con Kali Linux, podremos acceder a los archivos del sistema y realizar las modificaciones necesarias para restablecer la contraseña o realizar cualquier otra configuración que requiramos.


![4](https://github.com/user-attachments/assets/b347a397-2801-4c64-af84-fbcedfa679dd)


Ahora que esta identificada, montaremos la partición y algunos sistemas de archivos adicionales.


![5](https://github.com/user-attachments/assets/fe55efeb-37d7-4f32-8b01-033bbc825dd7)


Después cambiamos el entorno.


![6](https://github.com/user-attachments/assets/a0ba740e-e564-4f0d-bbf9-a9bef8951299)


Modificamos el archivo ` /etc/grub.d/40_custom ` añadiendo comentarios a los apartados de usuarios y de contraseñas.


![7](https://github.com/user-attachments/assets/4cab7e0e-1a7b-487d-beb1-dd623160f1f0)


Finalmente guardamos las modificaciones y actualizamos el GRUB con el siguiente comando:

```bash
update-grub
```

Si todo ha ido correctamente, es necesario desmontar los sistemas de archivos de la forma contraria a la que lo montamos antes de reiniciar el sistema.


![8](https://github.com/user-attachments/assets/7ae2ff6b-76fd-4386-bf9b-3d82900c2eed)


# Acceder y cambiar contraseñas

Al reiniciar la máquina y acceder al GRUB, no se nos pedirá la contraseña. Esto nos permitirá modificar la configuración para obtener una terminal que nos permita cambiar las contraseñas de los usuarios. Para hacerlo, añadimos `init=/bin/bash` al final de la línea que comienza con "linux" y pulsamos `Ctrl + X` para arrancar con esta configuración. Esto nos dará acceso a una terminal de comandos para restablecer las contraseñas y recuperar el control del sistema.


![9](https://github.com/user-attachments/assets/675251f2-fa77-42d7-b762-879e2f21482e)


Ahora, el siguiente paso es montar el sistema para poder realizar modificaciones. Una vez montado, podremos cambiar las contraseñas de los usuarios cuyas credenciales no recordamos.


![10](https://github.com/user-attachments/assets/ac897cd4-3479-46e5-952e-6bd745f1881a)


Si reiniciamos el sistema los cambios se guardarán.

# Potencial de Ciberataques a través de la Modificación de GRUB

La capacidad de modificar el GRUB y acceder a una terminal con permisos de administrador, aunque útil para la recuperación de contraseñas, también puede ser un vector de ciberataques, por eso es recomendable:

1. **Proteger GRUB con Contraseña Fuerte**: Asegúrate de que el GRUB esté protegido con una contraseña robusta. Esto dificultará que un atacante acceda a la configuración de GRUB y realice modificaciones no autorizadas.

2. **Cifrado de Disco**: Implementa el cifrado de disco completo (como LUKS en Linux) para proteger los datos en caso de que un atacante tenga acceso físico al dispositivo. Esto asegura que, incluso si logran acceder al sistema, no podrán leer los datos sin la clave de cifrado.

3. **Acceso Físico Restringido**: Limita el acceso físico a los servidores y estaciones de trabajo. Utiliza medidas de seguridad como cerraduras, cámaras de vigilancia y control de acceso para evitar que personas no autorizadas puedan manipular el hardware.

# Conclusión

En resumen, hemos visto el proceso de recuperar el acceso a un sistema Linux cuando se ha olvidado la contraseña de usuario, utilizando GRUB y un entorno de live boot. Además, hemos aprendido a modificar la configuración de GRUB para restablecer contraseñas y recuperar el control del sistema. Sin embargo, es crucial recordar que esta misma técnica puede ser utilizada por atacantes si no se implementan las medidas de seguridad adecuadas.

La protección de GRUB con contraseñas fuertes, el cifrado de disco y la restricción del acceso físico son prácticas buenas para proteger nuestros sistemas. Al adoptar estas recomendaciones, no solo garantizamos la seguridad de nuestros datos, sino que también minimizamos el riesgo de ciberataques. 

Espero que os haya gustado esta publicación y nos vemos en la próxima.

![ken](https://github.com/user-attachments/assets/172fe4c6-36fb-4458-8529-3768c77ffb05)
