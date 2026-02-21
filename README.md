# 🕷️ Spider Web Game — README

## 📌 Descripción

**Spider Web Game** es un minijuego web en JavaScript/jQuery donde el jugador controla una araña que se mueve horizontalmente en la parte inferior de la pagina y dispara hilos para atrapar bloques (congelear) bloques que caen.

El proyecto está pensado para:

* practicar lógica de juego en tiempo real
* experimentar con colisiones DOM
* soportar desktop y mobile
* evolucionar con ayuda de Copilot

---

## 🎮 Mecánicas actuales

### Movimiento

* ⬅️ **Flecha izquierda** → mueve la araña 25px hacia la izquierda
* ➡️ **Flecha derecha** → mueve la araña 25px hacia la derecha
* Limitación: la araña no puede salirse de los bordes del gameArea
* 📱 **Botones para control táctil** desde navegador móvil con eventos `click` y `touchstart`

### Disparo

* ⌨️ Barra espaciadora → dispara hilo
* 📱 Botón de disparo → equivalente a Space


### Obstáculos

* Los bloques caen desde la parte superior (rojo por defecto)
* La caída de bloques aumenta en velocidad y en cantidad con el score a medida que pasa el tiempo
* **Bloques congelados**: al tocar el hilo, el bloque se congela (suspende) en su posición actual y cambia de color a azul
* **Colisión entre bloques**: cuando un bloque que cae choca contra un bloque congelado, **ambos se eliminan** del juego
* Esta mecánica permite crear cadenas de reacciones: derribar un bloque congelado permite que otros caigan en cascada

### Game Over

Ocurre cuando:

* ❌ un bloque colisiona con la araña

Al terminar:

* se detiene el spawn
* aparece el cartel "Game Over"
* se ejecuta la animación de persecución. Consiste en que el personaje (la araña: "araña.png" ) va de esquena derecha a izquierda y luego de izquierda a derecha persiguiendo una araña bot (img/bot.png) 

---

## 🧱 Estructura del proyecto

```text
/index.html
/css/styles.css
/js/main.js
/img/
    spider.png
    bot.png
```

---

## ⚙️ Variables clave del juego

| Variable     | Propósito                     | Rango/Valores  |
| ------------ | ----------------------------- | -------------- |
| `score`      | puntaje actual                | 0 → ∞          |
| `speed`      | velocidad de caída de bloques | 3 → ∞ (px/frame) |
| `difficulty` | cantidad de bloques por spawn | 1 → ∞ (bloques/spawn) |
| `isGameOver` | estado del juego              | true/false     |
| `activeWeb`  | hilo activo (jQuery object)   | null/jQuery    |
| `gameInterval` | ID del spawn loop            | setInterval ID |

**Progresión:**
- Cada 10 puntos: `difficulty++` y `speed += 1`
- Bloques spawn cada 1000ms (1 segundo)
- Cada bloque cae a velocidad `speed` (30ms por frame)

---

## 🔁 Loop principal

El juego se basa en dos loops:

### 1️⃣ Spawn loop

```js
setInterval(createObstacle, 1000);
```

Responsable de:

* crear obstáculos
* aumentar dificultad

---

### 2️⃣ Loop de cada obstáculo

Cada bloque tiene su propio `setInterval` que:

* lo mueve hacia abajo
* detecta colisión con hilo
* detecta colisión con araña

---

## 💥 Sistema de colisiones

Se usa bounding box del DOM:

```js
element.getBoundingClientRect()
```

Actualmente hay tres detecciones:

### 🕸️ Hilo vs obstáculo

Congela el bloque (lo suspende) y suma puntos. El bloque cambia de color rojo a azul.

### ⚡ Bloque que cae vs bloque congelado

**Ambos bloques se eliminan**. Permite crear cadenas de reacciones destructivas.

Comportamiento:
- El bloque que cae detecta colisión con el bloque congelado
- Se elimina el bloque que cayó
- Se elimina el bloque congelado que fue impactado
- Esta mecánica permite derribar estructuras (skill-based gameplay)

### 💀 Obstáculo vs araña

Dispara `endGame()`.

---

## ❄️ Sistema de bloques congelados

Cuando un bloque es alcanzado por el hilo:

1. El bloque recibe la clase CSS `.frozen`
2. Se detiene su movimiento (clearInterval del loop de caída)
3. Cambia de apariencia: color azul y bordes
4. Permanece estático en esa posición
5. Actúa como obstáculo: bloques que caen sobre él se destruyen **junto con el bloque congelado**
6. Se elimina cuando Game Over O cuando es impactado por un bloque que cae

Implementación:
```js
$obstacle.addClass('frozen');  // marcar como congelado
// El hilo se destruye inmediatamente
activeWeb.remove();
activeWeb = null;
```

Cuando colisiona con un bloque que cae:
```js
if (collidedFrozen) {
    $obstacle.remove();        // eliminar bloque que cae
    collidedFrozen.remove();   // eliminar bloque congelado
    return;
}
```

Estilos asociados:
```css
.obstacle.frozen {
    background-color: #00a8ff;
    opacity: 0.8;
    border: 2px solid #0080cc;
}
```

### Estrategia de juego

Los bloques congelados permiten:
- **Crear torres**: acumular bloques congelados para construir defensas
- **Destruir torres**: si un bloque cae sobre la estructura, ambos se eliminan (puedes derribar torres estratégicamente)
- **Skill-based gameplay**: requiere precisión para crear y destruir estructuras

---

## ⌨️ Sistema de entrada (Input)

### Controles de teclado

