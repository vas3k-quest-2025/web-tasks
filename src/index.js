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
      case 'andr01d_ch4rg1ng_st4t10n':
        result = await checkAndroidCharging(data);
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
    code: "УПОРСТВО"
  };
}

async function checkAndroidCharging(data) {
  const solution = data.solution;
  
  // Проверяем, что решение существует и не пустое
  if (!solution || !Array.isArray(solution)) {
    return { success: false, message: 'Неверный формат решения' };
  }

  // Проверяем количество андроидов
  if (solution.length !== 14) {
    return { success: false, message: 'Неверное количество андроидов' };
  }

  // Проверяем, что все андроиды находятся рядом с розетками
  const socketCells = [
    {x: 0, y: 4}, {x: 0, y: 5}, {x: 1, y: 1}, {x: 1, y: 6},
    {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 3}, {x: 4, y: 4},
    {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 1}, {x: 6, y: 6},
    {x: 7, y: 2}, {x: 7, y: 3}
  ];

  for (const android of solution) {
    // Проверяем, что андроид не на розетке
    if (socketCells.some(socket => socket.x === android.x && socket.y === android.y)) {
      return { success: false, message: 'Андроид не может находиться на розетке' };
    }

    // Проверяем, что рядом есть розетка
    const hasAdjacentSocket = socketCells.some(socket => {
      const dx = Math.abs(socket.x - android.x);
      const dy = Math.abs(socket.y - android.y);
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    });

    if (!hasAdjacentSocket) {
      return { success: false, message: 'Андроид должен находиться рядом с розеткой' };
    }
  }

  // Проверяем, что андроиды не соседствуют друг с другом
  for (let i = 0; i < solution.length; i++) {
    for (let j = i + 1; j < solution.length; j++) {
      const dx = Math.abs(solution[i].x - solution[j].x);
      const dy = Math.abs(solution[i].y - solution[j].y);
      if (dx <= 1 && dy <= 1) {
        return { success: false, message: 'Андроиды не могут находиться рядом друг с другом' };
      }
    }
  }

  // Проверяем количество андроидов в каждом ряду
  const rowCounts = [2, 2, 1, 1, 3, 1, 2, 2];
  for (let y = 0; y < 8; y++) {
    const count = solution.filter(android => android.y === y).length;
    if (count !== rowCounts[y]) {
      return { success: false, message: 'Неверное количество андроидов в ряду' };
    }
  }

  // Проверяем количество андроидов в каждом столбце
  const colCounts = [2, 2, 1, 2, 1, 2, 2, 2];
  for (let x = 0; x < 8; x++) {
    const count = solution.filter(android => android.x === x).length;
    if (count !== colCounts[x]) {
      return { success: false, message: 'Неверное количество андроидов в столбце' };
    }
  }

  // Если все проверки пройдены, возвращаем код
  return {
    success: true,
    code: "ЛИТИЙ"
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