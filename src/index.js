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
router.post('/check/:taskName', async (request) => {
     
  try {
    const taskName = request.params?.taskName;

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
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});

// Функции проверки заданий
async function checkBlindKeyboard(data) {
  const targetText = "Анализ показал, что при высокой нагрузке на имплант наблюдается рост латентных отклонений в когнитивной активности носителя.";
  const normalizedTargetText = targetText.replace(/\n/g, ' ');
  const normalizedUserText = data.text.replace(/\n/g, ' ');

  if (normalizedUserText === normalizedTargetText) {
    return {
      success: true,
      code: "ЗУБРИЛКА"
    };
  }

  return {
    success: false,
    message: "Текст набран неверно"
  };
}

async function checkHoverboardMaze(data) {
  // TODO: Реализовать проверку для задания с лабиринтом
  return { success: true, message: 'Hoverboard maze check passed' };
}

// CTF flag
router.get('/.env', () => new Response('API_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmbGFnIjoiQ1RGe2JyMGszbl9jMG50cjBsfSIsImNvbmdyYXR1bGF0aW9ucyI6IllvdSBmb3VuZCBpdCEifQ.vq9EpJxV1OWg1aibQNfw0zl6OL08hdU0pCSXwgv6TXs'));

// Главная страница
router.all('/', () => new Response('Welcome to the Vas3k Quest 2025!', { status: 200 }));

// Обработка статических файлов
router.get('*', async (request, env) => {
  try {
    // Пытаемся получить файл из статического хранилища
    const response = await env.ASSETS.fetch(request);
    if (response.status === 200) {
      return response;
    }
    
    // Если файл не найден, возвращаем 404
    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

// Обработка всех остальных запросов
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: (request, env, ctx) => router.handle(request, env, ctx)
}; 