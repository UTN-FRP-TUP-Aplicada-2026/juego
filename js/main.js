 $(document).ready(function () {
    const $spider = $('#mouse'); // reutilizamos el id
    const $gameArea = $('#gameArea');
    const $score = $('#score');
    const $gameOver = $('#gameOver');
    const $resetButton = $('#resetButton');

    let score = 0;
    let speed = 3;
    let difficulty = 1;
    let gameInterval;
    let isGameOver = false;
    let activeWeb = null; // hilo activo

    // Centrar la araña al inicio
    function centerSpider() {
        const centerX = $gameArea.width() / 2 - 25; // 25 es la mitad del ancho de la araña (50px)
        $spider.css('left', centerX);
    }

    // Inicializar posición de la araña
    centerSpider();

    // ===============================
    // CREAR BLOQUES
    // ===============================
    function createObstacle() {
        if (isGameOver) return;

        for (let i = 0; i < difficulty; i++) {
            const $obstacle = $('<div class="obstacle"></div>');
            const randomX = Math.random() * ($gameArea.width() - 50);

            $obstacle.css({ top: 0, left: randomX });
            $gameArea.append($obstacle);

            const interval = setInterval(() => {
                if (isGameOver) {
                    clearInterval(interval);
                    $obstacle.remove();
                    return;
                }

                const currentTop = parseInt($obstacle.css('top'));

                // Verificar si salió de pantalla
                if (currentTop > $gameArea.height()) {
                    $obstacle.remove();
                    clearInterval(interval);
                    return;
                }

                // Mover hacia abajo
                $obstacle.css('top', currentTop + speed);

                // 🔥 detectar colisiones
                const obstacleRect = $obstacle[0].getBoundingClientRect();
                const spiderRect = $spider[0].getBoundingClientRect();

                // 🕸️ colisión con hilo
                if (activeWeb) {
                    const webRect = activeWeb[0].getBoundingClientRect();

                    if (
                        webRect.left < obstacleRect.right &&
                        webRect.right > obstacleRect.left &&
                        webRect.top < obstacleRect.bottom &&
                        webRect.bottom > obstacleRect.top
                    ) {
                        // Congelar el bloque en lugar de eliminarlo
                        $obstacle.addClass('frozen');
                        score++;
                        $score.text(`Score: ${score}`);

                        if (score % 10 === 0) {
                            difficulty++;
                            speed += 1;
                        }
                        activeWeb.remove();
                        activeWeb = null;
                        clearInterval(interval);
                        return;
                    }
                }

                // 🔌 colisión con bloques congelados
                if (!$obstacle.hasClass('frozen')) {
                    const frozenBlocks = $('.obstacle.frozen');
                    let collidedFrozen = null;

                    frozenBlocks.each(function () {
                        const frozenRect = this.getBoundingClientRect();

                        if (
                            obstacleRect.left < frozenRect.right &&
                            obstacleRect.right > frozenRect.left &&
                            obstacleRect.top < frozenRect.bottom &&
                            obstacleRect.bottom > frozenRect.top
                        ) {
                            collidedFrozen = $(this);
                            return false;
                        }
                    });

                    if (collidedFrozen) {
                        // Eliminar ambos bloques: el que cae y el que está congelado
                        $obstacle.remove();
                        collidedFrozen.remove();
                        clearInterval(interval);
                        return;
                    }
                }

                // 💀 colisión con araña (GAME OVER)
                if (
                    spiderRect.left < obstacleRect.right &&
                    spiderRect.right > obstacleRect.left &&
                    spiderRect.top < obstacleRect.bottom &&
                    spiderRect.bottom > obstacleRect.top
                ) {
                    endGame();
                }
            }, 30);
        }
    }

    // ===============================
    // DISPARAR HILO (ESPACIO)
    // ===============================
    function moveSpider(direction) {
        if (isGameOver) return;
        const step = 25;
        const currentLeft = $spider.position().left;
        const spiderWidth = 50;
        const maxLeft = $gameArea.width() - spiderWidth;
        const minLeft = 0;
        
        let newLeft = currentLeft + (direction * step);
        
        // Limitar límites
        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        $spider.css('left', newLeft);
    }

    $(document).on('keydown', function (e) {
        if (isGameOver && e.code !== 'ArrowLeft' && e.code !== 'ArrowRight' && e.code !== 'Space') return;

        // ⬅️➡️ mover con arrow keys
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            moveSpider(-1);
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            moveSpider(1);
        }

        // 🕸️ disparar
        if (e.code === 'Space') {
            e.preventDefault();
            if (isGameOver) return;
            if (activeWeb) return;

            const spiderPos = $spider.position();

            activeWeb = $('<div class="web"></div>');
            activeWeb.css({
                position: 'absolute',
                width: '4px',
                background: '#555',
                left: spiderPos.left + 23,
                top: spiderPos.top,
                height: '0px'
            });

            $gameArea.append(activeWeb);

            const webInterval = setInterval(() => {
                if (!activeWeb) {
                    clearInterval(webInterval);
                    return;
                }

                const currentHeight = parseInt(activeWeb.css('height'));
                const newTop = parseInt(activeWeb.css('top')) - 15;

                if (newTop <= 0) {
                    activeWeb.remove();
                    activeWeb = null;
                    clearInterval(webInterval);
                } else {
                    activeWeb.css({
                        height: currentHeight + 15,
                        top: newTop
                    });
                }
            }, 30);
        }
    });

    // ===============================
    function endGame() {
        if (isGameOver) return;

        isGameOver = true;
        clearInterval(gameInterval);
        $gameOver.show();

        startChaseAnimation(); // 👈 LA MAGIA
    }

    function resetGame() {
        isGameOver = false;
        score = 0;
        speed = 3;
        difficulty = 1;
        $score.text(`Score: ${score}`);
        $gameOver.hide();
        $gameArea.find('.obstacle').remove();
        $('.web').remove();
        activeWeb = null;
        centerSpider();
        startGame();
    }

    function startGame() {
        gameInterval = setInterval(createObstacle, 1000);
    }

    $resetButton.on('click', resetGame);

    // ===============================
    // CONTROLES MOBILE
    // ===============================
    $('#btnLeft').on('click touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        moveSpider(-1);
    });

    $('#btnRight').on('click touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        moveSpider(1);
    });

    $('#btnShoot').on('click touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!isGameOver && !activeWeb) {
            // Disparar hilo
            const spiderPos = $spider.position();
            activeWeb = $('<div class="web"></div>');
            activeWeb.css({
                position: 'absolute',
                width: '4px',
                background: '#555',
                left: spiderPos.left + 23,
                top: spiderPos.top,
                height: '0px'
            });

            $gameArea.append(activeWeb);

            const webInterval = setInterval(() => {
                if (!activeWeb) {
                    clearInterval(webInterval);
                    return;
                }

                const currentHeight = parseInt(activeWeb.css('height'));
                const newTop = parseInt(activeWeb.css('top')) - 15;

                if (newTop <= 0) {
                    activeWeb.remove();
                    activeWeb = null;
                    clearInterval(webInterval);
                } else {
                    activeWeb.css({
                        height: currentHeight + 15,
                        top: newTop
                    });
                }
            }, 30);
        }
    });

    function startChaseAnimation() {
        const $bot = $('<div id="aranabot"></div>');
        $gameArea.append($bot);

        let botX = $gameArea.width() - 60;
        let dir = -1;

        $bot.css({
            left: botX,
            top: $spider.position().top
        });

        const chaseInterval = setInterval(() => {
            if (!isGameOver) {
                clearInterval(chaseInterval);
                $bot.remove();
                return;
            }

            // mover bot
            botX += dir * 4;
            if (botX < 0 || botX > $gameArea.width() - 50) {
                dir *= -1;
            }
            $bot.css('left', botX);

            // la araña lo persigue
            const spiderX = $spider.position().left;
            const diff = botX - spiderX;

            $spider.css('left', spiderX + diff * 0.05);

        }, 30);
    }

    startGame();
});