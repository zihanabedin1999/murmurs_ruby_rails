import { Controller } from "stimulus"
import Rails from "@rails/ujs"

export default class extends Controller {
  static targets = ["button", "count"]
  
  like(event) {
    event.preventDefault()
    
    const murmurId = this.buttonTarget.dataset.murmurId
    
    fetch(`/api/murmurs/${murmurId}/like`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': Rails.csrfToken(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        this.buttonTarget.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
          </svg>
        `
        this.buttonTarget.classList.remove('text-gray-500')
        this.buttonTarget.classList.add('text-red-500')
        this.buttonTarget.setAttribute('data-action', 'click->like#unlike')
        this.countTarget.textContent = data.like_count
      } else {
        console.error('Failed to like murmur:', data.error)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
  }
  
  unlike(event) {
    event.preventDefault()
    
    const murmurId = this.buttonTarget.dataset.murmurId
    
    fetch(`/api/murmurs/${murmurId}/like`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': Rails.csrfToken(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        this.buttonTarget.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        `
        this.buttonTarget.classList.remove('text-red-500')
        this.buttonTarget.classList.add('text-gray-500')
        this.buttonTarget.setAttribute('data-action', 'click->like#like')
        this.countTarget.textContent = data.like_count
      } else {
        console.error('Failed to unlike murmur:', data.error)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
  }
}
