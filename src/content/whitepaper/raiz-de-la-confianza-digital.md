---
title: 'La raíz de la confianza digital'
description: 'Por qué verificar una firma digital extranjera sigue siendo difícil, y cómo un espejo público de anclas de confianza PKI nacionales lo resuelve.'
publishDate: 2026-07-23
lang: 'es'
pdf: '/whitepaper/raiz-de-la-confianza-digital.pdf'
altHref: '/whitepaper/root-of-digital-trust'
draft: false
---

## Resumen ejecutivo

Validar una firma digital emitida en el propio país suele ser trivial. Validar una emitida en otro rara vez lo es.

El motivo no es criptográfico. Los algoritmos y los formatos de firma están estandarizados desde hace décadas. El obstáculo es de distribución: para verificar una firma hay que confiar en el certificado raíz que respalda la cadena, y cada país publica sus raíces a su manera: en un portal ministerial, en un anexo PDF, en una lista XML de cientos de entradas, a veces en una página que cambia de dirección sin aviso.

El resultado es predecible. Los equipos técnicos terminan copiando certificados de origen incierto, fijándolos en el código y descubriendo que caducaron cuando una integración falla en producción. Y en el peor de los casos, aceptando cadenas que nunca verificaron del todo.

**Attestto Trust** es un espejo público independiente de anclas de confianza PKI nacionales. Replica las autoridades de certificación raíz e intermedias que sostienen los sistemas nacionales de firma digital y las presenta como una jerarquía clara y verificable: cada certificado con su huella digital SHA-256 como evidencia de integridad, su ventana de validez y la descarga directa del _.pem_ original.

> La misma información está disponible en tres formas: página legible para personas, paquete npm para integrar en una compilación, y resolutor _did:pki_ para consulta programática. Sobre esa base funciona el verificador público de documentos de Attestto, cuyo alcance crece con cada jurisdicción incorporada al espejo.

### Contenido

- Por qué la distribución de anclas de confianza es un problema sin resolver.
- Anatomía de una jerarquía nacional, con Costa Rica como caso detallado.
- El contraste entre eIDAS en Europa y la ausencia de un marco equivalente en América Latina.
- Identidad organizacional: vLEI de GLEIF, _did:keri_ y _did:webs_.
- Integración técnica y límites explícitos del servicio.

## Sección 1: El problema de las anclas dispersas

Una firma digital solo significa algo si puede trazarse hasta una raíz en la que se decidió confiar. Esa raíz, el **ancla de confianza**, es un certificado autofirmado que el verificador acepta como punto de partida. Todo lo demás cuelga de ahí: certificados intermedios, certificados de firmante, sellos de tiempo.

La criptografía de esa cadena está resuelta. Lo que no lo está es cómo un sistema obtiene la raíz correcta, sabe que es la correcta y se entera de que cambió.

### Cómo se distribuyen hoy

Los navegadores y sistemas operativos incluyen almacenes de confianza para TLS, curados por sus fabricantes. Pero las raíces de firma digital _cualificada_, las que respaldan la identidad legal de una persona o una empresa ante el Estado, casi nunca están en esos almacenes. Se publican por canales propios de cada jurisdicción.

- En la Unión Europea existen _Trusted Lists_ bajo eIDAS: listas XML firmadas, mantenidas por el organismo supervisor de cada Estado miembro. Son autoritativas y legibles por máquina, pero voluminosas y de estructura poco amigable.
- En América Latina no hay equivalente regional. Cada país publica sus raíces donde estima conveniente, con formatos y criterios de disponibilidad distintos.
- En ambos casos, encontrar el certificado correcto exige saber de antemano cuál es el organismo competente en ese país: información que rara vez tiene a mano quien está integrando.

> El problema no es que los datos sean secretos. Son públicos. El problema es que están dispersos, heterogéneos y sin una forma común de citarlos.

### Los tres modos de fallo

**1. Fijar sin verificar.** El certificado se copia de un foro, de un repositorio de terceros o de un adjunto de correo, y se incorpora al proyecto sin cotejar su huella contra la fuente oficial. Si el origen estaba comprometido, la verificación queda vacía: se comprueba una firma contra un ancla que no es la que se cree.

