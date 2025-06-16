---
title: Análisis Forense en Windows Automatización de evidencias volátiles
published: true
---

# Introducción

En el mundo de la ciberseguridad, el análisis forense es una parte muy importante para investigar incidentes y entender cómo se desarrollan los ataques. Este artículo se centra en la automatización de la recolección de evidencias volátiles en sistemas Windows, utilizando un script que automatiza este proceso.

El script permite obtener información importante, como los procesos en ejecución, los servicios activos y las conexiones de red, de manera rápida y eficiente. Al automatizar la recolección de datos, se reduce el riesgo de errores humanos y se mejora el tiempo de respuesta ante incidentes. Esta herramienta podría ser muy para investigadores forenses como para administradores de sistemas que desean mantener la seguridad de sus entornos.

A lo largo de este artículo, vamos a explorar cómo funciona el script, los requisitos necesarios para ejecutarlo y la salida que genera.

¿Qué Hace Este Código?

Este script está diseñado para recopilar una amplia variedad de datos volatiles del sistema, incluyendo:

- **Procesos en ejecución**: Lista todos los procesos activos en el momento de la ejecución.
- **Servicios**: Muestra los servicios que están en funcionamiento.
- **Usuarios**: Registra los usuarios actualmente logueados y su historial de inicio de sesión.
- **Conexiones de red**: Identifica puertos abiertos y conexiones activas.
- **Caché DNS y ARP**: Captura información sobre la caché de DNS y la tabla ARP.
- **Tráfico de red**: Realiza una captura de tráfico de red durante un minuto.
- **Registro de Windows**: Exporta claves del registro que pueden ser relevantes para el análisis.
- **Dispositivos USB**: Registra información sobre dispositivos USB conectados.
- **Historial de navegación**: Recopila datos sobre el historial de navegación y contraseñas almacenadas.

# Cómo Usar el Script

## Requisitos Previos

Antes de ejecutar el script, asegúrate de tener acceso a las herramientas necesarias:

