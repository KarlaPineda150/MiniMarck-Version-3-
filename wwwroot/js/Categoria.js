$(document).ready(function () {
    loadDataTable();
});

function loadDataTable() {
    $('#tblCategorias').DataTable({
        "ajax": {
            "url": "/Admin/Categoria/GetAll",
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "error": function (xhr, status, error) {
                console.error("Error en AJAX:", status, error);
            }
        },
        "columns": [
            { "data": "id", "visible": true },
            { "data": "nombre", "width": "40%" },
            {
                "data": "diasCaducidad",
                "width": "20%",
                "render": function (data) {
                    return `<span class="badge badge-info">${data} días</span>`;
                }
            },
            {
                "data": "id",
                "render": function (data) {
                    return `
                        <div class="text-center">
                            <a href="/Admin/Categoria/Edit/${data}" class="btn btn-warning btn-sm">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button onclick="deleteCategoria(${data})" class="btn btn-danger btn-sm ml-2">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                },
                "width": "40%"
            }
        ],
        "language": {
            "emptyTable": "No hay categorías registradas",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ categorías",
            "infoEmpty": "Mostrando 0 a 0 de 0 categorías",
            "infoFiltered": "(filtrado de _MAX_ categorías totales)",
            "search": "Buscar:",
            "lengthMenu": "Mostrar _MENU_ categorías",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "zeroRecords": "No se encontraron coincidencias",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            }
        },
        "width": "100%"
    });
}

function deleteCategoria(id) {
    Swal.fire({
        title: '¿Eliminar categoría?',
        text: "¡Los productos asociados usarán esta configuración de caducidad!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/Admin/Categoria/Delete/${id}`,
                type: 'DELETE',
                success: function (data) {
                    if (data.success) {
                        $('#tblCategorias').DataTable().ajax.reload();
                        Swal.fire(
                            '¡Eliminada!',
                            data.message,
                            'success'
                        );
                    } else {
                        Swal.fire(
                            'Error',
                            data.message,
                            'error'
                        );
                    }
                }
            });
        }
    });
}