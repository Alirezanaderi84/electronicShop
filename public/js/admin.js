const deleteProdduct = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value
    const productElement = btn.closest('article')
    fetch(`/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {

        }
    }).then(result => {
        return result.json()
    })
        .then(data => {
            console.log(data)
           productElement.parentNode.removeChild(productElement)
        }
        ).catch(err => {
            console.log(err)
            alert('خطا در حذف محصول')
        })
}
