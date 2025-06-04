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
      case 'c0mpl3x_h0w3rb04rd_m4z3':
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
  const path = data.path;
  
  // Проверяем, что путь существует и не пустой
  if (!path || !Array.isArray(path) || path.length === 0) {
    return { success: false, message: 'Неверный формат пути' };
  }

  // Проверяем, что путь начинается и заканчивается в точке (0,0)
  if (path[0].x !== 0 || path[0].y !== 0 || 
      path[path.length - 1].x !== 0 || path[path.length - 1].y !== 0) {
    return { success: false, message: 'Путь должен начинаться и заканчиваться в точке (0,0)' };
  }

  // Проверяем, что все ходы валидны
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    
    // Проверяем, что ход сделан на соседнюю клетку
    const dx = Math.abs(curr.x - prev.x);
    const dy = Math.abs(curr.y - prev.y);
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
      return { success: false, message: 'Неверный ход: можно ходить только на соседнюю клетку' };
    }
  }

  // Проверяем, что все доступные клетки посещены
  const size = 7;
  const occupiedCells = [
    {x: 4, y: 0},
    {x: 2, y: 1},
    {x: 4, y: 2},
    {x: 2, y: 4},
    {x: 3, y: 6}
  ];

  const visitedCells = new Set();
  path.forEach(point => {
    visitedCells.add(`${point.x},${point.y}`);
  });

  // Проверяем, что все не занятые клетки посещены
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isOccupied = occupiedCells.some(cell => cell.x === x && cell.y === y);
      if (!isOccupied && !visitedCells.has(`${x},${y}`)) {
        return { success: false, message: 'Не все клетки посещены' };
      }
    }
  }

  // Если все проверки пройдены, возвращаем код
  return {
    success: true,
    code: "ГРАВИТАЦИЯ"
  };
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