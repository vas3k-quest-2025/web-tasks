import { Router } from 'itty-router';

const router = Router();

// Middleware для обработки CORS
router.all('*', async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
});

// Обработчик для проверки заданий
router.post('/check/:taskName', async (request, { taskName }) => {
  try {
    const data = await request.json();
    let result;

    switch (taskName) {
      case '1337_b1ind_k3yb04rd':
        result = await checkBlindKeyboard(data);
        break;
      case 'c0mp13x_h0w3rb04rd_maze':
        result = await checkHoverboardMaze(data);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Unknown task' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Функции проверки заданий
async function checkBlindKeyboard(data) {
  // TODO: Реализовать проверку для задания с клавиатурой
  return { success: true, message: 'Blind keyboard check passed' };
}

async function checkHoverboardMaze(data) {
  // TODO: Реализовать проверку для задания с лабиринтом
  return { success: true, message: 'Hoverboard maze check passed' };
}

// Обработка всех остальных запросов
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: router.handle
}; 