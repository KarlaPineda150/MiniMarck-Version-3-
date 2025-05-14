// Eliminar producto con animación
document.addEventListener('DOMContentLoaded', function () {
    const contenedor = document.getElementById('contenedor-productos');
    const token = document.getElementById('RequestVerificationToken').value;

    contenedor.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-delete');

        if (btn) {
            const id = btn.dataset.id;
            const url = btn.dataset.url;
            const card = btn.closest('.producto-card');

            Swal.fire({
                title: '¿Eliminar producto?',
                text: "¡Esta acción no se puede deshacer!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'RequestVerificationToken': token,
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(response => {
                            if (response.status === 404) throw new Error('Producto no encontrado');
                            if (!response.ok) throw new Error('Error en el servidor');
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                // Animación de eliminación
                                card.style.transition = 'all 0.3s';
                                card.style.opacity = '0';
                                card.style.transform = 'scale(0.8)';

                                setTimeout(() => {
                                    card.remove();
                                    // Actualizar contador
                                    const count = document.querySelectorAll('.producto-card').length;
                                    document.getElementById('contador-productos').textContent =
                                        `(Mostrando ${count} productos)`;
                                }, 300);

                                Swal.fire('¡Éxito!', data.message, 'success');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            Swal.fire('Error', error.message, 'error');
                        });
                }
            });
        }
    });
});

// Función opcional para actualizar contador
function actualizarContadorProductos() {
    const contador = document.querySelector('#contador-productos');
    if (contador) {
        const cantidad = document.querySelectorAll('.producto-card').length;
        contador.textContent = `Mostrando ${cantidad} productos`;
    }
} ('DOMContentLoaded', function () {
    // Delegación de eventos para elementos dinámicos
    document.getElementById('contenedor-productos').addEventListener('click', function (e) {
        if (e.target.closest('.btn-delete')) {
            const btn = e.target.closest('.btn-delete');
            const id = btn.dataset.id;
            const card = btn.closest('.producto-card');

            Swal.fire({
                title: '¿Estás seguro?',
                text: "¡No podrás revertir esta acción!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/Admin/Producto/Delete/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
                        }
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Animación de eliminación
                                card.style.transition = 'all 0.3s';
                                card.style.opacity = '0';
                                setTimeout(() => card.remove(), 300);

                                Swal.fire(
                                    '¡Eliminado!',
                                    data.message,
                                    'success'
                                );
                            }
                        })
                        .catch(error => {
                            Swal.fire(
                                'Error',
                                'No se pudo eliminar el producto',
                                'error'
                            );
                        });
                }
            });
        }
    });
});

// Cargar nuevo producto dinámicamente
function agregarProductoALista(producto) {
    const contenedor = document.getElementById('contenedor-productos');

    const productoHTML = `
    <div class="col-md-4 mb-4 producto-card" data-producto-id="${producto.id}">
        <div class="card h-100">
            <img src="${producto.imagenUrl}" class="card-img-top" 
                 style="height: 200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text text-muted small">${producto.descripcion}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">${producto.categoriaNombre}</span>
                    <span class="text-success fw-bold">$${producto.precio}</span>
                </div>
                <div class="mt-3">
                    <span class="text-muted small">Stock: ${producto.stock}</span>
                    <div class="mt-2 d-flex gap-2">
                        <a href="/Admin/Producto/Edit/${producto.id}" 
                           class="btn btn-warning btn-sm">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="@producto.Id">
                            <i class="far fa-trash-alt"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-transparent">
                <a href="/Admin/Producto/Details/${producto.id}" 
                   class="btn btn-link p-0 text-decoration-none">
                    Ver detalles completos
                </a>
            </div>
        </div>
    </div>`;

    contenedor.insertAdjacentHTML('afterbegin', productoHTML);
}

// Modificar el submit del formulario
document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch(this.action, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                agregarProductoALista(data.producto);
                Swal.fire('¡Éxito!', 'Producto creado correctamente', 'success');
                this.reset();
            }
        })
        .catch(error => console.error('Error:', error));
});