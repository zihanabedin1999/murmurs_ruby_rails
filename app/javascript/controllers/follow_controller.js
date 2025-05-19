import { Controller } from "stimulus"
import Rails from "@rails/ujs"

export default class extends Controller {
  static targets = ["button"]
  
  follow(event) {
    event.preventDefault()
    
    const userId = this.buttonTarget.dataset.userId
    
    fetch(`/api/users/${userId}/follow`, {
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
        this.buttonTarget.textContent = 'Unfollow'
        this.buttonTarget.classList.remove('bg-blue-500', 'hover:bg-blue-600')
        this.buttonTarget.classList.add('bg-red-500', 'hover:bg-red-600')
        this.buttonTarget.setAttribute('data-action', 'click->follow#unfollow')
      } else {
        console.error('Failed to follow user:', data.error)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
  }
  
  unfollow(event) {
    event.preventDefault()
    
    const userId = this.buttonTarget.dataset.userId
    
    fetch(`/api/users/${userId}/follow`, {
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
        this.buttonTarget.textContent = 'Follow'
        this.buttonTarget.classList.remove('bg-red-500', 'hover:bg-red-600')
        this.buttonTarget.classList.add('bg-blue-500', 'hover:bg-blue-600')
        this.buttonTarget.setAttribute('data-action', 'click->follow#follow')
      } else {
        console.error('Failed to unfollow user:', data.error)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
  }
}
