$(document).ready(function () {
    inicializarDataTable();
});

function inicializarDataTable() {
    dataTable = $("#tablaProveedores").DataTable({
        "ajax": {
            "url": "/Admin/Proveedor/GetAll",
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "error": function (xhr, status, error) {
                console.error("Error en AJAX:", status, error);
            }
        },
        "columns": [
            { "data": "id", "visible": true },
            { "data": "nombre", "width": "25%" },
            { "data": "telefono", "width": "20%" },
            { "data": "direccion", "width": "30%" },
            {
                "data": "id",
                "render": function (data) {
                    return `<div class="text-center">
                        <a href="/Admin/Proveedor/Edit/${data}" class="btn btn-success btn-sm">
                            <i class="far fa-edit"></i> Editar
                        </a>
                        <button onclick="eliminarProveedor(${data})" class="btn btn-danger btn-sm ml-2">
                            <i class="far fa-trash-alt"></i> Borrar
                        </button>
                    </div>`;
                },
                "width": "25%",
                "orderable": false
            }
        ],
        "language": {
            "decimal": "",
            "emptyTable": "No hay proveedores registrados",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ proveedores",
            "infoEmpty": "Mostrando 0 a 0 de 0 proveedores",
            "infoFiltered": "(filtrado de _MAX_ proveedores totales)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Mostrar _MENU_ proveedores",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "search": "Buscar:",
            "zeroRecords": "No se encontraron proveedores",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            }
        },
        "responsive": true
    });
}

// Función de eliminación actualizada
function eliminarProveedor(id) {
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
            $.ajax({
                url: `/Admin/Proveedor/Delete/${id}`,
                type: 'DELETE',
                success: function (response) {
                    if (response.success) {
                        Swal.fire('¡Eliminado!', response.message, 'success');
                        dataTable.ajax.reload(null, false); // Recarga sin resetear paginación
                    } else {
                        Swal.fire('Error', response.message, 'error');
                    }
                },
                error: function (xhr) {
                    Swal.fire('Error', 'Ocurrió un error al eliminar', 'error');
                }
            });
        }
    });
}