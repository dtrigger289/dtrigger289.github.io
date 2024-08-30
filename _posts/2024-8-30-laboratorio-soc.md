---
title: ¿Como crear un laboratorio SOC?
published: true
---

![imagen](https://github.com/user-attachments/assets/f4402551-1a69-4692-a8aa-9f179c6add56)

Hey!

Recientemente he completado el curso de "SOC Learning Path" de "LetsDefend" y he aprendido muchas cosas. Así que voy a compartir con vosotros cómo crear un laboratorio de "Elastic Stack Security Information and Event Management" (SIEM) usando "Elastic Web" y una máquina virtual de Kali Linux.

Además, aprenderemos cómo generar eventos de seguridad en la máquina virtual, mandar la información, registrar y analizar los registros en el SIEM.

# Prerequisitos

- Máquina virtual (en mi caso utilizaré Kali Linux)

# Resumen de los pasos

- Configurar una cuenta gratuita de "Elastic".
- Configurar el agente de Elastic en la máquina virtual para recoger registros y mandárselos al SIEM.
- Generar eventos de seguridad en la máquina virtual.
- Crear consultas para encontrar los eventos en el SIEM.
- Crear un panel para visualizar los eventos de seguridad.
- Crear alertas para los eventos de seguridad.

# Paso 1: Configurar una cuenta de "Elastic"

1. Registraremos una cuenta gratis para usarla en "Elastic Cloud": 
	https://cloud.elastic.co/registration?fromURI=%2Fhome

![Pasted image 20240830105246](https://github.com/user-attachments/assets/5e31cf52-a70f-428a-9504-c2f9094f06a1)

3. Verificamos e iniciamos sesión con esa cuenta.
4. Rellenamos una encuesta.
5. Indicamos un nombre para nuestro primer proyecto.
6. Esperamos a que termine de configurar y debería quedar así.
 
![Pasted image 20240830110141](https://github.com/user-attachments/assets/beee5e04-6e4f-42f7-832a-b0cab426065d)

# Paso 2: Configurar el agente para recoger registros

Un agente es un programa que se instala en un dispositivo, como un servidor o un cliente para recoger y mandar datos a un sistema centralizado para análisis y monitorización.

1. Pulsamos las 3 lineas del menú arriba a la izquierda y clicamos en "Add integrations". (añadir integraciones)

![Pasted image 20240830111726](https://github.com/user-attachments/assets/11144075-7573-439b-8254-dcf3d8f6f87a)

2. Buscamos por "Elastic Defend", lo añadimos, lo instalamos y deberíamos tener esta pantalla.

![Pasted image 20240830112411](https://github.com/user-attachments/assets/4f185847-eb66-45d0-8265-684a162f01bd)

3. Seleccionamos el sistema operativo de nuestra máquina virtual y copiamos y pegamos los comandos en la terminal.

![Pasted image 20240830112935](https://github.com/user-attachments/assets/63b6a62b-a837-493c-8db8-b311827840ff)
![Pasted image 20240830113028](https://github.com/user-attachments/assets/03d34beb-696f-4f19-83c5-23d941ca1676)
![Pasted image 20240830113226](https://github.com/user-attachments/assets/6add24f1-e328-41ad-99ab-cf4f7be73dc0)

Si tienes algún error al instalar, comprueba que tu máquina virtual esté bien conectada a internet.

# Paso 3: Generar eventos de seguridad en la máquina virtual

Para verificar que el agente está funcionando correctamente, puedes generar algunos eventos. Para hacerlo, podemos usar una herramienta como "Nmap", se puede usar para escanear puertos abiertos en el sistema o buscar otro tipo de información en la red.

Para hacer un escaneo con Nmap debemos hacer lo siguiente:

1. Instalar Nmap en la máquina virtual o en otro equipo que esté en la misma red. (como estoy usando Kali Linux, la herramienta ya viene instalada)
2. Ejecutamos el siguiente comando (en Linux):

```nmap
sudo nmap <IP a la que queremos escanear>
```

![Pasted image 20240830114509](https://github.com/user-attachments/assets/ab6d08d8-42f7-48fc-bcf0-44ad791b3a6a)

En este caso, ejecuta varios escaneos para que en el siguiente paso sea más fácil de visualizarlos.

# Paso 4: Creando consultas para eventos de seguridad en el SIEM

Ahora que hemos mandado datos de la máquina virtual al SIEM, podemos crear consultas y analizar los registros en el SIEM.

1. Vamos al menú y pulsamos en "Logs" en el apartado de "Observability".

![Pasted image 20240830115402](https://github.com/user-attachments/assets/4faee95d-49b0-4c24-bf6a-e5406a2571d6)

2. En el apartado de "Stream", hacemos la consulta para buscar procesos con nmap:

```txt
process.args: "nmap"
```

![Pasted image 20240830122839](https://github.com/user-attachments/assets/772e1390-92e2-4a12-b036-610713b8124d)

Le damos a los 3 puntos que aparecen a la derecha de cada registro y a "View details".

![Pasted image 20240830122946](https://github.com/user-attachments/assets/8e80784c-fad6-4985-9c4a-b5d492d73c27)

Allí veremos toda la información del registro.

# Paso 5: Crear un panel para visualizar los eventos de seguridad

Podemos utilizar también los paneles en la aplicación del SIEM para analizar registros e identificar patrones en los datos. Por ejemplo, puedes crear un panel simple que cuente los eventos de seguridad en un tiempo determinado.

1. Vamos al apartado de "Analytics" y despues a "Dashboard".

![Pasted image 20240830123359](https://github.com/user-attachments/assets/269d160a-6c78-40de-8930-e5603d68e4c9)

2. Pulsaremos en "Create dashboard", despues en "Create visualization" y seleccionamos el formato que queremos ver.

![Pasted image 20240830123911](https://github.com/user-attachments/assets/a7b44908-c411-408b-8829-79eaa60a3573)

3. En el apartado de "metrics-" .podremos seleccionar "Count" como campo vertical y "timestamp" como campo horizontal. Esto contará todos los eventos de seguridad sobre un periodo de tiempo. (en este caso 30 minutos)

![Pasted image 20240830124141](https://github.com/user-attachments/assets/499ebd3a-c4e2-4b9a-a4f6-8dbf3e478780)

4. Por ultimo le damos a "Save".

![Pasted image 20240830124453](https://github.com/user-attachments/assets/5a64295b-3ffa-4c4a-b157-07eeab88871c)

# Paso 6: Crear una alerta

En un SIEM, las alertas son una característica muy importante para detectar incidentes de seguridad y responder ante ellos a tiempo. Las alertas se crean en base a reglas predefinidas y puedes ser configuradas para realizar diferentes acciones.

1. Pulsamos el menú, despues en "Alerts" y a continuación en "Manage rules".

![Pasted image 20240830125239](https://github.com/user-attachments/assets/63f3a18b-4f1d-4a17-b71e-2acd6e66473d)

2. Pulsamos en "Create new rule", debajo de "Define rule" selecionamos "custom query", después de "Custom query" ponemos la condición de la regla. La siguiente consulta detecta escaneos de nmap.

![Pasted image 20240830125717](https://github.com/user-attachments/assets/7d6774a8-1f54-410c-9913-16860765501b)

3. Clicamos en el botón de "continue", indicamos el nombre, descripción y el riesgo de la alerta. El resto lo podemos dejar en predeterminado y darle a "continue".

![Pasted image 20240830130135](https://github.com/user-attachments/assets/62eeb42c-ecb0-43f9-9de1-cc318ab7f45f)

4. Finalmente en "Rule actions" podemos seleccionar que acción hacer cuando se cumpla la alerta. Podemos elegir que nos mande un email, un mensaje de slack, activar un webhook... Al terminar pulsamos en "Create and enable rule" para crear la alerta.

![Pasted image 20240830130545](https://github.com/user-attachments/assets/c065873e-8463-4bfb-9308-0fdaa92beac0)

Una vez creada la alerta, cada vez que se detecten escaneos de nmap recibirás un correo.

# Conclusión

Este laboratorio nos permite a aprender y prácticar las habilidades necesarias para monitorizar y responder ante incidentes usando un SIEM. 

Muchas gracias por leer este post y espero que te haya servido de ayuda.

![ZRPK](https://github.com/user-attachments/assets/efd20496-6fbc-41d6-af7b-84471c9bc893)
