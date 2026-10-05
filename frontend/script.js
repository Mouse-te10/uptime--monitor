const API_URL = 'http://localhost:8000/api/sites'
const sitesList = document.getElementById('sites-list')
const addForm = document.getElementById('add-form')
const urlInput = document.getElementById('url-input')
const errorMsg = document.getElementById('error-msg')
const refreshBtn = document.getElementById('refresh-btn') //переменные

async function loadSites() { //функция загрузки сайтов
  try {
    refreshBtn.disabled = true //отключение кнопки
    refreshBtn.innerText = 'Проверяю...'

    const response = await fetch(API_URL)
    const sites = await response.json()
    
    sitesList.innerHTML = '' //обнуление списка сайтов

    sites.forEach(site => {
      const card = document.createElement('div')
      card.className = 'site-card'

      if (site.status.startsWith('UP')) {
        card.classList.add('up')
      } else {
        card.classList.add('down')
      }

      card.innerHTML = `
      <span class="url">${site.url}</span>
      <span class="status">${site.status}</span>
      `
      sitesList.appendChild(card)
    })
  } catch (error) {
    errorMsg.innerText = 'Ошибка подключения к бэкенду'
  } finally {
    refreshBtn.disabled = false
    refreshBtn.innerText = 'Обновить статус'
  }
}

addForm.addEventListener('submit', async e => {
  e.preventDefault()
  errorMsg.innerText = ''

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput.value })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Не удалось добавить сайт')
    }

    urlInput.value = ''
    await loadSites()
  } catch (error) {
    errorMsg.innerText = errorMessage.message
  }
})

refreshBtn.addEventListener('click', loadSites)

loadSites()