**2. Caducar en silencio.** Las raíces e intermedias tienen ventanas de validez largas, de ocho a veinticinco años. Esa duración crea una falsa sensación de permanencia: nadie monitorea lo que vence dentro de una década, hasta que vence.

**3. Confundir generaciones.** Es el fallo más sutil. Las autoridades emisoras se renuevan periódicamente conservando el mismo nombre común, de modo que conviven varias generaciones distintas con la misma denominación y claves diferentes. Un sistema que empareje por nombre elegirá la equivocada tarde o temprano.

### La huella como identificador

La respuesta a los tres casos es la misma: identificar cada certificado por su **huella digital SHA-256** y no por su nombre. La huella es única, no ambigua entre generaciones y verificable de forma independiente contra la fuente oficial. Es lo que convierte una copia en evidencia.

## Sección 2: Anatomía de una jerarquía nacional

Costa Rica ofrece un caso especialmente nítido para ilustrar cómo se estructura una PKI nacional, porque adopta el modelo de **jerarquía única**: una sola raíz de la que desciende todo el sistema, sin cadenas cruzadas ni múltiples anclas competidoras.

La raíz es CA RAIZ NACIONAL - COSTA RICA v2, con ventana de validez de 2015 a 2039, operada por el Banco Central de Costa Rica a través de SINPE bajo acreditación del MICITT, cuya Dirección de Certificadores de Firma Digital (DCFD) ejerce la función acreditadora. El marco legal es la Ley 8454, con RSA-4096 en toda la jerarquía y soporte para los formatos de firma avanzada CAdES, PAdES y XAdES.

```
CA RAIZ NACIONAL - COSTA RICA v2               2015 - 2039  [raíz]
  CA POLITICA PERSONA FISICA v2                2015 - 2031
    CA SINPE - PERSONA FISICA v2               2019 - 2027
    CA SINPE - PERSONA FISICA v2               2023 - 2031
    CA SINPE - PERSONA FISICA v2               2026 - 2034
  CA POLITICA PERSONA JURIDICA v2              2015 - 2031
    CA SINPE - PERSONA JURIDICA v2             2023 - 2031
    CA SINPE - PERSONA JURIDICA v2             2026 - 2034
      BANCO CENTRAL DE COSTA RICA
      (AGENTE ELECTRONICO)                     2024 - 2028
  CA POLITICA SELLADO DE TIEMPO v2             2015 - 2031
```

_Diez certificados: una raíz y nueve intermedias. Fuente: directorio Attestto Trust, actualizado al 23 de julio de 2026._

### Tres niveles, tres funciones

**Raíz.** El ancla propiamente dicha. Autofirmada, con la ventana más larga y la clave más protegida. Es el único certificado que un verificador debe obtener por un canal fuera de banda y confirmar por huella.

**Política.** Un nivel intermedio que separa los usos: persona física, persona jurídica y sellado de tiempo tienen cada uno su propia CA de política. Esa separación permite acotar el impacto de un incidente y aplicar reglas distintas por tipo de certificado.

**Emisión.** Las CA SINPE que efectivamente firman los certificados de usuario final, más emisoras específicas como la del agente electrónico del propio Banco Central.

### El caso de las generaciones solapadas

La jerarquía costarricense ilustra con claridad el tercer modo de fallo descrito antes. Bajo la CA de política de persona física conviven **tres** emisoras llamadas exactamente _CA SINPE - PERSONA FISICA v2_, con claves y números de serie distintos y vencimientos en 2027, 2031 y 2034.

> Tres certificados, un mismo nombre. Cualquier lógica de validación que empareje por denominación común elegirá la generación incorrecta. Solo la huella distingue.

### Revocación

La validez de un certificado no depende solo de su ventana temporal: puede haber sido revocado. Costa Rica expone respondedor OCSP en _ocsp.sinpe.fi.cr_, y el BCCR mantiene servicios de validación y consulta de revocación a través de Central Directo. Un directorio de anclas no sustituye esa consulta en línea; la complementa aportando el material de cadena con el que esa consulta se construye.

## Sección 3: eIDAS y la asimetría regional

La cobertura del directorio deja ver un contraste que vale la pena explicitar, porque explica buena parte de la fricción que encuentran los equipos latinoamericanos.

### El modelo europeo

