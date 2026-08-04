// server/api/cdek.ts
import { defineEventHandler, getQuery, readBody } from 'h3'

// Тестовые доступы СДЭК (для продакшена замени URL на https://api.cdek.ru/v2 и вставь свои ключи)
const CDEK_API_URL = 'https://api.edu.cdek.ru/v2'
const CLIENT_ID = 'wqGwiQx0gg8mLtiEKsUinjVSICCjtTEP'
const CLIENT_SECRET = 'RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5'

// Простейший кэш в памяти сервера для хранения токена
let cachedToken: { access_token: string, expires_at: number } | null = null

// Функция получения токена авторизации
async function getCdekToken() {
  const now = Date.now()
  // Если токен есть и он еще жив (с запасом в 5 секунд), отдаем его из кэша
  if (cachedToken && cachedToken.expires_at > now + 5000) {
    return cachedToken.access_token
  }

  // Иначе идем в СДЭК за новым токеном
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', CLIENT_ID)
  params.append('client_secret', CLIENT_SECRET)

  const response: any = await $fetch(`${CDEK_API_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })

  // Сохраняем новый токен
  cachedToken = {
    access_token: response.access_token,
    expires_at: now + (response.expires_in * 1000)
  }

  return cachedToken.access_token
}

export default defineEventHandler(async (event) => {
  // Гарантируем, что ответ всегда будет восприниматься виджетом как JSON
  setHeader(event, 'Content-Type', 'application/json')

  const method = event.method
  const query = getQuery(event)
  
  // Виджет передает параметр action в query для GET и обычно в body для POST
  let action = query.action

  if (method === 'POST') {
    const body = await readBody(event)
    if (body && body.action) {
      action = body.action
    }
  }

  if (!action) {
    return { error: 'Не передан параметр action' }
  }

  try {
    const token = await getCdekToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    // Обработка запроса на список офисов (ПВЗ)
    if (action === 'offices') {
      // Копируем параметры запроса и удаляем служебные, чтобы не смущать API СДЭКа
      const cdekQuery = { ...query }
      delete cdekQuery.action
      delete cdekQuery.is_handout

      const response = await $fetch(`${CDEK_API_URL}/deliverypoints`, {
        method: 'GET',
        headers,
        query: cdekQuery
      })
      return response
    }

    // Обработка запроса на расчет стоимости доставки (если включена кнопка выбора тарифов)
    if (action === 'calculate') {
      const body = await readBody(event)
      const response = await $fetch(`${CDEK_API_URL}/calculator/tariff`, {
        method: 'POST',
        headers,
        body
      })
      return response
    }

    return { error: `Действие ${String(action)} пока не поддерживается нашим прокси` }
    
  } catch (error: any) {
    console.error('Ошибка при обращении к API СДЭК:', error.data || error.message)
    setResponseStatus(event, error.response?.status || 500)
    return {
      error: 'Ошибка при запросе к СДЭК',
      details: error.message
    }
  }
})