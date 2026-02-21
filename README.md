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

* ⬅️➡️ Flechas izquierda/derecha → mueven la araña
* 📱 Botones para control táctil desde navegador móvil (celular)

### Disparo

* ⌨️ Barra espaciadora → dispara hilo
* 📱 Botón de disparo → equivalente a Space


### Obstáculos

* Los bloques caen desde la parte superior
* La caida de bloques aumentan en velocidad y en cantidad con el score a medida que aumenta el tiempo
* Se conjelan al tocar el hilo, quedan suspendidos.

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

| Variable     | Propósito                     |
| ------------ | ----------------------------- |
| `score`      | puntaje actual                |
| `speed`      | velocidad de caída            |
| `difficulty` | cantidad de bloques por spawn |
| `isGameOver` | estado del juego              |
| `activeWeb`  | hilo activo                   |

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

Actualmente hay dos detecciones:

### 🕸️ Hilo vs obstáculo

Destruye el bloque y suma puntos.

### 💀 Obstáculo vs araña

Dispara `endGame()`.

---

## 📱 Controles mobile

Botones requeridos en el HTML:

```html
<button id="btnLeft">⬅️</button>
<button id="btnShoot">🕸️</button>
<button id="btnRight">➡️</button>
```

Eventos soportados:

* `click`
* `touchstart`

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

### Alta prioridad

* [ ] limitar movimiento dentro del gameArea
* [ ] mejorar hitbox de la araña
* [ ] prevenir multi-touch issues
* [ ] suavizar movimiento (lerp)

### Media

* [ ] animación del hilo
* [ ] sprites de la araña
* [ ] pausa del juego

### Pro

* [ ] reemplazar setInterval por requestAnimationFrame
* [ ] object pooling de obstáculos
* [ ] sistema de niveles
* [ ] soporte gamepad

---

## 🧪 Cómo correr el proyecto

1. Clonar repo
2. Abrir `index.html`
3. Servir con live server (recomendado)

Ejemplo:

```bash
npx serve .
```