Bajo el reglamento eIDAS, cada Estado miembro designa un organismo supervisor que mantiene y publica una _Trusted List_ nacional: un documento XML firmado con los prestadores cualificados de servicios de confianza y sus certificados. La Comisión Europea agrega esas listas en una lista de listas, lo que hace el conjunto teóricamente resoluble de forma automática.

En el directorio, los países europeos aparecen con sus organismos supervisores: AgID en Italia, Bundesnetzagentur en Alemania, ANSSI en Francia, EETT en Grecia, RDI en Países Bajos, RTR en Austria, FPS Economy en Bélgica, GNS en Portugal, RIA en Estonia y FNMT-RCM en España.

El volumen es considerable: Italia sola aporta más de doscientos certificados, y Grecia, Alemania y Francia superan cada una los setenta. Esa abundancia refleja un mercado abierto de prestadores cualificados, y explica por qué navegar una Trusted List a mano resulta impracticable.

### El modelo latinoamericano

La región opera con jerarquías nacionales cerradas y acreditación estatal, sin equivalente al reconocimiento mutuo europeo. En el directorio figuran Costa Rica bajo MICITT/DCFD, Perú bajo INDECOPI en el marco de la IOFE, Brasil bajo el ITI y Argentina bajo la AC Raíz de la Jefatura de Gabinete de Ministros. Cada una publica un puñado de certificados, no decenas: la jerarquía única concentra la emisión en un operador estatal en lugar de repartirla entre prestadores acreditados.

> Italia registra 231 certificados y Grecia 105; Costa Rica, 10, y Perú, 8. La asimetría no mide madurez: mide arquitectura. Jerarquías cerradas frente a mercados abiertos de prestadores.

### La consecuencia práctica

Para quien integra, la diferencia se siente así: en Europa el problema es de **volumen y filtrado**, hay demasiado y hace falta seleccionar. En América Latina el problema es de **localización y estabilidad**, hay poco, pero cuesta encontrarlo y no siempre está donde estaba.

Un directorio único con estructura homogénea, misma presentación de metadatos y mismo formato de descarga atiende los dos casos con la misma interfaz, sin obligar a que cada equipo reimplemente el acceso a cada esquema nacional.

## Sección 4: Cobertura del directorio

Las cifras siguientes son una instantánea. La lista vigente y autoritativa es siempre la del sitio.

**23 jurisdicciones · 1.000+ certificados · instantánea 23 jul 2026 · cobertura en expansión continua**

### Regiones y autoridades publicadoras

_Autoridades representativas por región; no es el listado completo._

| Región | Autoridades publicadoras |
|---|---|
| **América Central** | Costa Rica: MICITT / Dirección de Certificadores de Firma Digital (DCFD) |
| **América del Sur** | Argentina: Jefatura de Gabinete de Ministros (AC Raíz) · Brasil: ITI · Perú: INDECOPI (IOFE) |
| **Europa del Norte** | Estonia: RIA (Riigi Infosüsteemi Amet) |
| **Europa Occidental** | Alemania: Bundesnetzagentur · Austria: RTR · Bélgica: FPS Economy · Francia: ANSSI · Países Bajos: RDI |
| **Europa del Sur** | España: FNMT-RCM (Ceres) · Grecia: EETT · Italia: AgID · Portugal: GNS (SCEE) |
| **Identidad organizacional global** | GLEIF: vLEI, con emisores cualificados asociados (_did:keri_, _did:webs_) |

### Qué muestra cada ficha de país

Cada jurisdicción declara además su modelo de confianza, la norma que la rige, los algoritmos de clave, los formatos de firma y la vigencia de la instantánea de revocación. Costa Rica: jerarquía nacional, Ley 8454, RSA-4096, CAdES / PAdES / XAdES, con capacidades de persona física, persona jurídica, sellado de tiempo y sello electrónico. Esos metadatos permiten juzgar la frescura del dato **antes** de confiar en él.

### Un directorio en crecimiento

La cobertura se amplía en dos direcciones. Por **extensión**, con nuevas jurisdicciones. Y por **profundidad**, porque las autoridades ya replicadas emiten, renuevan y retiran certificados de forma continua.

> Un directorio útil no puede ser estático: esta copia impresa no sustituye a la consulta en línea.

