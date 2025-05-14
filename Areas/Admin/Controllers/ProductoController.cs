using Microsoft.AspNetCore.Mvc;
using MiniMarck.AccesoDatos.Data.Repository;
using MiniMarck.AccesoDatos.Data.Repository.IRepository;
using MiniMarck.Models;
using MiniMarck.Models.ViewModels;
using MiniMarck_Version_3_.Data;

namespace MiniMarck_Version_3_.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class ProductoController : Controller
    {
        private readonly IContenedorTrabajo _contenedorTrabajo;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public ProductoController(IContenedorTrabajo contenedorTrabajo, IWebHostEnvironment hostingEnvironment)
        {
            _contenedorTrabajo = contenedorTrabajo;
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            var productos = _contenedorTrabajo.Producto.GetAll(includeProperties: "Categoria,Proveedor").ToList();

            return View(productos); // Siempre devuelve una lista (aunque esté vacía)
        }

        [HttpGet]
        public IActionResult Create()
        {
            var vm = new ProductoVM
            {
                Categorias = _contenedorTrabajo.Categoria.GetListaCategorias(),
                Proveedores = _contenedorTrabajo.Proveedor.GetListaProveedores()
            };
            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(ProductoVM vm)
        {
            // 1) Recargar siempre las listas antes de devolver la vista
            vm.Categorias = _contenedorTrabajo.Categoria.GetListaCategorias();
            vm.Proveedores = _contenedorTrabajo.Proveedor.GetListaProveedores();

            // 2) Validación del model binder: sólo comprueba las propiedades con [Required]
            if (!ModelState.IsValid)
                return View(vm);

            // 3) Mapear manualmente de VM → entidad Producto
            var producto = new Producto
            {
                Nombre = vm.Nombre,
                Descripcion = vm.Descripcion,
                Precio = vm.Precio,
                Stock = vm.Stock,
                CategoriaId = vm.CategoriaId,
                ProveedorId = vm.ProveedorId,
                FechaCreacion = DateTime.Now
            };

            // 4) Procesar el archivo de imagen
            var archivo = vm.Imagen;
            string wwwRoot = _hostingEnvironment.WebRootPath;
            string fileId = Guid.NewGuid().ToString();
            var carpeta = Path.Combine(wwwRoot, "imagenes", "productos");
            var ext = Path.GetExtension(archivo.FileName);

            // Asegúrate de que la carpeta exista
            if (!Directory.Exists(carpeta))
                Directory.CreateDirectory(carpeta);

            string fullPath = Path.Combine(carpeta, fileId + ext);
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                archivo.CopyTo(stream);
            }
            producto.ImagenUrl = $"/imagenes/productos/{fileId}{ext}";

            // 5) Calcular FechaCaducidad según la categoría
            var categoria = _contenedorTrabajo.Categoria.Get(producto.CategoriaId);
            producto.FechaCaducidad = DateTime.Now.AddDays(categoria?.DiasCaducidad ?? 30);

            // 6) Guardar en la base de datos
            _contenedorTrabajo.Producto.Add(producto);
            _contenedorTrabajo.Save();

            // (Opcional) actualizar fecha de caducidad por separado si tu repo lo requiere
            _contenedorTrabajo.Producto.UpdateFechaCaducidad(producto.Id);

            // 7) Redirigir al índice
            return RedirectToAction(nameof(Index));
        }


        [HttpGet]
        public IActionResult Edit(int id)
        {
            // 1) Recupera la entidad
            var producto = _contenedorTrabajo.Producto.Get(id);
            if (producto == null) return NotFound();

            // 2) Mapea la entidad a tu VM
            var vm = new ProductoVM
            {
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                CategoriaId = producto.CategoriaId,
                ProveedorId = producto.ProveedorId,
                ImagenUrl = producto.ImagenUrl,
                Categorias = _contenedorTrabajo.Categoria.GetListaCategorias(),
                Proveedores = _contenedorTrabajo.Proveedor.GetListaProveedores()
            };

            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(ProductoVM vm)
        {
            // 1) Recarga los dropdowns
            vm.Categorias = _contenedorTrabajo.Categoria.GetListaCategorias();
            vm.Proveedores = _contenedorTrabajo.Proveedor.GetListaProveedores();

            if (!ModelState.IsValid)
                return View(vm);

            // 2) Trae la entidad de la BD
            var producto = _contenedorTrabajo.Producto.Get(vm.Id);
            if (producto == null) return NotFound();

            // 3) Actualiza campos escalares
            producto.Nombre = vm.Nombre;
            producto.Descripcion = vm.Descripcion;
            producto.Precio = vm.Precio;
            producto.Stock = vm.Stock;
            producto.CategoriaId = vm.CategoriaId;
            producto.ProveedorId = vm.ProveedorId;

            // 4) Si el usuario subió una nueva imagen, la procesas
            if (vm.Imagen != null)
            {
                // Borra la antigua (opcional)
                var wwwRoot = _hostingEnvironment.WebRootPath;
                var rutaAntigua = Path.Combine(wwwRoot, producto.ImagenUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(rutaAntigua))
                    System.IO.File.Delete(rutaAntigua);

                // Guarda la nueva
                var fileId = Guid.NewGuid().ToString();
                var ext = Path.GetExtension(vm.Imagen.FileName);
                var carpeta = Path.Combine(wwwRoot, "imagenes", "productos");
                if (!Directory.Exists(carpeta))
                    Directory.CreateDirectory(carpeta);

                var fullPath = Path.Combine(carpeta, fileId + ext);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                    vm.Imagen.CopyTo(stream);

                producto.ImagenUrl = $"/imagenes/productos/{fileId}{ext}";
            }

            // 5) Guarda cambios y actualiza caducidad si es necesario
            _contenedorTrabajo.Save();
            _contenedorTrabajo.Producto.UpdateFechaCaducidad(producto.Id);

            return RedirectToAction(nameof(Index));
        } 



        #region API
        [HttpGet]
        public IActionResult GetAll()
        {
            return Json(new { data = _contenedorTrabajo.Producto.GetAll(includeProperties: "Categoria,Proveedor") });
        }

        [HttpDelete("Delete/{id}")] // Ruta específica para DELETE
        [ValidateAntiForgeryToken] // Asegurar validación del token
        public IActionResult Delete(int id)
        {
            try
            {
                var producto = _contenedorTrabajo.Producto.Get(id);
                if (producto == null)
                    return Json(new { success = false, message = "Producto no encontrado" });

                // Eliminar imagen
                if (!string.IsNullOrEmpty(producto.ImagenUrl))
                {
                    var rutaImagen = Path.Combine(_hostingEnvironment.WebRootPath,
                                                producto.ImagenUrl.TrimStart('/'));
                    if (System.IO.File.Exists(rutaImagen))
                        System.IO.File.Delete(rutaImagen);
                }

                _contenedorTrabajo.Producto.Remove(producto);
                _contenedorTrabajo.Save();

                return Json(new { success = true, message = "¡Producto eliminado!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error interno: " + ex.Message });
            }
        }

        #endregion
    }
}
