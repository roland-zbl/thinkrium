// Basic interactions for the prototype
document.addEventListener('DOMContentLoaded', () => {
  // 1. Sidebar Item Selection
  const navItems = document.querySelectorAll('.nav-items-primary .nav-item')
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelector('.nav-item.active').classList.remove('active')
      item.classList.add('active')
    })
  })

  // 2. Filter Pill Selection
  const pills = document.querySelectorAll('.filter-pills .pill')
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelector('.pill.active').classList.remove('active')
      pill.classList.add('active')
    })
  })

  // 3. Subscription Selection
  const subItems = document.querySelectorAll('.sub-item:not(.checkbox):not(.block-rule)')
  subItems.forEach((item) => {
    item.addEventListener('click', () => {
      // Remove active from all sub-items
      document.querySelectorAll('.sub-item.active').forEach((el) => el.classList.remove('active'))
      item.classList.add('active')
    })
  })

  // 4. Feed Card Interactions
  const cards = document.querySelectorAll('.feed-card')
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // If clicking buttons, don't trigger card click
      if (e.target.closest('button')) return

      // Visual feedback for opening article
      console.log('Open article:', card.querySelector('h2').textContent)

      // Mark as read visually
      card.classList.remove('unread')
    })
  })

  const actionBtns = document.querySelectorAll('.action-btn')
  actionBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation() // Prevent card click
      const action = btn.innerText
      const cardTitle = btn.closest('.feed-card').querySelector('h2').textContent
      console.log(`Action ${action} on ${cardTitle}`)

      // Toggle state example
      if (action.includes('保存')) {
        btn.style.color = 'var(--accent)'
      }
    })
  })

  console.log('Prototype AI Logic Loaded')
})