```js
$(document).on('keydown', function (e) {
    // ArrowLeft: e.code === 'ArrowLeft'
    // ArrowRight: e.code === 'ArrowRight'
    // Space: e.code === 'Space'
    // Usar e.preventDefault() para evitar scroll
});
```

**Notas importantes:**
- Usar `e.code` en lugar de `e.key` para arrow keys (más portable)
- Agregar `e.preventDefault()` para evitar que el navegador capture las teclas
- Verificar `isGameOver` antes de procesar comandos de juego
- Un solo hilo activo (`activeWeb`) a la vez

### Controles móviles

```html
<button id="btnLeft">⬅️</button>
<button id="btnShoot">🕸️</button>
<button id="btnRight">➡️</button>
```

```js
$('#btnLeft').on('click touchstart', function () {
    moveSpider(-1);
});
```

**Notas:**
- Usar `click` para desktop y `touchstart` para dispositivos táctiles
- No usar `mousedown` (mejor usar eventos separados)
- Prevenir multi-touch usando flags o tracking de toques activos

---

## 🎯 Performance y optimizaciones

### Problemas potenciales

1. **Memory leaks**: Cada bloque crea un `setInterval` que debe limpiarse
   - Solución: `clearInterval()` en cada rama de salida (colisión, salida de pantalla, game over)

2. **Muchos setIntervals activos**: Con `difficulty` alto, muchos loops en paralelo
   - Alternativa: usar `requestAnimationFrame` con un loop único
   - Alternativa: usar `setTimeout` en lugar de `setInterval`

3. **Búsqueda lineal de colisiones**: Cada bloque busca contra todos los bloques congelados
   - Solución: usar spatial partitioning o quadtrees para juegos más grandes

### Optimizaciones actuales

- `clearInterval` en las siguientes situaciones:
  - Game Over
  - Bloque sale de pantalla
  - Colisión con hilo (bloque congelado)
  - Colisión con bloque congelado (bloque destruido)

### Próximas optimizaciones

- Reemplazar `setInterval` por `requestAnimationFrame`
- Usar object pooling para reutilizar el DOM de bloques
- Usar CSS animations/transitions en lugar de JS para animaciones suaves

---

## 🤖 Animación post-game

Cuando ocurre Game Over:

* se crea `#aranabot`
* el bot se mueve horizontalmente
* la araña lo persigue suavemente

Función principal:

```js
startChaseAnimation()
```

---

## 🚧 Pendientes (TODO para Copilot)

### ✅ Completado

* [x] limitar movimiento dentro del gameArea
* [x] bloques congelados (suspendidos) al tocar el hilo
* [x] **eliminación mutua**: bloques que caen destruyen bloques congelados (y viceversa)
* [x] controles móviles (click/touchstart)
* [x] corregir tecla izquierda en teclado (usando e.code en lugar de e.key)

### Alta prioridad

* [ ] mejorar hitbox de la araña
* [ ] prevenir multi-touch issues
* [ ] suavizar movimiento (lerp o easing)
* [ ] sonidos (colisión, congelado, game over)
* [ ] indicador visual de cadena de reacciones (combo counter)

### Media

* [ ] animación del hilo (transición suave de altura)
* [ ] sprites animados de la araña
* [ ] pausa del juego (tecla P o botón)
* [ ] indicador de dificultad/nivel actual

### Pro

* [ ] reemplazar setInterval por requestAnimationFrame (mejor rendimiento)
* [ ] object pooling de obstáculos (reutilizar en lugar de crear/destruir)
* [ ] sistema de niveles con velocidades progresivas
* [ ] soporte gamepad (controladores)
* [ ] multiplayer local (2 jugadores)

---

## 📐 Arquitectura y patrones

### Patrón de desarrollo

El proyecto usa **jQuery** con un patrón de **event-driven + loops de juego**:

```
$(document).ready() 
  ├─ inicializar variables globales
  ├─ definir funciones de lógica del juego
  ├─ vincular event listeners (keydown, buttons)
  ├─ vincular event listeners (reset)
  └─ startGame() → setInterval(createObstacle, 1000)
```

### Flujo de creación de bloques

```
createObstacle() [cada 1000ms]
  └─ for (difficulty bloques)
     └─ cada bloque:
        ├─ crear <div class="obstacle"> 
        ├─ posición random en X, top: 0
        └─ setInterval [cada 30ms]
           ├─ mover hacia abajo (speed px)
           ├─ verificar salida de pantalla
           ├─ detectar 3 colisiones:
           │  1. hilo → congelar bloque + suma puntos
           │  2. bloque congelado → ELIMINAR AMBOS
           │  3. araña → game over
           └─ limpiar si es necesario
```

### Manejo de estado

- **`isGameOver`**: flag principal que detiene lógica del juego
- **`activeWeb`**: referencia al único hilo activo (null si no hay)
- Todas las funciones de lógica verifican `if (isGameOver) return;`
- `resetGame()` limpia todo y reinicia

### Uso de jQuery

```js
const $spider = $('#mouse');           // selector
const spiderPos = $spider.position();   // posición
$spider.css('left', newLeft);          // cambiar CSS
$obstacle.addClass('frozen');          // agregar clase
```

**Nota**: jQuery es usado para manipulación del DOM y eventos. Para un proyecto más grande, considerar usar Vue.js, React, o Vanilla JS con Web Components.

---

## 🧪 Cómo correr el proyecto

1. Clonar repo
2. Abrir `index.html`
3. Servir con live server (recomendado)

Ejemplo:

```bash
npx serve .
```