- tasklist.exe (Windows)
- sc.exe (Windows)
- NetUser.exe (Windows)
- net.exe (Windows)
- ipconfig.exe (Windows)
- arp.exe (Windows)
- [dumpcap.exe](https://www.wireshark.org/download.html)
- reg.exe (Windows)
- [WebBrowserPassView.exe](https://www.nirsoft.net/utils/web_browser_password.html)
- [netpass.exe](https://www.nirsoft.net/utils/web_browser_password.html)
- [mailpv.exe](https://www.nirsoft.net/utils/mailpv.html)
- [IECacheView.exe](https://www.nirsoft.net/utils/ie_cache_viewer.html)
- doskey.exe (Windows)
- [Screenshot-cmd.exe](https://github.com/n4yk/screenshot-cmd)
- [InsideClipboard.exe](https://www.nirsoft.net/utils/inside_clipboard.html)
- [BrowsingHistoryView.exe](https://www.nirsoft.net/utils/browsing_history_view.html)
- [MyLastSearch.exe](https://www.nirsoft.net/utils/my_last_search.html)
- [iecv.exe](https://www.nirsoft.net/utils/iecookies.html)
- [EDD.exe](https://www.nirsoft.net/utils/dump_edid.html)

Y al otro ejecutable (listado.bat) mencionado en el código. Además, necesitarás permisos de administrador en el sistema. Si no pudieras ejecutar el código como administrador, solo se obtendrán los datos que no sea necesario permisos de administrador

## Ejecución del Script

Para ejecutar el script, simplemente debes proporcionar tres parámetros:

- `-u`: Ruta donde se encuentran las herramientas necesarias.
- `-dr`: Ruta de destino donde se guardarán los archivos generados.
- `-d`: Indica que unidad quieres analizar.

## Salida Generada

El script generará múltiples archivos en la ruta de destino especificada, organizados por fecha y hora. Algunos de los archivos que se crearán incluyen:

- `ProcesosEnEjecucion-YYYY-MM-DD-HH-MM.txt`
- `ServiciosEnEjecucion-YYYY-MM-DD-HH-MM.txt`
- `ContraseñasNavegadores-YYYY-MM-DD-HH-MM.txt`
- `CapturaRed-YYYY-MM-DD-HH-MM.pcap`

# Resultados y Conclusiones

Este script ofrece una visión completa del estado del sistema en el momento de su ejecución, lo cual es extremadamente valioso para cualquier investigador forense. Al reunir datos de diferentes fuentes, puedes obtener una imagen clara de lo que estaba sucediendo en el sistema, algo que puede ser fundamental para resolver incidentes de seguridad.

## Limitaciones

Es importante tener en cuenta que, aunque este script es una herramienta poderosa, no es infalible. La recopilación de datos puede verse afectada por la configuración del sistema y los permisos de usuario. Además, siempre es recomendable realizar un análisis adicional utilizando otras herramientas forenses.

# Conclusión

Te invito a probar este script y a compartir tus comentarios y sugerencias. Si encuentras útil esta herramienta, no dudes en compartirla con otros profesionales de la ciberseguridad. Juntos, podemos mejorar nuestras capacidades de análisis forense y proteger mejor nuestros sistemas.

Gracias por leer y espero que encuentres útil esta herramienta.

# Código inicial (novolatil.ps1)
```powershell
param (
    [string]$u,
    [string]$dr,
    [string]$d
)

# Obtener la fecha y hora en el formato deseado
$fecha = Get-Date -Format "yyyy-MM-dd"
$hora = Get-Date -Format "HH-mm"

# Fecha y hora
(Get-Date -Format "yyyy-MM-dd HH:mm:ss") | Set-Content "$dr\FechaYHoraDeInicio.txt"

# Procesos
& "$u\cmd\tasklist" | Set-Content "$dr\ProcesosEnEjecucion-$fecha-$hora.txt"

# Servicios
& "$u\cmd\sc.exe" query | Set-Content "$dr\ServiciosEnEjecucion-$fecha-$hora.txt" 

# Usuarios
& "$u\NetUser.exe" > "$dr\UsuariosActualmenteLogueados-$fecha-$hora.txt"
& "$u\NetUser.exe" /History > "$dr\HistoricoUsuariosLogueados-$fecha-$hora.txt"

# Ficheros transferidos
& "$u\cmd\net.exe" file | Set-Content "$dr\FicherosCopiadosMedianteNetBIOS-$fecha-$hora.txt"

# Conexiones activas o puertos abiertos
& "$u\cmd\netstat.exe" -an | findstr /i "estado listening established" | Set-Content "$dr\PuertosAbiertos-$fecha-$hora.txt"

# Contenido de la caché DNS
& "$u\cmd\ipconfig.exe" /displaydns | Set-Content "$dr\DNSCache-$fecha-$hora.txt"

# ARP caché
& "$u\cmd\arp.exe" -a | Set-Content "$dr\ArpCache-$fecha-$hora.txt"

# Suponiendo que el número de la interfaz Ethernet es 1
$interfazEthernet = 1

# Tráfico de red
# Iniciar la captura
$proceso = Start-Process -FilePath "$u\wireshark\dumpcap.exe" -ArgumentList "-i $interfazEthernet -w `"$dr\CapturaRed-$fecha-$hora.pcap`"" -PassThru

# Esperar un minuto (60 segundos)
Start-Sleep -Seconds 60

# Detener el proceso
Stop-Process -Id $proceso.Id

# Registro de windows
& "$u\cmd\reg.exe" export HKEY_CLASSES_ROOT "$dr\HKCR-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export HKEY_CURRENT_USER "$dr\HKCU-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export HKEY_LOCAL_MACHINE "$dr\HKLM-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export HKEY_USERS "$dr\HKU-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export HKEY_CURRENT_CONFIG "$dr\HKCC-$fecha-$hora.reg"

# Dispositivos USB
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Enum\USBSTOR" "$dr\USBSTOR-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Enum\USB" "$dr\USB-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\DeviceClasses" "$dr\DeviceClasses-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\System\MountedDevices" "$dr\MountedDevices-$fecha-$hora.reg"

# Listado de redes WIFI a las que se ha conectado un equipo
& "$u\cmd\netsh.exe" wlan show profiles > "$dr\PerfilesWifi-$fecha-$hora.txt"
& "$u\cmd\netsh.exe" wlan show all > "$dr\ConfiguracionPerfilesWifi-$fecha-$hora.txt"

# Configuración de Windows Security Center / Windows Action Center
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\Software\Microsoft\Security Center" "$dr\HKLM-SecurityCenter-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\ActionCenter" "$dr\HKCU-ActionCenter-$fecha-$hora.reg"

# Configuración del firewall de Windows
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy" "$dr\HKLM-FirewallPolicy-$fecha-$hora.reg"

# Programas que se ejecutan al iniciar el sistema operativo
& "$u\cmd\reg.exe" export "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" "$dr\HKCU-ShellFolders-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" "$dr\HKCU-UserShellFolders-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" "$dr\HKCU-Run-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce" "$dr\HKCU-RunOnce-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CURRENT_USER\Software\Microsoft\WindowsNT\CurrentVersion\Windows" "$dr\HKCU-Windows-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" "$dr\HKLM-ShellFolders-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" "$dr\HKLM-UserShellFolders-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" "$dr\HKLM-Explorer-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run" "$dr\HKLM-Run-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\RunOnce" "$dr\HKLM-RunOnce-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\SessionManager" "$dr\HKLM-SessionManager-$fecha-$hora.reg"

# Extensiones de ficheros y programas asociados para abrirlos
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\batfile\shell\open\command" "$dr\HKCR-batfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\cmdfile\shell\open\command" "$dr\HKCR-cmdfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\comfile\shell\open\command" "$dr\HKCR-comfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\exefile\shell\open\command" "$dr\HKCR-exefile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\htafile\shell\open\command" "$dr\HKCR-htafile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\https\shell\open\command" "$dr\HKCR-https-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\JSEfile\shell\open\command" "$dr\HKCR-JSEfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\piffile\shell\open\command" "$dr\HKCR-piffile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\regfile\shell\open\command" "$dr\HKCR-regfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\scrfile\shell\open\command" "$dr\HKCR-scrfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\txtfile\shell\open\command" "$dr\HKCR-txtfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\VBSfile\shell\open\command" "$dr\HKCR-VBSfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_CLASSES_ROOT\WSFFile\shell\open\command" "$dr\HKCR-WSFFile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\software\Classes\batfile\shell\open\command" "$dr\HKLM-batfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\software\Classes\comfile\shell\open\command" "$dr\HKLM-comfile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\software\Classes\exefile\shell\open\command" "$dr\HKLM-exefile-$fecha-$hora.reg"
& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\software\Classes\piffile\shell\open\command" "$dr\HKLM-piffile-$fecha-$hora.reg"

# Asociaciones de ficheros con depuradores

& "$u\cmd\reg.exe" export "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs" "$dr\RecentDocs-$fecha-$hora.reg" /y

# Software instalado

& "$u\cmd\reg.exe" export "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Uninstall" "$dr\SoftwareInstalado-$fecha-$hora.reg" /y

# Contraseñas

& "$u\webbrowserpassview\WebBrowserPassView.exe" /stab "$dr\ContraseñasNavegadores-$fecha-$hora.txt"
& "$u\netpass-x64\netpass.exe" /stab "$dr\NetworkPasswordRecovery-$fecha-$hora.txt"
& "$u\mailpv\mailpv.exe" /stab "$dr\MailPassView-$fecha-$hora.txt"

# Información cacheada en los navegadores (direcciones, historial de descargas)

& "$u\iecacheview\IECacheView.exe" /stab "$dr\IECache-$fecha-$hora.txt"

# Histórico del intérprete de comandos

& "$u\cmd\doskey.exe" /history | Out-File "$dr\HistoricoCMD-$fecha-$hora.txt"

# Capturas de pantalla

& "$u\Screenshot-cmd.exe" -o "$dr\Screenshot-$fecha-$hora.png"

# Información del portapapeles

& "$u\insideclipboard\InsideClipboard.exe" /saveclp "$dr\Portapapeles-$fecha-$hora.clp"

# Historial de internet

& "$u\browsinghistoryview-x64\BrowsingHistoryView.exe" /HistorySource 2 /LoadIE 1 /LoadFirefox 1 /LoadChrome 1 /LoadSafari 1 /stab "$dr\Historial-$fecha-$hora.txt"

# Últimas búsquedas

& "$u\mylastsearch\MyLastSearch.exe" /stab "$dr\MyLastSearch-$fecha-$hora.txt"

# cookies

& "$u\iecv\iecv.exe"

# Volúmenes cifrados

& "$u\EDD.exe" > "$dr\VolumenesEncriptados-$fecha-$hora.txt"

# Unidades mapeadas

& "$u\cmd\net.exe" use > "$dr\UnidadesMapeadas-$fecha-$hora.txt"

# Carpetas compartidas

& "$u\cmd\net.exe" share > "$dr\CarpetasCompartidas-$fecha-$hora.txt"

# Grabaciones pendientes

dir "$env:UserProfile\AppData\Local\Microsoft\Windows\Burn" > "$dr\GrabacionesPendientes-$fecha-$hora.txt"

# ejecutar listado de ficheros

& "$u\listado.bat" $dr $d
```

# Código 2 (listado.bat)

```c

@echo off
setlocal

set dirs=%~1
set unidad=%~2

set "hora=%time: =0%"
set "hora=%hora::=%"

rem Ejecutar los comandos dir
dir /t:w /a /s /o:d %unidad%\ > "%dirs%\incibevolatil\ListadoFicherosPorFechaDeModificacion-%date:~6,4%%date:~3,2%%date:~0,2%-%hora:~0,2%%hora:~2,2%.txt"
dir /t:a /a /s /o:d %unidad%\ > "%dirs%\incibevolatil\ListadoFicherosPorUltimoAcceso-%date:~6,4%%date:~3,2%%date:~0,2%-%hora:~0,2%%hora:~2,2%.txt"
dir /t:c /a /s /o:d %unidad%\ > "%dirs%\incibevolatil\ListadoFicherosPorFechaDeCreacion-%date:~6,4%%date:~3,2%%date:~0,2%-%hora:~0,2%%hora:~2,2%.txt"

endlocal
```

![ken](https://github.com/user-attachments/assets/e4269b29-f5da-4716-9970-7ea0feaf1d87)
