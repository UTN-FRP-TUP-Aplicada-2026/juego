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
                        $obstacle.remove();
                        score++;
                        $score.text(`Score: ${score}`);

                        if (score % 10 === 0) {
                            difficulty++;
                            speed += 1;
                        }
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
        const maxLeft = $gameArea.width() - 50;
        let newLeft = currentLeft + (direction * step);
        
        // Limitar límites
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        $spider.css('left', newLeft);
    }

    $(document).on('keydown', function (e) {
        if (isGameOver) return;

        // ⬅️➡️ mover
        if (e.key === 'ArrowLeft') {
            moveSpider(-1);
        }
        if (e.key === 'ArrowRight') {
            moveSpider(1);
        }

        // 🕸️ disparar
        if (e.code === 'Space') {
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
        startGame();
    }

    function startGame() {
        gameInterval = setInterval(createObstacle, 1000);
    }

    $resetButton.on('click', resetGame);

    // ===============================
    // CONTROLES MOBILE
    // ===============================
    $('#btnLeft').on('click touchstart', function () {
        moveSpider(-1);
    });

    $('#btnRight').on('click touchstart', function () {
        moveSpider(1);
    });

    $('#btnShoot').on('click touchstart', function () {
        $(document).trigger($.Event('keydown', { code: 'Space' }));
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