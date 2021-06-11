import {canUseDOM} from 'vtex.render-runtime'

import {PixelMessage} from './typings/events'
declare global {
  interface Window { _edrone: any; }
}

export function handleEvents(e: PixelMessage) {
  window._edrone = window._edrone || {}
  const _edrone = window._edrone
  switch (e.data.eventName) {
    case 'vtex:userData': {
      const {email} = e.data
      if (email != null) {
        localStorage.setItem('edroneEmail', email)
      }
      break
    }
    case 'vtex:orderPlaced': {
      const {transactionProducts, transactionId, transactionTotal, transactionCurrency, visitorContactInfo} = e.data
      let email = null
      const expression = /\S+@\S+/
      visitorContactInfo.map((info) => {
        if (expression.test(info)) {
          email = info
        }
      })
      _edrone.email = email;
      _edrone.action_type = 'order';
      _edrone.product_titles = transactionProducts.map((product) => {
        return product.name
      }).join('|');
      _edrone.product_ids = transactionProducts.map((product) => {
        return product.id
      }).join('|');
      _edrone.product_skus = transactionProducts.map((product) => {
        return product.sku
      }).join('|');
      _edrone.product_counts = transactionProducts.map((product) => {
        return product.quantity
      }).join('|');
      _edrone.product_category_ids = transactionProducts.map((product) => {
        return product.categoryId
      }).join('|');
      _edrone.product_category_names = transactionProducts.map((product) => {
        return product.category
      }).join('|');
      _edrone.order_id = transactionId;
      _edrone.base_currency = transactionCurrency;
      _edrone.order_currency = transactionCurrency;
      _edrone.base_payment_value = transactionTotal;
      _edrone.order_payment_value = transactionTotal;
      _edrone.init();
      break
    }
    case 'vtex:productView': {
      const {product} = e.data

      _edrone.product_ids = product.productId
      _edrone.product_titles = encodeURIComponent(product.productName)
      _edrone.product_images = encodeURIComponent(product.items.map((item) => {
        return item.imageUrl
      }).join("|"))
      _edrone.product_urls = encodeURIComponent(product.detailUrl)
      _edrone.product_availability = 1
      _edrone.product_category_ids = product.categoryId
      _edrone.product_category_names = product.categoryTree.map((category) => {
        return category.name
      }).join("|")
      _edrone.action_type = 'product_view'
      _edrone.init()
      break
    }
    case 'vtex:addToCart': {
      const {items} = e.data
      items.forEach((item) => {
        _edrone.product_ids = encodeURIComponent(item.productId)
        _edrone.product_titles = encodeURIComponent(item.name)
        _edrone.product_images = encodeURIComponent(item.imageUrl)
        _edrone.product_urls = encodeURIComponent(item.detailUrl)
        _edrone.product_category_names = encodeURIComponent(item.category)
        _edrone.action_type = "add_to_cart"
        _edrone.init()
      })
      break
    }
    default: {
      break
    }
  }
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