## Sección 5: Identidad organizacional: el ancla vLEI

Junto a las anclas nacionales, el directorio mantiene una categoría propia, _identidad organizacional global_, encabezada por el vLEI de GLEIF, con sus emisores cualificados y los métodos de identificador _did:keri_ y _did:webs_ asociados. No cuelga de ninguna jurisdicción porque no responde a ninguna: su alcance es global por diseño.

### Qué es el vLEI

El vLEI, _verifiable LEI_, es la contraparte criptográfica del Identificador de Entidad Legal. Mientras el LEI es un código de 20 caracteres consultable en un índice público, el vLEI es una credencial verificable que permite a una organización, o a una persona actuando en su representación, probar esa identidad de forma criptográfica, sin depender de una consulta al registro en el momento de la verificación.

Los identificadores asociados son _did:keri_ y _did:webs_, construidos sobre KERI, un modelo de identificadores autocertificantes cuya autoridad deriva de la rotación de claves registrada en el propio identificador y no de un registro central.

### Por qué conviven en el mismo directorio

Porque responden a la misma pregunta desde ángulos complementarios. Una PKI nacional acredita _quién es esta persona o entidad ante este Estado_. El vLEI acredita _qué organización es esta a escala global, y quién puede actuar en su nombre_.

> En un expediente de onboarding corporativo transfronterizo, ambas piezas se necesitan: la firma cualificada nacional prueba el acto; la identidad organizacional global prueba que la entidad firmante es quien dice ser fuera de su jurisdicción.

### Un ejemplo concreto

Una entidad costarricense firma un contrato con certificado de persona jurídica emitido bajo la jerarquía del BCCR. La contraparte europea puede validar técnicamente esa firma si dispone de la raíz nacional, que el directorio le entrega con huella verificable, pero eso no le dice si la sociedad firmante es la matriz, una subsidiaria o un homónimo.

El LEI y su expresión verificable cubren esa segunda dimensión. La combinación: ancla nacional para la validez del acto, identidad organizacional para la identidad de la parte, es lo que hace defendible una verificación transfronteriza completa.

**Nota sobre alcance.** Attestto no es una autoridad de certificación, no emite certificados y no es Unidad Operativa Local acreditada por GLEIF. El directorio replica y estructura datos públicos publicados por cada autoridad.

## Sección 6: Integración técnica

Los mismos datos, tres superficies: legible para personas, importable en compilación y resoluble por API.

### Paquete npm

