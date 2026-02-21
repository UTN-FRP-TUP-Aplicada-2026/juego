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

                if (currentTop > $gameArea.height()) {
                    $obstacle.remove();
                    clearInterval(interval);
                } else {
                    $obstacle.css('top', currentTop + speed);
                }

                // 🔥 detectar captura con hilo
                if (activeWeb) {
                    const webRect = activeWeb[0].getBoundingClientRect();
                    const obstacleRect = $obstacle[0].getBoundingClientRect();

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
                    }
                }
            }, 30);
        }
    }

    // ===============================
    // MOVER ARAÑA CON EL MOUSE
    // ===============================
    $gameArea.on('mousemove', function (e) {
        if (isGameOver) return;

        const offset = $gameArea.offset();
        const x = e.pageX - offset.left - 25;
        const y = e.pageY - offset.top - 25;

        $spider.css({
            left: x,
            top: y,
            bottom: 'auto',
            transform: 'none'
        });
    });

    // ===============================
    // DISPARAR HILO (ESPACIO)
    // ===============================
    $(document).on('keydown', function (e) {
        if (isGameOver) return;
        if (e.code !== 'Space') return;
        if (activeWeb) return; // solo un hilo a la vez

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

        // animar hilo hacia arriba
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
    });

    // ===============================
    function endGame() {
        isGameOver = true;
        clearInterval(gameInterval);
        $gameOver.show();
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

    startGame();
});