**[@attestto/trust](https://www.npmjs.com/package/@attestto/trust)** importa las anclas y los manifiestos por país en el proceso de compilación, en lugar de descargar certificados a mano y versionarlos como archivos sueltos.

```
$ npm install @attestto/trust

# manifiestos por país, listos para la validación
```

### Resolutor did:pki

El [resolutor did:pki](https://github.com/Attestto-com/attestto-did-resolver) expone las mismas anclas como interfaz de API y máquina, permitiendo resolver y verificar de forma programática contra ellas. Es el camino natural cuando la validación ocurre en tiempo de ejecución y no en tiempo de compilación.

### Ficha de certificado

Cada certificado tiene página propia con la **cadena de confianza** desde la raíz y los **campos del certificado**: sujeto y emisor, rol, algoritmo de clave, validez con días restantes, fechas con marca UTC, número de serie y huella SHA-256. Permite auditar sin descargar.

### Descarga directa

Cada certificado ofrece su _.pem_ original junto a la huella que confirma que el archivo descargado es el publicado por la autoridad. Para integraciones puntuales o auditorías manuales sigue siendo la vía más directa.

### Patrón de uso recomendado

- Obtener el ancla desde el directorio y **cotejar su huella SHA-256 contra la fuente oficial** de la autoridad publicadora antes del primer uso.
- Fijar el ancla por huella y no por nombre común, para evitar colisiones entre generaciones de una emisora.
- Registrar la ventana de validez de cada ancla y alertar con antelación suficiente antes del vencimiento.
- Consultar la revocación en el OCSP o la CRL de la autoridad: el directorio provee la cadena, no el estado en tiempo real.
- Reverificar periódicamente contra la fuente oficial: un espejo es una conveniencia, no una delegación.

## Sección 7: Alcance y límites

La utilidad de un espejo de anclas de confianza depende de que sus límites estén dichos con precisión. Un directorio que se presentara como autoridad invitaría exactamente al comportamiento que busca corregir: confiar sin verificar.

| Qué **es** | Qué **no es** |
|---|---|
| ✓ Espejo público independiente | ✕ Autoridad de certificación |
| ✓ Replica y estructura datos publicados por cada PKI nacional | ✕ Emite certificados o credenciales |
| ✓ Publica la huella SHA-256 como evidencia de integridad | ✕ Sustituye la verificación contra la fuente oficial |
| ✓ Provee material de cadena para construir la validación | ✕ Responde por el estado de revocación en tiempo real |
| ✓ Enlaza a la autoridad publicadora oficial de cada jurisdicción | ✕ Acredita, supervisa ni califica a esas autoridades |
| ✓ Ofrece los datos en formato legible y programático | ✕ Garantiza la exhaustividad de ninguna lista nacional |

> **La instrucción operativa es siempre la misma: verifique siempre contra la fuente oficial autoritativa.** El directorio existe para que esa verificación sea posible y rápida, no para evitarla.

### El directorio y lo que se construye sobre él

Attestto opera además un verificador de documentos que consume este directorio (Sección 9). Conviene mantener la distinción: el espejo es infraestructura pública, con datos abiertos y verificables por cualquiera; el verificador es un producto construido sobre esa infraestructura, igual que podría construirlo un tercero. Que exista uno no otorga al otro ninguna condición de autoridad, y los datos del directorio siguen siendo comprobables de forma independiente contra la fuente oficial.

### Por qué la independencia importa

Un espejo operado por un tercero sin función acreditadora tiene una propiedad útil: no compite con las autoridades que replica ni tiene incentivo para presentar sus datos de forma interesada. Su valor está en la fidelidad de la copia y en la claridad de la presentación, ambas comprobables por cualquiera que compare la huella publicada con la del certificado original.

## Sección 8: Casos de uso

El directorio no resuelve un problema nuevo. Resuelve uno viejo que cada equipo venía resolviendo por su cuenta, con resultados desiguales.

### Validación de documentos firmados

Plataformas de firma electrónica, gestores documentales y sistemas de expediente que reciben documentos firmados en varias jurisdicciones necesitan las cadenas completas para validar. Sin una fuente común, cada nueva jurisdicción admitida obliga a investigar dónde publica sus raíces ese país y a mantener ese hallazgo en el tiempo.

El caso se agrava con la validación a largo plazo. Un documento firmado hoy puede necesitar verificarse dentro de diez años, cuando la intermedia que lo emitió ya venció y la autoridad quizá reorganizó su sitio. Conservar la cadena con sus huellas al momento de la firma es parte del expediente, no un detalle de implementación.

### Onboarding y KYB transfronterizo

Cuando un cliente corporativo aporta documentación firmada digitalmente en su jurisdicción de origen, poder validar esa firma, en lugar de aceptar un PDF sin verificar, eleva sustancialmente la calidad de la evidencia.

La diferencia importa ante un supervisor. Un expediente que registra qué ancla se usó, con qué huella y en qué fecha es verificable por un tercero; uno que solo guarda el documento recibido, no.

### Sector público e interoperabilidad

Las administraciones que reciben trámites de residentes o empresas extranjeras enfrentan el mismo problema en sentido inverso, y con menos margen: no pueden rechazar un trámite válido por no saber validar la firma. Una fuente común de anclas reduce el trabajo de integración por cada jurisdicción que se decide admitir.

### Auditoría y peritaje

En una revisión posterior, auditoría interna, inspección, litigio, reconstruir la cadena de confianza vigente en la fecha de la firma exige acceso a certificados que quizá ya vencieron y a la certeza de cuál de varias generaciones homónimas estaba activa entonces. Un directorio con ventanas de validez explícitas y huellas publicadas convierte esa reconstrucción en una consulta.

### Desarrollo de producto

Para equipos que construyen sobre identidad digital, disponer de las anclas como dependencia versionada en lugar de como archivos copiados a mano cambia la naturaleza del problema: pasa de tarea manual recurrente a dependencia gestionada, con historial de cambios y revisión por pares como cualquier otra.

### Monitoreo de vencimientos

Las ventanas de validez publicadas permiten construir alertas antes de que una intermedia caduque. Es el control más barato de toda esta lista y el que más incidentes evita, porque el vencimiento de una CA no falla de forma parcial: falla de golpe y para todo.

> El denominador común de todos los casos es el mismo: sustituir una búsqueda incierta por una consulta reproducible.

## Sección 9: El directorio en uso

La prueba de que una capa de confianza funciona es que algo se apoye en ella. Attestto opera un verificador público de documentos firmados que consume el directorio como almacén de confianza: cada ancla con la que valida una cadena procede del mismo espejo descrito en las secciones anteriores.

El alcance del verificador es, por construcción, el alcance del directorio. Cada jurisdicción incorporada al espejo se vuelve verificable de inmediato, sin trabajo de integración adicional, y lo mismo aplica a la identidad organizacional basada en vLEI.

```
CA RAIZ NACIONAL - COSTA RICA v2    [del trust store]
  CA POLITICA PERSONA FISICA v2     [del trust store]
    CA SINPE - PERSONA FISICA v2    [del trust store]
      Certificado del firmante      [del documento]
```

_Cadena resuelta por el verificador. Las tres anclas provienen del directorio; solo el certificado del firmante viaja dentro del documento._

### Qué resuelve en la práctica

**El problema de las generaciones.** En el ejemplo, la emisora seleccionada es la generación de _CA SINPE - PERSONA FISICA v2_ vigente entre 2023 y 2031, una de las tres homónimas descritas en la Sección 2. Resolver por huella y no por nombre es lo que permite elegir la correcta sin ambigüedad.

**Revocación con fecha.** El resultado no afirma solo que el certificado no está revocado, sino cuándo se comprobó contra la lista de revocación. Una verificación sin fecha de consulta no es evidencia; es una opinión.

**Contexto de la firma.** Jurisdicción emisora, fecha de firma, vigencia del certificado y capacidades declaradas, firma de documentos, no repudio, protección de correo, se presentan junto al resultado, porque un certificado válido usado fuera de sus capacidades no sostiene el acto.

> **Validez a largo plazo.** El verificador distingue entre una firma válida hoy y una que seguirá siendo verificable cuando su cadena expire. Advertir esa diferencia importa más que ocultarla: es el aviso que evita descubrir el problema diez años tarde.

### Minimización de datos

La identificación nacional del firmante aparece enmascarada por omisión, con comprobación bajo demanda. Verificar una firma no debería exigir exponer el número de documento de quien firmó a cualquiera que abra el resultado.

## Conclusión

La firma digital cualificada funciona. Lo que falla, con regularidad, es el eslabón previo: conseguir el ancla correcta, saber que es la correcta y mantenerla vigente.

Ese eslabón no se arregla con más criptografía sino con mejor distribución. Datos públicos, estructurados de forma homogénea, identificados por huella, con ventanas de validez visibles y disponibles tanto para lectura humana como para consumo programático.

Attestto Trust ocupa exactamente ese espacio, y no más: un espejo público independiente que no emite, no acredita y no sustituye a la fuente oficial. Su propósito es que verificar contra esa fuente deje de ser un obstáculo.

Que un verificador de documentos funcione sobre esa base, y que su alcance crezca con cada jurisdicción incorporada sin trabajo de integración por país, es la mejor evidencia de que el problema estaba en la distribución y no en otra parte.

## Próximos pasos

Revise la cobertura del directorio para las jurisdicciones con las que opera y compare las huellas publicadas con las de los certificados que su organización tenga hoy en producción. Es un ejercicio breve que suele revelar anclas fijadas sin verificar, generaciones confundidas o vencimientos próximos sin monitoreo.

> **Explore el directorio.**
> [trust.attestto.org](https://trust.attestto.org) · [npm install @attestto/trust](https://www.npmjs.com/package/@attestto/trust)
>
> Verificador de documentos: [verify.attestto.com](https://verify.attestto.com)
>
> El proyecto es abierto y las contribuciones, correcciones, nuevas jurisdicciones, reportes de cambios en fuentes oficiales, son bienvenidas a través de los [repositorios públicos](https://github.com/Attestto-com/attestto-trust) y la comunidad en [Discord](https://discord.gg/F3AhFVarXz).

## Glosario

| Término | Definición |
|---|---|
| **Ancla de confianza** | Certificado raíz que un verificador acepta como punto de partida de una cadena de confianza. |
| **PKI** | Infraestructura de clave pública. Conjunto de autoridades, políticas y procedimientos que emiten y gestionan certificados digitales. |
| **CA raíz** | Autoridad de certificación autofirmada en la cima de una jerarquía. |
| **CA intermedia** | Autoridad subordinada que hereda confianza de la raíz y emite hacia niveles inferiores. |
| **Huella SHA-256** | Resumen criptográfico que identifica de forma única un certificado y permite detectar cualquier alteración. |
| **Ventana de validez** | Período entre las fechas de inicio y expiración de un certificado. |
| **.pem** | Formato de archivo de texto para certificados, codificado en Base64 entre delimitadores. |
| **OCSP** | Protocolo de consulta en línea del estado de revocación de un certificado. |
| **CRL** | Lista de revocación de certificados publicada periódicamente por una autoridad. |
| **eIDAS** | Reglamento europeo sobre identificación electrónica y servicios de confianza; establece las Trusted Lists nacionales. |
| **Trusted List** | Lista XML firmada que cada Estado miembro de la UE publica con sus prestadores cualificados de servicios de confianza. |
| **CAdES / PAdES / XAdES** | Formatos de firma electrónica avanzada para datos binarios, documentos PDF y documentos XML respectivamente. |
| **SINPE** | Sistema Nacional de Pagos Electrónicos del Banco Central de Costa Rica, operador de la jerarquía nacional de firma digital. |
| **MICITT / DCFD** | Ministerio de Ciencia, Innovación, Tecnología y Telecomunicaciones de Costa Rica y su Dirección de Certificadores de Firma Digital, órgano acreditador. |
| **LEI** | Identificador de Entidad Legal. Código de 20 caracteres bajo norma ISO 17442 que identifica de forma única a una persona jurídica. |
| **vLEI** | Expresión verificable del LEI como credencial criptográfica, asociada a los métodos did:keri y did:webs. |
| **DID** | Identificador descentralizado. Identificador resoluble a un documento con material criptográfico asociado. |

## Fuentes y recursos

- Attestto Trust: Directorio de anclas de confianza PKI. [trust.attestto.org](https://trust.attestto.org)
- Attestto: verificador público de documentos. [verify.attestto.com](https://verify.attestto.com)
- Paquete npm: [@attestto/trust](https://www.npmjs.com/package/@attestto/trust), para integración en compilación.
- Resolutor did:pki: [repositorio público en GitHub](https://github.com/Attestto-com/attestto-did-resolver).
- BCCR: Firma Digital y servicios de validación. [bccr.fi.cr/firma-digital](https://www.bccr.fi.cr/firma-digital)
- MICITT: Dirección de Certificadores de Firma Digital. [micitt.go.cr](https://www.micitt.go.cr/servicios/firma-digital-certificada)
- Costa Rica: Ley 8454 de Certificados, Firmas Digitales y Documentos Electrónicos.
- Unión Europea: Reglamento eIDAS y listas de confianza nacionales publicadas por los organismos supervisores.
- GLEIF: vLEI y ecosistema de credenciales verificables. [gleif.org](https://www.gleif.org)
- ISO 17442: Servicios financieros: esquema del Identificador de Entidad Legal.
- ETSI: Especificaciones de firma electrónica avanzada CAdES, PAdES y XAdES.

---

Attestto Trust es un espejo público independiente de anclas de confianza PKI nacionales. No es una autoridad de certificación y no emite certificados. Los certificados mostrados son datos públicos publicados por cada PKI nacional; cada entrada incluye su huella SHA-256 como evidencia de integridad. Verifique siempre contra la fuente oficial autoritativa. Este documento tiene fines informativos y no constituye asesoría técnica ni legal. Las cifras de cobertura corresponden al 23 de julio de 2026 y varían con las actualizaciones de cada autoridad. Las marcas y nombres citados pertenecen a sus respectivos titulares.

© 2026 Attestto. Todos los derechos reservados.
